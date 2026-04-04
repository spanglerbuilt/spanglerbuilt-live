// Wayfair catalog scraper
// Parses search result pages + JSON-LD schema markup
// Categories: Vanities, Lighting, Hardware, Ceiling Fans, Sinks, Tubs, Appliances

const cheerio = require('cheerio')
const { get, rateLimit, saveJSON, logError, assignTier, extractJsonLD, now } = require('./_shared')

const SUPPLIER = 'Wayfair'

const SEARCHES = [
  { category: 'Bath',        subcategory: 'Vanity',           query: 'bathroom vanity with sink',      path: 'sb0/bathroom-vanities-with-tops',   unit: 'EA' },
  { category: 'Bath',        subcategory: 'Freestanding Tub', query: 'freestanding bathtub',           path: 'sb0/freestanding-bathtubs',         unit: 'EA' },
  { category: 'Bath',        subcategory: 'Shower Door',      query: 'frameless shower door',          path: 'sb0/frameless-shower-doors',        unit: 'EA' },
  { category: 'Lighting',    subcategory: 'Pendant',          query: 'kitchen pendant light',          path: 'sb0/pendant-lights',                unit: 'EA' },
  { category: 'Lighting',    subcategory: 'Ceiling Fan',      query: 'ceiling fan with light kit',     path: 'sb0/ceiling-fans-with-lights',      unit: 'EA' },
  { category: 'Lighting',    subcategory: 'Vanity Light',     query: 'bathroom vanity light bar',      path: 'sb0/vanity-lights',                 unit: 'EA' },
  { category: 'Hardware',    subcategory: 'Cabinet Pulls',    query: 'cabinet bar pulls brushed nickel', path: 'sb0/bar-cup-pulls',               unit: 'EA' },
  { category: 'Hardware',    subcategory: 'Door Hardware',    query: 'door lever handle set',          path: 'sb0/door-levers',                   unit: 'EA' },
  { category: 'Appliances',  subcategory: 'Kitchen Sink',     query: 'stainless steel undermount sink', path: 'sb0/undermount-kitchen-sinks',     unit: 'EA' },
  { category: 'Appliances',  subcategory: 'Range Hood',       query: 'range hood stainless steel',     path: 'sb0/range-hoods',                   unit: 'EA' },
]

function parseProductCard($, card, search) {
  try {
    const nameEl  = $(card).find('[data-hb-id="product-name"] a, .ProductCard-name a, h3 a').first()
    const priceEl = $(card).find('[data-hb-id="ProductPrice"] [itemprop="price"], .ProductPrice, [class*="price"]').first()
    const imgEl   = $(card).find('img[data-src], img[src]').first()

    const name  = nameEl.text().trim()
    const href  = nameEl.attr('href') || ''
    const price = parseFloat((priceEl.text() || priceEl.attr('content') || '').replace(/[^0-9.]/g, ''))
    const img   = imgEl.attr('data-src') || imgEl.attr('src') || ''

    if (!name || !price) return null

    return {
      supplier:     SUPPLIER,
      category:     search.category,
      subcategory:  search.subcategory,
      brand:        $(card).find('[data-hb-id="product-brand"], .ProductCard-brand').text().trim() || '',
      product_name: name,
      sku:          $(card).attr('data-sku') || $(card).attr('data-item-id') || '',
      price,
      unit:         search.unit,
      size:         '',
      finish:       '',
      tier:         assignTier(price, search.category + ' ' + search.subcategory),
      photo_url:    img.startsWith('http') ? img : (img ? 'https:' + img : ''),
      product_url:  href.startsWith('http') ? href : 'https://www.wayfair.com' + href,
      in_stock:     true,
      scraped_at:   now(),
    }
  } catch(e) { return null }
}

async function scrapeSearch(search) {
  const url = `https://www.wayfair.com/${search.path}/?keyword=${encodeURIComponent(search.query)}`
  const html = await get(url, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': 'https://www.wayfair.com/',
    }
  })
  const $ = cheerio.load(html)
  const products = []

  // Try card-based parsing
  $('[data-hb-id="product-card"], [data-component="BrowseProductCard"], [class*="ProductCard"]').each((_, card) => {
    const p = parseProductCard($, card, search)
    if (p) products.push(p)
  })

  // Fallback: JSON-LD
  if (products.length === 0) {
    extractJsonLD(html).forEach(schema => {
      const items = schema['@type'] === 'ItemList'
        ? (schema.itemListElement || []).map(i => i.item)
        : schema['@type'] === 'Product' ? [schema] : []
      items.forEach(item => {
        if (!item?.offers) return
        const price = parseFloat(item.offers.price || item.offers.lowPrice || 0)
        if (!price) return
        products.push({
          supplier:     SUPPLIER,
          category:     search.category,
          subcategory:  search.subcategory,
          brand:        item.brand?.name || '',
          product_name: item.name || '',
          sku:          item.sku || '',
          price,
          unit:         search.unit,
          size:         '',
          finish:       '',
          tier:         assignTier(price, search.category),
          photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
          product_url:  item.url || url,
          in_stock:     item.offers.availability !== 'https://schema.org/OutOfStock',
          scraped_at:   now(),
        })
      })
    })
  }

  // Last resort: try to find embedded __NEXT_DATA__ JSON
  if (products.length === 0) {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (nextDataMatch) {
      try {
        const nd = JSON.parse(nextDataMatch[1])
        const browse = nd?.props?.pageProps?.browseData?.products ||
                       nd?.props?.initialReduxState?.browse?.products || []
        browse.slice(0, 8).forEach(item => {
          const price = item.sale_price || item.price || item.regularPrice
          if (!price) return
          products.push({
            supplier:     SUPPLIER,
            category:     search.category,
            subcategory:  search.subcategory,
            brand:        item.manufacturer || item.brand || '',
            product_name: item.name || item.product_name || '',
            sku:          item.sku || item.product_id || '',
            price:        parseFloat(price),
            unit:         search.unit,
            size:         '',
            finish:       '',
            tier:         assignTier(price, search.category),
            photo_url:    item.image_url || item.medium_image || '',
            product_url:  item.url ? 'https://www.wayfair.com' + item.url : url,
            in_stock:     !item.out_of_stock,
            scraped_at:   now(),
          })
        })
      } catch(e) {}
    }
  }

  return products.slice(0, 10)
}

async function scrape() {
  console.log(`\n🛋  Scraping ${SUPPLIER}...`)
  const allProducts = []

  for (const search of SEARCHES) {
    console.log(`  → ${search.category} / ${search.subcategory}`)
    try {
      const products = await scrapeSearch(search)
      console.log(`    ${products.length} products`)
      allProducts.push(...products)
    } catch(e) {
      logError(SUPPLIER, `${search.subcategory}: ${e.message}`)
    }
    await rateLimit()
  }

  saveJSON('wayfair', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
