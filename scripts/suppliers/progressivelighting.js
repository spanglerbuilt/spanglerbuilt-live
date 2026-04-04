// Progressive Lighting catalog scraper
// progressivelighting.com — Atlanta-area lighting showroom
// Categories: Recessed, Pendants, Chandeliers, Vanity, Ceiling Fans, Under Cabinet

const cheerio = require('cheerio')
const { get, rateLimit, saveJSON, logError, assignTier, extractJsonLD, now } = require('./_shared')

const SUPPLIER = 'Progressive Lighting'

const SEARCHES = [
  { subcategory: 'Recessed Lighting',  path: 'collections/recessed-lighting',        size_hint: '6"'    },
  { subcategory: 'Pendant Light',      path: 'collections/pendant-lights',           size_hint: ''      },
  { subcategory: 'Chandelier',         path: 'collections/chandeliers',              size_hint: ''      },
  { subcategory: 'Vanity Light',       path: 'collections/bathroom-vanity-lights',   size_hint: ''      },
  { subcategory: 'Ceiling Fan',        path: 'collections/ceiling-fans',             size_hint: '52"'   },
  { subcategory: 'Under Cabinet',      path: 'collections/under-cabinet-lighting',   size_hint: ''      },
  { subcategory: 'Flush Mount',        path: 'collections/flush-mount-ceiling-lights', size_hint: ''    },
  { subcategory: 'Outdoor',            path: 'collections/outdoor-lighting',         size_hint: ''      },
]

async function scrapeCategory(search) {
  const url = `https://www.progressivelighting.com/${search.path}`
  const html = await get(url, { headers: { 'Referer': 'https://www.progressivelighting.com/' } })
  const $ = cheerio.load(html)
  const products = []

  // Progressive Lighting runs on Shopify — try JSON-LD first
  const jsonLDs = extractJsonLD(html)
  jsonLDs.forEach(schema => {
    const items = schema['@type'] === 'ItemList'
      ? (schema.itemListElement || []).map(i => i.item)
      : schema['@type'] === 'Product' ? [schema] : []
    items.forEach(item => {
      const price = parseFloat(item?.offers?.price || item?.offers?.lowPrice || 0)
      if (!price || !item.name) return
      products.push({
        supplier:     SUPPLIER,
        category:     'Lighting',
        subcategory:  search.subcategory,
        brand:        item.brand?.name || '',
        product_name: item.name,
        sku:          item.sku || item.mpn || '',
        price,
        unit:         'EA',
        size:         search.size_hint || '',
        finish:       '',
        tier:         assignTier(price, 'lighting ' + search.subcategory),
        photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
        product_url:  item.url || url,
        in_stock:     item.offers?.availability !== 'https://schema.org/OutOfStock',
        scraped_at:   now(),
      })
    })
  })

  // Shopify collection page: product cards
  if (products.length === 0) {
    // Shopify embeds product data as JSON in a script tag
    const scripts = $('script[type="application/json"]').toArray()
    for (const s of scripts) {
      try {
        const data = JSON.parse($(s).html() || '')
        if (data?.products || data?.items) {
          const items = data.products || data.items || []
          items.slice(0, 10).forEach(item => {
            const price = (item.price || item.price_min || 0) / 100  // Shopify uses cents
            if (!price || !item.title) return
            products.push({
              supplier:     SUPPLIER,
              category:     'Lighting',
              subcategory:  search.subcategory,
              brand:        item.vendor || '',
              product_name: item.title,
              sku:          item.handle || String(item.id) || '',
              price,
              unit:         'EA',
              size:         search.size_hint || '',
              finish:       '',
              tier:         assignTier(price, 'lighting'),
              photo_url:    item.featured_image || (item.images?.[0]) || '',
              product_url:  item.url ? 'https://www.progressivelighting.com' + item.url : url,
              in_stock:     item.available !== false,
              scraped_at:   now(),
            })
          })
          if (products.length > 0) break
        }
      } catch(e) {}
    }
  }

  // Shopify also exposes a products.json endpoint per collection
  if (products.length === 0) {
    const collectionSlug = search.path.replace('collections/', '')
    try {
      const data = await require('axios').get(
        `https://www.progressivelighting.com/collections/${collectionSlug}/products.json?limit=12`,
        { timeout: 10000, headers: { 'Accept': 'application/json' } }
      ).then(r => r.data)
      const items = data?.products || []
      items.forEach(item => {
        const variant = item.variants?.[0]
        const price = parseFloat(variant?.price || 0)
        if (!price || !item.title) return
        products.push({
          supplier:     SUPPLIER,
          category:     'Lighting',
          subcategory:  search.subcategory,
          brand:        item.vendor || '',
          product_name: item.title,
          sku:          variant?.sku || String(item.id) || '',
          price,
          unit:         'EA',
          size:         search.size_hint || '',
          finish:       '',
          tier:         assignTier(price, 'lighting'),
          photo_url:    item.images?.[0]?.src || '',
          product_url:  `https://www.progressivelighting.com/products/${item.handle}`,
          in_stock:     variant?.available !== false,
          scraped_at:   now(),
        })
      })
    } catch(e) {}
  }

  // Generic HTML card fallback
  if (products.length === 0) {
    $('[class*="product"], .grid-item, .product-item').each((_, el) => {
      const name  = $(el).find('h3, h4, [class*="title"], [class*="name"]').first().text().trim()
      const price = parseFloat($(el).find('[class*="price"]').first().text().replace(/[^0-9.]/g, ''))
      const href  = $(el).find('a').first().attr('href') || ''
      const img   = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || ''
      if (!name || !price) return
      products.push({
        supplier:     SUPPLIER,
        category:     'Lighting',
        subcategory:  search.subcategory,
        brand:        '',
        product_name: name,
        sku:          '',
        price,
        unit:         'EA',
        size:         search.size_hint || '',
        finish:       '',
        tier:         assignTier(price, 'lighting'),
        photo_url:    img.startsWith('http') ? img : (img ? 'https://www.progressivelighting.com' + img : ''),
        product_url:  href.startsWith('http') ? href : 'https://www.progressivelighting.com' + href,
        in_stock:     true,
        scraped_at:   now(),
      })
    })
  }

  return products.slice(0, 10)
}

async function scrape() {
  console.log(`\n💡 Scraping ${SUPPLIER}...`)
  const allProducts = []

  for (const search of SEARCHES) {
    console.log(`  → ${search.subcategory}`)
    try {
      const products = await scrapeCategory(search)
      console.log(`    ${products.length} products`)
      allProducts.push(...products)
    } catch(e) {
      logError(SUPPLIER, `${search.subcategory}: ${e.message}`)
    }
    await rateLimit()
  }

  saveJSON('progressivelighting', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
