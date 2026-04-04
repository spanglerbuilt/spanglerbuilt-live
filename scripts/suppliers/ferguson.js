// Ferguson catalog scraper
// ferguson.com / fergusonhome.com — plumbing specialty
// Faucets, shower systems, toilets, sinks, tubs, shower valves

const cheerio = require('cheerio')
const { get, rateLimit, saveJSON, logError, assignTier, extractJsonLD, now } = require('./_shared')

const SUPPLIER = 'Ferguson'

// Ferguson has two sites: fergusonhome.com (consumer) and ferguson.com (trade)
// We try the trade site first, fall back to consumer
const SEARCHES = [
  { subcategory: 'Kitchen Faucet',    query: 'kitchen faucet pull-down',   path: 'kitchen/faucets',             unit: 'EA', cat: 'Fixtures' },
  { subcategory: 'Bath Faucet',       query: 'bathroom faucet single hole', path: 'bath/faucets/bathroom-sink',  unit: 'EA', cat: 'Fixtures' },
  { subcategory: 'Shower System',     query: 'shower system thermostatic',  path: 'bath/showers/shower-systems', unit: 'EA', cat: 'Fixtures' },
  { subcategory: 'Tub Filler',        query: 'tub filler freestanding',     path: 'bath/faucets/tub-fillers',    unit: 'EA', cat: 'Fixtures' },
  { subcategory: 'Toilet',            query: 'toilet elongated one piece',  path: 'bath/toilets',                unit: 'EA', cat: 'Bath'     },
  { subcategory: 'Bathroom Sink',     query: 'bathroom sink undermount',    path: 'bath/sinks',                  unit: 'EA', cat: 'Bath'     },
  { subcategory: 'Kitchen Sink',      query: 'kitchen sink undermount stainless', path: 'kitchen/sinks',         unit: 'EA', cat: 'Kitchen'  },
  { subcategory: 'Shower Valve',      query: 'shower valve pressure balance',path: 'bath/showers/valves',        unit: 'EA', cat: 'Fixtures' },
  { subcategory: 'Shower Door',       query: 'frameless shower enclosure',   path: 'bath/shower-doors',          unit: 'EA', cat: 'Bath'     },
  { subcategory: 'Bathtub',           query: 'freestanding soaking bathtub', path: 'bath/bathtubs',              unit: 'EA', cat: 'Bath'     },
]

async function scrapeURL(url) {
  const html = await get(url, { headers: { 'Referer': 'https://www.fergusonhome.com/' } })
  return html
}

async function scrapeSearch(search) {
  const products = []

  // Try Ferguson's search API first
  const searchAPIs = [
    `https://www.fergusonhome.com/search?q=${encodeURIComponent(search.query)}&format=json`,
    `https://www.fergusonhome.com/api/search?query=${encodeURIComponent(search.query)}&limit=12`,
  ]

  for (const apiUrl of searchAPIs) {
    try {
      const data = await require('axios').get(apiUrl, {
        timeout: 10000,
        headers: { 'Accept': 'application/json', 'Referer': 'https://www.fergusonhome.com/' }
      }).then(r => r.data)
      const items = data?.products || data?.results || data?.hits || []
      if (items.length) {
        items.slice(0, 8).forEach(item => {
          const price = item.price || item.sale_price || item.retailPrice
          if (!price || !item.name) return
          products.push({
            supplier:     SUPPLIER,
            category:     search.cat,
            subcategory:  search.subcategory,
            brand:        item.brand || item.manufacturer || '',
            product_name: item.name || item.title || '',
            sku:          item.sku || item.model || item.partNumber || '',
            price:        parseFloat(price),
            unit:         search.unit,
            size:         item.dimensions || '',
            finish:       item.finish || item.color || '',
            tier:         assignTier(price, search.cat + ' ' + search.subcategory),
            photo_url:    item.image || item.imageUrl || item.thumbnail || '',
            product_url:  item.url ? 'https://www.fergusonhome.com' + item.url : '',
            in_stock:     !item.outOfStock,
            scraped_at:   now(),
          })
        })
        if (products.length > 0) break
      }
    } catch(e) {}
  }

  // Fallback: scrape the category page HTML
  if (products.length === 0) {
    try {
      const url = `https://www.fergusonhome.com/${search.path}`
      const html = await scrapeURL(url)
      const $ = cheerio.load(html)

      // Try JSON-LD first
      const jsonLDs = extractJsonLD(html)
      jsonLDs.forEach(schema => {
        const items = schema['@type'] === 'ItemList'
          ? (schema.itemListElement || []).map(i => i.item)
          : schema['@type'] === 'Product' ? [schema] : []
        items.forEach(item => {
          const price = parseFloat(item?.offers?.price || 0)
          if (!price || !item.name) return
          products.push({
            supplier:     SUPPLIER,
            category:     search.cat,
            subcategory:  search.subcategory,
            brand:        item.brand?.name || '',
            product_name: item.name,
            sku:          item.sku || item.mpn || '',
            price,
            unit:         search.unit,
            size:         '',
            finish:       '',
            tier:         assignTier(price, search.cat),
            photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
            product_url:  item.url || url,
            in_stock:     true,
            scraped_at:   now(),
          })
        })
      })

      // HTML card parsing
      if (products.length === 0) {
        $('[class*="product"], [data-product], [data-item]').each((_, el) => {
          const name  = $(el).find('[class*="name"], [class*="title"], h3, h4').first().text().trim()
          const price = parseFloat($(el).find('[class*="price"]').first().text().replace(/[^0-9.]/g, ''))
          const href  = $(el).find('a').first().attr('href') || ''
          const img   = $(el).find('img').first().attr('src') || ''
          if (!name || !price) return
          products.push({
            supplier:     SUPPLIER,
            category:     search.cat,
            subcategory:  search.subcategory,
            brand:        '',
            product_name: name,
            sku:          '',
            price,
            unit:         search.unit,
            size:         '',
            finish:       '',
            tier:         assignTier(price, search.cat),
            photo_url:    img.startsWith('http') ? img : (img ? 'https://www.fergusonhome.com' + img : ''),
            product_url:  href.startsWith('http') ? href : 'https://www.fergusonhome.com' + href,
            in_stock:     true,
            scraped_at:   now(),
          })
        })
      }
    } catch(e) {
      logError(SUPPLIER, `${search.subcategory} HTML: ${e.message}`)
    }
  }

  return products.slice(0, 8)
}

async function scrape() {
  console.log(`\n🔧 Scraping ${SUPPLIER}...`)
  const allProducts = []

  for (const search of SEARCHES) {
    console.log(`  → ${search.subcategory}`)
    try {
      const products = await scrapeSearch(search)
      console.log(`    ${products.length} products`)
      allProducts.push(...products)
    } catch(e) {
      logError(SUPPLIER, `${search.subcategory}: ${e.message}`)
    }
    await rateLimit()
  }

  saveJSON('ferguson', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
