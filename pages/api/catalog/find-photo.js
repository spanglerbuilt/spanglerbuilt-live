// Google Custom Search — image search for a catalog product
// POST { brand, product_name, category } → { ok, url }
// Also supports POST { ids: [uuid, ...] } for bulk fill (up to 10 at a time)

import { getAdminClient } from '../../../lib/supabase-server'

const API_KEY = process.env.GOOGLE_SEARCH_API_KEY
const CX      = process.env.GOOGLE_SEARCH_ENGINE_ID

// Search Google Images for a product photo, return best image URL
async function searchImage(brand, product_name, category) {
  if (!API_KEY || !CX) throw new Error('Google Search API not configured')

  // Build a tight query: brand + name + category + "product photo"
  const parts = [brand, product_name, category, 'product photo'].filter(Boolean)
  const q     = parts.join(' ')

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key',        API_KEY)
  url.searchParams.set('cx',         CX)
  url.searchParams.set('q',          q)
  url.searchParams.set('searchType', 'image')
  url.searchParams.set('num',        '5')
  url.searchParams.set('imgType',    'photo')
  url.searchParams.set('safe',       'active')
  url.searchParams.set('imgSize',    'medium')

  const res  = await fetch(url.toString())
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error?.message || `Google API error ${res.status}`)
  }

  const items = data.items || []
  if (!items.length) return null

  // Prefer items where the image link contains the brand name or product name
  const nameLower  = product_name.toLowerCase()
  const brandLower = (brand || '').toLowerCase()

  const scored = items.map(item => {
    const link = (item.link || '').toLowerCase()
    const ctx  = (item.snippet || '').toLowerCase()
    let score  = 0
    if (brandLower && link.includes(brandLower))  score += 2
    if (link.includes(nameLower.split(' ')[0]))   score += 1
    if (ctx.includes(nameLower.split(' ')[0]))    score += 1
    // Avoid stock/icon/thumb images
    if (/icon|avatar|logo|sprite|placeholder/i.test(link)) score -= 3
    return { url: item.link, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].url
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!API_KEY || !CX) {
    return res.status(503).json({ error: 'GOOGLE_SEARCH_API_KEY / GOOGLE_SEARCH_ENGINE_ID not set' })
  }

  // ── Single item lookup ──────────────────────────────────────────────────────
  const { brand, product_name, category, ids } = req.body

  if (!ids) {
    // Single-item mode
    if (!product_name) return res.status(400).json({ error: 'product_name required' })
    try {
      const url = await searchImage(brand || '', product_name, category || '')
      return res.json({ ok: true, url })
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message })
    }
  }

  // ── Bulk fill mode: ids = array of catalog_materials UUIDs ──────────────────
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids must be a non-empty array' })
  }
  if (ids.length > 20) {
    return res.status(400).json({ error: 'Max 20 ids per request (API quota)' })
  }

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch the rows
  const { data: rows, error: fetchErr } = await supabase
    .from('catalog_materials')
    .select('id, brand, product_name, category, photo_url')
    .in('id', ids)

  if (fetchErr) return res.status(500).json({ error: fetchErr.message })

  const results = []
  for (const row of rows) {
    // Skip if already has a photo
    if (row.photo_url && row.photo_url.trim()) {
      results.push({ id: row.id, skipped: true })
      continue
    }
    try {
      const url = await searchImage(row.brand || '', row.product_name, row.category || '')
      if (url) {
        await supabase
          .from('catalog_materials')
          .update({ photo_url: url })
          .eq('id', row.id)
        results.push({ id: row.id, url })
      } else {
        results.push({ id: row.id, url: null })
      }
    } catch (e) {
      results.push({ id: row.id, error: e.message })
    }
    // Small delay to avoid rate-limit bursts
    await new Promise(r => setTimeout(r, 120))
  }

  const filled  = results.filter(r => r.url).length
  const skipped = results.filter(r => r.skipped).length
  return res.json({ ok: true, filled, skipped, total: rows.length, results })
}
