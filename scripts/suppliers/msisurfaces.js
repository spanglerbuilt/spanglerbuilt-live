// msisurfaces.com — quartz countertops, porcelain tile, LVP flooring, natural stone
// Strategy: scrape collection listing pages for product slugs → visit each product page → JSON-LD

const { get, rateLimit, saveJSON, assignTier, sleep } = require('./_shared')

const BASE = 'https://www.msisurfaces.com'

// Collection listing pages → product slug pattern
const COLLECTIONS = [
  { listUrl: '/quartz-countertops/quartz-collections/', slugPattern: /href="(\/quartz-countertops\/[a-z0-9-]+-quartz\/)"/g, category: 'Countertops', subcategory: 'Quartz', unit: 'SF', priceRange: [65, 120] },
  { listUrl: '/porcelain-tile/',                         slugPattern: /href="(\/porcelain-tile\/[a-z0-9-]+\/)"/g,            category: 'Tile',        subcategory: 'Porcelain', unit: 'SF', priceRange: [4, 18] },
  { listUrl: '/natural-stone/',                          slugPattern: /href="(\/natural-stone\/[a-z0-9-]+\/)"/g,             category: 'Tile',        subcategory: 'Natural Stone', unit: 'SF', priceRange: [8, 30] },
  { listUrl: '/luxury-vinyl-flooring/',                  slugPattern: /href="(\/luxury-vinyl-flooring\/[a-z0-9-]+\/)"/g,     category: 'Flooring',    subcategory: 'LVP', unit: 'SF', priceRange: [3, 8] },
  { listUrl: '/backsplash-tile/',                        slugPattern: /href="(\/backsplash-tile\/[a-z0-9-]+\/)"/g,           category: 'Tile',        subcategory: 'Backsplash', unit: 'SF', priceRange: [5, 20] },
]

async function scrapeProduct(slug, collection) {
  const url = BASE + slug
  let html
  try { html = await get(url) } catch(e) { return null }
  if (!html) return null

  // JSON-LD — MSI has clean Product schema on every product page
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1])
      if (ld['@type'] === 'Product') {
        // MSI doesn't sell direct — use mid-range price estimate for catalog
        const midPrice = (collection.priceRange[0] + collection.priceRange[1]) / 2
        const displayPrice = midPrice.toFixed(2)

        return {
          supplier:     'MSI Surfaces',
          category:     collection.category,
          subcategory:  collection.subcategory,
          brand:        'MSI Surfaces',
          product_name: ld.name || '',
          sku:          ld.productID || ld.sku || '',
          description:  ld.description || '',
          photo_url:    Array.isArray(ld.image) ? ld.image[0] : (ld.image || ''),
          product_url:  url,
          unit:         collection.unit,
          price:        parseFloat(displayPrice),
          tier:         assignTier(midPrice, collection.category),
          finish:       '',
          size:         '',
        }
      }
    } catch(e) {}
  }

  // Fallback: extract from meta tags
  const title = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || ''
  const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || ''
  const desc  = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''

  if (!title) return null
  const midPrice = (collection.priceRange[0] + collection.priceRange[1]) / 2
  return {
    supplier:     'MSI Surfaces',
    category:     collection.category,
    subcategory:  collection.subcategory,
    brand:        'MSI Surfaces',
    product_name: title.replace(/ \| MSI.*$/i, '').trim(),
    sku:          '',
    description:  desc,
    photo_url:    image,
    product_url:  url,
    unit:         collection.unit,
    price:        parseFloat(midPrice.toFixed(2)),
    tier:         assignTier(midPrice, collection.category),
    finish:       '',
    size:         '',
  }
}

async function scrape() {
  console.log('🏗  Scraping MSI Surfaces...')
  const allProducts = []

  for (const collection of COLLECTIONS) {
    console.log(`  → ${collection.subcategory}`)
    let html
    try { html = await get(BASE + collection.listUrl) } catch(e) {
      console.log(`  ✗ ${collection.subcategory}: ${e.message}`)
      continue
    }

    // Extract product slugs from listing page
    const slugs = []
    const seen  = new Set()
    let match
    const re = new RegExp(collection.slugPattern.source, 'g')
    while ((match = re.exec(html)) !== null) {
      if (!seen.has(match[1])) { seen.add(match[1]); slugs.push(match[1]) }
    }

    // Limit to 12 per category to keep runtime reasonable
    const limited = slugs.slice(0, 12)
    console.log(`    Found ${slugs.length} products — scraping ${limited.length}`)

    for (const slug of limited) {
      await rateLimit()
      const product = await scrapeProduct(slug, collection)
      if (product) allProducts.push(product)
    }
  }

  console.log(`  ✓ Saved ${allProducts.length} products`)
  saveJSON('msisurfaces', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
