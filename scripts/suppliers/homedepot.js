// Home Depot catalog scraper
// Uses the same internal GraphQL endpoint their website uses
// Categories: Flooring, Cabinets, Hardware, Doors, Lighting, Appliances

const cheerio = require('cheerio')
const { get, getJSON, rateLimit, saveJSON, logError, assignTier, extractJsonLD, now } = require('./_shared')

const SUPPLIER = 'Home Depot'

// HD's internal search API (used by their own website)
const HD_API = 'https://www.homedepot.com/federation-gateway/graphql?opname=searchModel'

const SEARCH_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'x-experience-name': 'general-merchandise',
  'x-api-cookies': '{"x-user-id":"sbcontractor"}',
  'Origin': 'https://www.homedepot.com',
  'Referer': 'https://www.homedepot.com/',
}

// Categories and search terms to pull
const SEARCHES = [
  { category: 'Flooring',  subcategory: 'LVP',              query: 'luxury vinyl plank flooring',     unit: 'SF' },
  { category: 'Flooring',  subcategory: 'Engineered Hardwood', query: 'engineered hardwood flooring', unit: 'SF' },
  { category: 'Flooring',  subcategory: 'Carpet',            query: 'carpet flooring roll',            unit: 'SF' },
  { category: 'Cabinets',  subcategory: 'Stock',             query: 'kitchen cabinets stock shaker',   unit: 'EA' },
  { category: 'Cabinets',  subcategory: 'Semi-custom',       query: 'semi custom kitchen cabinets',    unit: 'EA' },
  { category: 'Hardware',  subcategory: 'Pulls',             query: 'cabinet pulls bar pull',          unit: 'EA' },
  { category: 'Hardware',  subcategory: 'Hinges',            query: 'cabinet hinges soft close',       unit: 'EA' },
  { category: 'Doors and Trim', subcategory: 'Interior Door', query: 'interior door prehung shaker', unit: 'EA' },
  { category: 'Doors and Trim', subcategory: 'Exterior Door', query: 'exterior door fiberglass',      unit: 'EA' },
  { category: 'Lighting',  subcategory: 'Ceiling Fan',       query: 'ceiling fan with light',         unit: 'EA' },
  { category: 'Lighting',  subcategory: 'Recessed',          query: 'recessed lighting LED 6 inch',   unit: 'EA' },
  { category: 'Lighting',  subcategory: 'Vanity',            query: 'vanity light bar bathroom',      unit: 'EA' },
  { category: 'Appliances',subcategory: 'Refrigerator',      query: 'french door refrigerator',       unit: 'EA' },
  { category: 'Appliances',subcategory: 'Dishwasher',        query: 'dishwasher stainless steel',     unit: 'EA' },
  { category: 'Appliances',subcategory: 'Range',             query: 'electric range stainless',       unit: 'EA' },
]

// GraphQL query body HD uses internally
function buildQuery(keyword, page = 1) {
  return {
    operationName: 'searchModel',
    variables: {
      storeId: '121',
      zipCode: '30188',
      startIndex: (page - 1) * 24,
      pageSize: 24,
      keyword,
    },
    query: `query searchModel($storeId: String, $zipCode: String, $keyword: String!, $startIndex: Int, $pageSize: Int) {
  searchModel(keyword: $keyword, storeId: $storeId, zipCode: $zipCode) {
    products(startIndex: $startIndex, pageSize: $pageSize) {
      identifiers { productLabel modelNumber brandName itemId }
      pricing(storeId: $storeId) { value unitOfMeasure specialPrice }
      media { images { url subType } }
      details { description }
      availabilityType { type }
    }
    metadata { totalProducts }
  }
}`,
  }
}

function parseProduct(p, searchMeta) {
  try {
    const id    = p.identifiers || {}
    const price = p.pricing?.specialPrice || p.pricing?.value
    const img   = (p.media?.images || []).find(i => i.subType === 'PRIMARY')
    if (!id.productLabel || !price) return null

    return {
      supplier:     SUPPLIER,
      category:     searchMeta.category,
      subcategory:  searchMeta.subcategory,
      brand:        id.brandName || '',
      product_name: id.productLabel,
      sku:          id.modelNumber || id.itemId || '',
      price:        parseFloat(price),
      unit:         p.pricing?.unitOfMeasure || searchMeta.unit,
      size:         '',
      finish:       '',
      tier:         assignTier(price, searchMeta.category),
      photo_url:    img?.url || '',
      product_url:  id.itemId ? `https://www.homedepot.com/p/${id.itemId}` : '',
      in_stock:     p.availabilityType?.type !== 'DISCONTINUED',
      scraped_at:   now(),
    }
  } catch(e) { return null }
}

// Fallback: parse search result HTML page
async function scrapeFallback(search) {
  const url = `https://www.homedepot.com/s/${encodeURIComponent(search.query)}?NCNI-5`
  const html = await get(url)
  const $ = cheerio.load(html)
  const products = []

  // HD embeds product JSON in window.__APOLLO_STATE__
  const scripts = $('script').toArray()
  for (const s of scripts) {
    const txt = $(s).html() || ''
    if (txt.includes('__APOLLO_STATE__')) {
      const match = txt.match(/window\.__APOLLO_STATE__\s*=\s*(\{.*?\});/s)
      if (match) {
        try {
          const state = JSON.parse(match[1])
          Object.values(state).forEach(item => {
            if (item.__typename === 'Product' && item.pricing?.value) {
              const p = {
                supplier:     SUPPLIER,
                category:     search.category,
                subcategory:  search.subcategory,
                brand:        item.identifiers?.brandName || '',
                product_name: item.identifiers?.productLabel || item.identifiers?.canonicalUrl || '',
                sku:          item.identifiers?.modelNumber || '',
                price:        item.pricing.value,
                unit:         item.pricing.unitOfMeasure || search.unit,
                size:         '',
                finish:       '',
                tier:         assignTier(item.pricing.value, search.category),
                photo_url:    '',
                product_url:  item.identifiers?.storeSkuNumber ? `https://www.homedepot.com/p/${item.identifiers.storeSkuNumber}` : '',
                in_stock:     true,
                scraped_at:   now(),
              }
              if (p.product_name) products.push(p)
            }
          })
        } catch(e) {}
      }
      break
    }
  }

  // Also try JSON-LD
  extractJsonLD(html).forEach(schema => {
    const items = schema['@type'] === 'ItemList' ? (schema.itemListElement || []).map(i => i.item) : []
    items.forEach(item => {
      if (!item || !item.offers) return
      const price = item.offers.price || item.offers.lowPrice
      if (!price) return
      products.push({
        supplier:     SUPPLIER,
        category:     search.category,
        subcategory:  search.subcategory,
        brand:        item.brand?.name || '',
        product_name: item.name || '',
        sku:          item.sku || item.mpn || '',
        price:        parseFloat(price),
        unit:         search.unit,
        size:         '',
        finish:       '',
        tier:         assignTier(price, search.category),
        photo_url:    Array.isArray(item.image) ? item.image[0] : (item.image || ''),
        product_url:  item.url || '',
        in_stock:     item.offers?.availability !== 'https://schema.org/OutOfStock',
        scraped_at:   now(),
      })
    })
  })

  return products
}

async function scrape() {
  console.log(`\n🏠 Scraping ${SUPPLIER}...`)
  const allProducts = []

  for (const search of SEARCHES) {
    console.log(`  → ${search.category} / ${search.subcategory}: "${search.query}"`)
    try {
      // Try GraphQL API first
      const { data } = await require('axios').post(HD_API, buildQuery(search.query), {
        headers: { ...SEARCH_HEADERS, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0' },
        timeout: 15000,
      }).catch(() => ({ data: null }))

      let products = []
      if (data?.data?.searchModel?.products?.length) {
        products = data.data.searchModel.products
          .map(p => parseProduct(p, search))
          .filter(Boolean)
          .slice(0, 8)
        console.log(`    GraphQL: ${products.length} products`)
      }

      // Fallback to HTML scraping if GraphQL fails
      if (products.length === 0) {
        products = await scrapeFallback(search)
        products = products.slice(0, 8)
        console.log(`    HTML fallback: ${products.length} products`)
      }

      allProducts.push(...products)
    } catch(e) {
      logError(SUPPLIER, `${search.query}: ${e.message}`)
    }

    await rateLimit()
  }

  saveJSON('homedepot', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
