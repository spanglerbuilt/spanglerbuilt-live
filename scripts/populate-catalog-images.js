// scripts/populate-catalog-images.js
// Populates photo_url and product_url for catalog_materials rows that are missing images.
// Uses Google Custom Search API (image search) to find product photos.
//
// Usage:
//   node scripts/populate-catalog-images.js
//   node scripts/populate-catalog-images.js --all    (re-process even rows that have photos)
//   node scripts/populate-catalog-images.js --limit 20

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const GOOGLE_KEY   = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY
const CX           = process.env.GOOGLE_SEARCH_ENGINE_ID || 'e1225e3fc865347c6'

const DELAY_MS = 500   // 500ms between requests to respect rate limits

// ── Args ─────────────────────────────────────────────────────────────────────
const args  = process.argv.slice(2)
const ALL   = args.includes('--all')
const limitArg = args.indexOf('--limit')
const LIMIT = limitArg !== -1 ? parseInt(args[limitArg + 1], 10) : 0

// ── Validate env ─────────────────────────────────────────────────────────────
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env.local')
  process.exit(1)
}
if (!GOOGLE_KEY) {
  console.error('ERROR: GOOGLE_SEARCH_API_KEY must be set in .env.local')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Google Custom Search ──────────────────────────────────────────────────────
async function searchProduct(brand, product_name, category) {
  const parts = [brand, product_name, category, 'product photo'].filter(Boolean)
  const q     = parts.join(' ')

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

  // Score results — prefer items whose URL contains the brand or product name
  const nameLower  = (product_name || '').toLowerCase()
  const brandLower = (brand || '').toLowerCase()

  const scored = items.map(function(item) {
    const link = (item.link || '').toLowerCase()
    const ctx  = (item.snippet || '').toLowerCase()
    let score  = 0
    if (brandLower && link.includes(brandLower))        score += 2
    if (nameLower && link.includes(nameLower.split(' ')[0])) score += 1
    if (nameLower && ctx.includes(nameLower.split(' ')[0]))  score += 1
    if (/icon|avatar|logo|sprite|placeholder/i.test(link))  score -= 3
    return {
      photo_url:   item.link,
      product_url: item.image?.contextLink || null,
      score,
    }
  })

  scored.sort(function(a, b) { return b.score - a.score })
  return scored[0]
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(function(r) { return setTimeout(r, ms) }) }

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('SpanglerBuilt — Catalog Image Populator')
  console.log('CX: ' + CX)
  console.log('Mode: ' + (ALL ? 'ALL rows' : 'missing photo_url only'))
  if (LIMIT) console.log('Limit: ' + LIMIT + ' rows')
  console.log('')

  // Fetch rows from Supabase
  var query = sb
    .from('catalog_materials')
    .select('id, brand, product_name, category, photo_url, manufacturer_url')
    .order('created_at', { ascending: true })

  if (!ALL) {
    query = query.or('photo_url.is.null,photo_url.eq.')
  }

  if (LIMIT > 0) {
    query = query.limit(LIMIT)
  }

  var { data: rows, error } = await query

  if (error) { console.error('Supabase fetch error:', error.message); process.exit(1) }
  if (!rows || rows.length === 0) { console.log('No rows to process.'); return }

  console.log('Processing ' + rows.length + ' rows...\n')

  var filled  = 0
  var skipped = 0
  var errors  = 0

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i]
    var label = '[' + (i + 1) + '/' + rows.length + '] ' + (row.brand || '') + ' ' + (row.product_name || row.id)

    process.stdout.write(label + ' … ')

    try {
      var result = await searchProduct(row.brand, row.product_name, row.category)

      if (!result) {
        console.log('no results')
        skipped++
      } else {
        var update = {}
        if (result.photo_url)                             update.photo_url = result.photo_url
        if (result.product_url && !row.manufacturer_url) update.manufacturer_url = result.product_url

        if (Object.keys(update).length > 0) {
          var { error: updateErr } = await sb
            .from('catalog_materials')
            .update(update)
            .eq('id', row.id)

          if (updateErr) throw new Error(updateErr.message)
          console.log('✓  photo=' + (update.photo_url ? '✓' : '—') + '  page=' + (update.manufacturer_url ? '✓' : '—'))
          filled++
        } else {
          console.log('already set, skipped')
          skipped++
        }
      }
    } catch (err) {
      console.log('ERROR: ' + err.message)
      errors++
    }

    // Rate limit delay (skip on last item)
    if (i < rows.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  console.log('\n─────────────────────────────────')
  console.log('Done.')
  console.log('  Updated : ' + filled)
  console.log('  Skipped : ' + skipped)
  console.log('  Errors  : ' + errors)
  console.log('─────────────────────────────────')
}

main().catch(function(err) {
  console.error('Fatal error:', err)
  process.exit(1)
})
