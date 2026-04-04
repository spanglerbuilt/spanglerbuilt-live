// cambria.com — premium quartz countertop designs
// Strategy: scrape /designs/ page for design slugs → visit each design page → JSON-LD / meta

const { get, rateLimit, saveJSON, assignTier } = require('./_shared')

const BASE = 'https://www.cambriausa.com'

// Typical installed price range for Cambria (premium quartz)
const PRICE_RANGE = [90, 160]

async function scrapeDesign(slug) {
  const url = BASE + slug
  let html
  try { html = await get(url) } catch(e) { return null }
  if (!html) return null

  // Try JSON-LD first
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1])
      const product = ld['@type'] === 'Product' ? ld : null
      if (product) {
        const midPrice = (PRICE_RANGE[0] + PRICE_RANGE[1]) / 2
        return {
          supplier:     'Cambria',
          category:     'Countertops',
          subcategory:  'Quartz',
          brand:        'Cambria',
          product_name: product.name || '',
          sku:          product.sku || product.productID || '',
          description:  product.description || '',
          photo_url:    Array.isArray(product.image) ? product.image[0] : (product.image || ''),
          product_url:  url,
          unit:         'SF',
          price:        midPrice,
          tier:         'Best',
          finish:       'Polished',
          size:         'Custom slab',
        }
      }
    } catch(e) {}
  }

  // Fallback: Open Graph meta tags
  const name  = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1] || ''
  const image = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] || ''
  const desc  = (html.match(/<meta(?:\s+name="description"|\s+property="og:description")\s+content="([^"]*)"/) || [])[1] || ''

  // Derive name from slug if OG title is missing/generic
  const slugName = slug.split('/').filter(Boolean).pop()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  const finalName = (name && !name.toLowerCase().includes('quartz colors') && name.length > 3)
    ? name.replace(/\s*[\|–-]\s*Cambria.*/i, '').trim()
    : slugName

  if (!finalName || finalName.length < 2) return null

  const midPrice = (PRICE_RANGE[0] + PRICE_RANGE[1]) / 2
  return {
    supplier:     'Cambria',
    category:     'Countertops',
    subcategory:  'Quartz',
    brand:        'Cambria',
    product_name: finalName,
    sku:          '',
    description:  desc,
    photo_url:    image,
    product_url:  url,
    unit:         'SF',
    price:        midPrice,
    tier:         'Best',
    finish:       'Polished',
    size:         'Custom slab',
  }
}

async function scrape() {
  console.log('💎 Scraping Cambria...')
  const allProducts = []

  // Get design listing page
  let html
  try { html = await get(BASE + '/quartz-countertops/') } catch(e) {
    console.log('  ✗ Could not load /quartz-countertops/:', e.message)
    return allProducts
  }

  // Extract design slugs — pattern: /quartz-countertops/quartz-colors/designs/[name]
  const slugs = []
  const seen  = new Set()
  const re    = /\/quartz-countertops\/quartz-colors\/designs\/([a-z0-9-]+)/g
  let match
  while ((match = re.exec(html)) !== null) {
    const slug = '/quartz-countertops/quartz-colors/designs/' + match[1]
    if (!seen.has(slug)) { seen.add(slug); slugs.push(slug) }
  }

  const limited = slugs.slice(0, 20)
  console.log(`  Found ${slugs.length} designs — scraping ${limited.length}`)

  for (const slug of limited) {
    await rateLimit()
    const product = await scrapeDesign(slug)
    if (product && product.product_name) allProducts.push(product)
    else console.log(`  ✗ No data: ${slug}`)
  }

  console.log(`  ✓ Saved ${allProducts.length} products`)
  saveJSON('cambria', allProducts)
  return allProducts
}

module.exports = { scrape }
if (require.main === module) scrape().catch(console.error)
