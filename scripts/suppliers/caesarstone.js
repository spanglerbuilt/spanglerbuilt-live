// caesarstoneus.com — quartz countertop colors
// Strategy: scrape /quartz-countertops/ for color page links → JSON-LD / meta on each

const { get, rateLimit, saveJSON } = require('./_shared')

const BASE       = 'https://www.caesarstoneus.com'
const PRICE_MID  = 85  // typical installed $/SF for Caesarstone

async function scrapeColor(slug) {
  const url = BASE + slug
  let html
  try { html = await get(url) } catch(e) { return null }
  if (!html) return null

  // JSON-LD
  const ldBlocks = []
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try { ldBlocks.push(JSON.parse(m[1])) } catch(e) {}
  }
  for (const ld of ldBlocks) {
    const items = Array.isArray(ld) ? ld : (ld['@graph'] || [ld])
    const product = items.find(i => i['@type'] === 'Product')
    if (product) {
      return {
        supplier:     'Caesarstone',
        category:     'Countertops',
        subcategory:  'Quartz',
        brand:        'Caesarstone',
        product_name: product.name || '',
        sku:          product.sku || product.productID || '',
        description:  product.description || '',
        photo_url:    Array.isArray(product.image) ? product.image[0] : (product.image || ''),
        product_url:  url,
        unit:         'SF',
        price:        PRICE_MID,
        tier:         'Better',
        finish:       'Polished',
        size:         'Custom slab',
      }
    }
  }

  // Fallback: Open Graph
  const name  = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || ''
  const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || ''
  const desc  = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''

  if (!name || name.toLowerCase() === 'caesarstone') return null

  return {
    supplier:     'Caesarstone',
    category:     'Countertops',
    subcategory:  'Quartz',
    brand:        'Caesarstone',
    product_name: name.replace(/\s*[\|–-]\s*Caesarstone.*/i, '').trim(),
    sku:          '',
    description:  desc,
    photo_url:    image,
    product_url:  url,
    unit:         'SF',
    price:        PRICE_MID,
    tier:         'Better',
    finish:       'Polished',
    size:         'Custom slab',
  }
}

async function scrape() {
  console.log('⬜ Scraping Caesarstone...')
  const allProducts = []

  let html
  try { html = await get(BASE + '/quartz-countertops/') } catch(e) {
    console.log('  ✗ Could not load /quartz-countertops/:', e.message)
    return allProducts
  }

  // Extract individual color slugs — pattern: /countertops/[code]-[name]/
  const slugs = []
  const seen  = new Set()
  // Match both relative and absolute URLs
  const re    = /href="(?:https:\/\/www\.caesarstoneus\.com)?(\/countertops\/[a-z0-9][a-z0-9-]*\/)"/g
  let match
  while ((match = re.exec(html)) !== null) {
    const slug = match[1]
    if (!seen.has(slug)) { seen.add(slug); slugs.push(slug) }
  }

  const limited = slugs.slice(0, 20)
  console.log(`  Found ${slugs.length} color pages — scraping ${limited.length}`)

  for (const slug of limited) {
    await rateLimit()
    const product = await scrapeColor(slug)
    if (product && product.product_name) allProducts.push(product)
  }

  console.log(`  ✓ Saved ${allProducts.length} products`)
  saveJSON('caesarstone', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
