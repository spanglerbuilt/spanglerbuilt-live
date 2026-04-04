// pages/api/admin/refresh-catalog-images.js
// POST {} → processes catalog_materials rows missing photo_url using Google Custom Search
// Returns: { ok, filled, skipped, errors, total }
//
// Processes up to 50 rows per call (to avoid Vercel timeout).
// Call again to continue — each call picks up the next batch of nulls.

import { getAdminClient } from '../../../lib/supabase-server'

const GOOGLE_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY
const CX         = process.env.GOOGLE_SEARCH_ENGINE_ID || 'e1225e3fc865347c6'
const DELAY_MS   = 500
const BATCH_SIZE = 50

function sleep(ms) { return new Promise(function(r) { return setTimeout(r, ms) }) }

async function searchProduct(brand, product_name, category) {
  if (!GOOGLE_KEY) throw new Error('GOOGLE_SEARCH_API_KEY not configured')

  const q = [brand, product_name, category, 'product photo'].filter(Boolean).join(' ')

  const url = new URL('https://www.googleapis.com/customsearch/v1')
  url.searchParams.set('key',        GOOGLE_KEY)
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
    throw new Error(data.error?.message || 'Google API error ' + res.status)
  }

  const items = data.items || []
  if (!items.length) return null

  const nameLower  = (product_name || '').toLowerCase()
  const brandLower = (brand || '').toLowerCase()

  const scored = items.map(function(item) {
    const link = (item.link || '').toLowerCase()
    const ctx  = (item.snippet || '').toLowerCase()
    let score  = 0
    if (brandLower && link.includes(brandLower))             score += 2
    if (nameLower && link.includes(nameLower.split(' ')[0])) score += 1
    if (nameLower && ctx.includes(nameLower.split(' ')[0]))  score += 1
    if (/icon|avatar|logo|sprite|placeholder/i.test(link))  score -= 3
    return { photo_url: item.link, product_url: item.image?.contextLink || null, score }
  })

  scored.sort(function(a, b) { return b.score - a.score })
  return scored[0]
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  if (!GOOGLE_KEY) {
    return res.status(503).json({ error: 'GOOGLE_SEARCH_API_KEY not configured in environment variables' })
  }

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch rows with missing photo_url
  const { data: rows, error: fetchErr } = await supabase
    .from('catalog_materials')
    .select('id, brand, product_name, category, manufacturer_url')
    .or('photo_url.is.null,photo_url.eq.')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (fetchErr) return res.status(500).json({ error: fetchErr.message })

  if (!rows || rows.length === 0) {
    return res.status(200).json({ ok: true, filled: 0, skipped: 0, errors: 0, total: 0, message: 'All items already have photos.' })
  }

  const results = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      const result = await searchProduct(row.brand, row.product_name, row.category)

      if (!result || !result.photo_url) {
        results.push({ id: row.id, status: 'no_result' })
      } else {
        const update = { photo_url: result.photo_url }
        // Save product page URL into manufacturer_url if not already set
        if (result.product_url && !row.manufacturer_url) {
          update.manufacturer_url = result.product_url
        }

        const { error: updateErr } = await supabase
          .from('catalog_materials')
          .update(update)
          .eq('id', row.id)

        if (updateErr) throw new Error(updateErr.message)

        results.push({
          id:          row.id,
          status:      'updated',
          photo_url:   result.photo_url,
          product_url: result.product_url || null,
        })
      }
    } catch (err) {
      results.push({ id: row.id, status: 'error', error: err.message })
    }

    // 500ms delay between requests (skip on last item)
    if (i < rows.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  const filled  = results.filter(function(r) { return r.status === 'updated' }).length
  const skipped = results.filter(function(r) { return r.status === 'no_result' }).length
  const errors  = results.filter(function(r) { return r.status === 'error' }).length

  return res.status(200).json({
    ok:      true,
    filled,
    skipped,
    errors,
    total:   rows.length,
    results,
  })
}

// Extend Vercel timeout to 5 minutes for large catalogs
export const config = {
  api: { responseLimit: false },
  maxDuration: 300,
}
