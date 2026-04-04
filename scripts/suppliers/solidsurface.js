// solidsurface.com — Corian/solid surface countertops and surfaces
// Magento platform — scrape product listing and category pages

const { get, rateLimit, saveJSON, assignTier } = require('./_shared')

const BASE = 'https://www.solidsurface.com'

const SEARCHES = [
  { path: '/solid-surface/',       subcategory: 'Solid Surface',   priceHint: 55 },
  { path: '/products/',            subcategory: 'Solid Surface',   priceHint: 55 },
]

async function scrapeCategory(search) {
  const url = BASE + search.path
  let html
  try { html = await get(url) } catch(e) {
    console.log(`  ✗ ${search.subcategory}: ${e.message}`)
    return []
  }

  const products = []

  // JSON-LD (Magento often has Product schema)
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const ld = JSON.parse(m[1])
      const items = Array.isArray(ld) ? ld : (ld['@graph'] || [ld])
      for (const item of items) {
        if (item['@type'] === 'Product' && item.name) {
          let price = search.priceHint
          try {
            const offer = Array.isArray(item.offers) ? item.offers[0] : item.offers
            if (offer && offer.price) price = parseFloat(offer.price)
          } catch(e) {}
          products.push({
            supplier:     'Solid Surface',
            category:     'Countertops',
            subcategory:  search.subcategory,
            brand:        (item.brand && item.brand.name) || 'Solid Surface',
            product_name: item.name,
            sku:          item.sku || '',
            description:  item.description || '',
            photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
            product_url:  (item.offers && !Array.isArray(item.offers) && item.offers.url) || url,
            unit:         'SF',
            price,
            tier:         assignTier(price, 'Countertops'),
            finish:       '',
            size:         '',
          })
        }
      }
    } catch(e) {}
  }

  // Magento product card HTML fallback
  if (products.length === 0) {
    const nameRe  = /class="[^"]*product[^"]*name[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]{4,80})<\/a>/gi
    const priceRe = /class="[^"]*price[^"]*"[^>]*>\$\s*([\d,]+\.?\d{0,2})/gi
    const imgRe   = /class="[^"]*product[^"]*image[^"]*"[\s\S]*?src="([^"]+\.(?:jpg|png|webp))"/gi

    const names  = [...html.matchAll(nameRe)].map(m => m[1].trim())
    const prices = [...html.matchAll(priceRe)].map(m => parseFloat(m[1].replace(/,/g,'')))
    const imgs   = [...html.matchAll(imgRe)].map(m => m[1])

    for (let i = 0; i < Math.min(names.length, 10); i++) {
      const price = prices[i] || search.priceHint
      products.push({
        supplier:     'Solid Surface',
        category:     'Countertops',
        subcategory:  search.subcategory,
        brand:        'Solid Surface',
        product_name: names[i],
        sku:          '',
        description:  '',
        photo_url:    imgs[i] || '',
        product_url:  url,
        unit:         'SF',
        price,
        tier:         assignTier(price, 'Countertops'),
        finish:       '',
        size:         '',
      })
    }
  }

  // Open Graph fallback — get at least the page as a single product entry
  if (products.length === 0) {
    const title = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || ''
    const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || ''
    const desc  = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
    if (title && title.length > 5) {
      products.push({
        supplier:     'Solid Surface',
        category:     'Countertops',
        subcategory:  search.subcategory,
        brand:        'Solid Surface',
        product_name: title.replace(/\s*[\|–-]\s*Solid Surface.*/i, '').trim(),
        sku:          '',
        description:  desc,
        photo_url:    image,
        product_url:  url,
        unit:         'SF',
        price:        search.priceHint,
        tier:         assignTier(search.priceHint, 'Countertops'),
        finish:       '',
        size:         '',
      })
    }
  }

  console.log(`    ${search.subcategory}: ${products.length} products`)
  return products
}

async function scrape() {
  console.log('🪨  Scraping Solid Surface...')
  const allProducts = []

  for (const search of SEARCHES) {
    await rateLimit()
    const products = await scrapeCategory(search)
    // Deduplicate by name
    for (const p of products) {
      if (!allProducts.find(x => x.product_name === p.product_name)) {
        allProducts.push(p)
      }
    }
  }

  console.log(`  ✓ Saved ${allProducts.length} products`)
  saveJSON('solidsurface', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
