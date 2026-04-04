// The Tile Shop catalog scraper
// tileshop.com — their product pages use structured JSON in script tags

const cheerio = require('cheerio')
const { get, rateLimit, saveJSON, logError, assignTier, extractJsonLD, now } = require('./_shared')

const SUPPLIER = 'The Tile Shop'

const SEARCHES = [
  { subcategory: 'Ceramic',            query: 'ceramic tile',                 path: 'ceramic-tile',              size_hint: '12x24' },
  { subcategory: 'Porcelain',          query: 'porcelain tile',               path: 'porcelain-tile',            size_hint: '24x24' },
  { subcategory: 'Natural Stone',      query: 'marble tile',                  path: 'natural-stone-tile',        size_hint: '12x24' },
  { subcategory: 'Mosaic',             query: 'mosaic tile backsplash',       path: 'mosaic-tile',               size_hint: '12x12' },
  { subcategory: 'Large Format',       query: 'large format porcelain tile',  path: 'large-format-tile',         size_hint: '24x48' },
  { subcategory: 'Wood Look',          query: 'wood look tile plank',         path: 'wood-look-tile',            size_hint: '6x36' },
  { subcategory: 'Subway Tile',        query: 'subway tile backsplash',       path: 'subway-tile',               size_hint: '3x6' },
  { subcategory: 'Bathroom Floor',     query: 'bathroom floor tile anti slip',path: 'floor-tile',               size_hint: '12x12' },
]

async function scrapeSearch(search) {
  const url = `https://www.tileshop.com/${search.path}`
  const html = await get(url)
  const $ = cheerio.load(html)
  const products = []

  // Tile Shop uses React — look for JSON-LD and embedded data
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
        category:     'Tile',
        subcategory:  search.subcategory,
        brand:        item.brand?.name || 'The Tile Shop',
        product_name: item.name,
        sku:          item.sku || item.mpn || '',
        price,
        unit:         'SF',
        size:         search.size_hint || '',
        finish:       '',
        tier:         assignTier(price, 'tile'),
        photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
        product_url:  item.url || url,
        in_stock:     item.offers?.availability !== 'https://schema.org/OutOfStock',
        scraped_at:   now(),
      })
    })
  })

  // Also try to parse product grid cards
  if (products.length === 0) {
    $('[class*="product-card"], [class*="ProductCard"], [data-product-id]').each((_, el) => {
      const name  = $(el).find('[class*="product-name"], [class*="ProductName"], h3').first().text().trim()
      const priceText = $(el).find('[class*="price"], [class*="Price"]').first().text()
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''))
      const href  = $(el).find('a').first().attr('href') || ''
      const img   = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || ''

      if (!name || !price) return
      products.push({
        supplier:     SUPPLIER,
        category:     'Tile',
        subcategory:  search.subcategory,
        brand:        'The Tile Shop',
        product_name: name,
        sku:          '',
        price,
        unit:         'SF',
        size:         search.size_hint || '',
        finish:       '',
        tier:         assignTier(price, 'tile'),
        photo_url:    img.startsWith('http') ? img : (img ? 'https://www.tileshop.com' + img : ''),
        product_url:  href.startsWith('http') ? href : 'https://www.tileshop.com' + href,
        in_stock:     true,
        scraped_at:   now(),
      })
    })
  }

  // Try Algolia-style search API that many e-commerce sites use
  if (products.length === 0) {
    const searchUrl = `https://www.tileshop.com/api/search?query=${encodeURIComponent(search.query)}&hitsPerPage=12`
    try {
      const data = await require('axios').get(searchUrl, {
        timeout: 10000,
        headers: { 'Accept': 'application/json', 'Referer': 'https://www.tileshop.com/' }
      }).then(r => r.data)
      const hits = data?.hits || data?.results?.[0]?.hits || []
      hits.slice(0, 10).forEach(hit => {
        const price = hit.price || hit.sale_price || hit.retail_price
        if (!price) return
        products.push({
          supplier:     SUPPLIER,
          category:     'Tile',
          subcategory:  search.subcategory,
          brand:        hit.brand || 'The Tile Shop',
          product_name: hit.name || hit.title || '',
          sku:          hit.sku || hit.objectID || '',
          price:        parseFloat(price),
          unit:         'SF',
          size:         hit.size || search.size_hint || '',
          finish:       hit.finish || hit.surface || '',
          tier:         assignTier(price, 'tile'),
          photo_url:    hit.image || hit.thumbnail || '',
          product_url:  hit.url ? 'https://www.tileshop.com' + hit.url : url,
          in_stock:     !hit.out_of_stock,
          scraped_at:   now(),
        })
      })
    } catch(e) {}
  }

  return products.slice(0, 10)
}

async function scrape() {
  console.log(`\n🔷 Scraping ${SUPPLIER}...`)
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

  saveJSON('tileshop', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
