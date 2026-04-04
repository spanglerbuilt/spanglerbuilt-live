// cabinets.com — stock and semi-custom cabinet lines
// Strategy: scrape category pages → product cards via HTML → JSON-LD / meta fallback

const { get, rateLimit, saveJSON, assignTier } = require('./_shared')

const BASE = 'https://www.cabinets.com'

const SEARCHES = [
  { path: '/kitchen-cabinets',   subcategory: 'Kitchen Cabinets',  priceHint: 280 },
  { path: '/bathroom-vanities',  subcategory: 'Vanity Cabinets',   priceHint: 420 },
  { path: '/closets',            subcategory: 'Closet Cabinets',   priceHint: 180 },
]

async function scrapeCategory(search) {
  const url = BASE + search.path
  let html
  try { html = await get(url) } catch(e) {
    console.log(`  ✗ ${search.subcategory}: ${e.message}`)
    return []
  }

  const products = []

  // Try JSON-LD
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const ld = JSON.parse(m[1])
      const items = Array.isArray(ld) ? ld : (ld['@graph'] || [ld])
      for (const item of items) {
        if (item['@type'] === 'Product' && item.name) {
          const price = search.priceHint
          products.push({
            supplier:     'Cabinets.com',
            category:     'Cabinets',
            subcategory:  search.subcategory,
            brand:        (item.brand && item.brand.name) || 'Cabinets.com',
            product_name: item.name,
            sku:          item.sku || item.productID || '',
            description:  item.description || '',
            photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
            product_url:  (item.offers && item.offers.url) || url,
            unit:         'EA',
            price,
            tier:         assignTier(price, 'Cabinets'),
            finish:       '',
            size:         '',
          })
        }
      }
    } catch(e) {}
  }

  // HTML card fallback — cabinets.com shows style names like "Shaker Maple Natural"
  if (products.length === 0) {
    // Style names appear as text in heading/link elements near price blocks
    const styleRe   = /(?:Starting at|<h[23][^>]*>)\s*[^<]*<[^>]*>\s*([A-Z][A-Za-z ]{5,60})\s*</g
    const priceRe   = /Starting at.*?\$[\d,]+\s*\$\s*([\d,]+)/g
    const imgRe     = /<img[^>]+(?:data-src|src)="([^"]*(?:cabinets\.com|cloudfront)[^"]*\.(?:jpg|png|webp)[^"]*)"/gi

    const names  = [...html.matchAll(styleRe)].map(m => m[1].trim()).filter(n => n.length > 4)
    const prices = [...html.matchAll(priceRe)].map(m => parseFloat(m[1].replace(/,/g,'')))
    const imgs   = [...html.matchAll(imgRe)].map(m => m[1])

    // Also try alt text on product images as name fallback
    const altRe   = /alt="([A-Z][A-Za-z ]{5,60}(?:Cabinet|Maple|Cherry|Oak|Birch|White|Gray|Shaker|Flat|Panel)[^"]*)"/gi
    const altNames = [...html.matchAll(altRe)].map(m => m[1].trim())
    const allNames = [...new Set([...names, ...altNames])].slice(0, 10)

    for (let i = 0; i < allNames.length; i++) {
      const price = prices[i] || search.priceHint
      products.push({
        supplier:     'Cabinets.com',
        category:     'Cabinets',
        subcategory:  search.subcategory,
        brand:        'Cabinets.com',
        product_name: allNames[i],
        sku:          '',
        description:  '',
        photo_url:    imgs[i] || '',
        product_url:  url,
        unit:         'EA',
        price:        price,
        tier:         assignTier(price, 'Cabinets'),
        finish:       '',
        size:         '',
      })
    }
  }

  // OG meta fallback — use page as single generic entry
  if (products.length === 0) {
    const title = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || ''
    const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || ''
    const desc  = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
    if (title && title.length > 5) {
      products.push({
        supplier:     'Cabinets.com',
        category:     'Cabinets',
        subcategory:  search.subcategory,
        brand:        'Cabinets.com',
        product_name: title.replace(/\s*[\|–-]\s*Cabinets\.com.*/i, '').trim(),
        sku:          '',
        description:  desc,
        photo_url:    image,
        product_url:  url,
        unit:         'EA',
        price:        search.priceHint,
        tier:         assignTier(search.priceHint, 'Cabinets'),
        finish:       '',
        size:         '',
      })
    }
  }

  console.log(`    ${search.subcategory}: ${products.length} products`)
  return products
}

async function scrape() {
  console.log('🗄  Scraping Cabinets.com...')
  const allProducts = []

  for (const search of SEARCHES) {
    await rateLimit()
    const products = await scrapeCategory(search)
    allProducts.push(...products)
  }

  console.log(`  ✓ Saved ${allProducts.length} products`)
  saveJSON('cabinets', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
