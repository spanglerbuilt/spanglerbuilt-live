// Fetch Open Graph / meta data from a product URL for catalog auto-fill
// POST { url } → { ok, title, image, price, brand, desc }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url } = req.body
  if (!url) return res.status(400).json({ error: 'url required' })

  // Basic URL validation
  let parsed
  try {
    parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('bad protocol')
  } catch {
    return res.status(400).json({ error: 'Invalid URL' })
  }

  let html
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })
    clearTimeout(timeout)
    if (!response.ok) return res.status(400).json({ error: `Fetch failed: ${response.status}` })
    html = await response.text()
  } catch (e) {
    return res.status(400).json({ error: `Could not fetch URL: ${e.message}` })
  }

  // Extract meta tags
  function getMeta(property) {
    // og:property, name=property, itemprop=property
    const patterns = [
      new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
      new RegExp(`<meta[^>]+itemprop=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']${property}["']`, 'i'),
    ]
    for (const re of patterns) {
      const m = html.match(re)
      if (m) return m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
    }
    return null
  }

  // Page title fallback
  function getTitle() {
    const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return m ? m[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim() : null
  }

  // Try JSON-LD for structured product data
  function getJsonLD() {
    const results = []
    const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    let m
    while ((m = re.exec(html)) !== null) {
      try {
        const obj = JSON.parse(m[1])
        const items = Array.isArray(obj) ? obj : [obj]
        items.forEach(item => {
          if (item['@type'] === 'Product' || (item['@graph'] && item['@graph'].some(g => g['@type'] === 'Product'))) {
            const product = item['@type'] === 'Product' ? item : item['@graph'].find(g => g['@type'] === 'Product')
            if (product) results.push(product)
          }
        })
      } catch {}
    }
    return results[0] || null
  }

  const jsonLD = getJsonLD()

  // Extract price from various sources
  function extractPrice() {
    // JSON-LD offer price
    if (jsonLD) {
      const offer = jsonLD.offers
      if (offer) {
        const o = Array.isArray(offer) ? offer[0] : offer
        if (o.price) return String(o.price)
        if (o.lowPrice) return String(o.lowPrice)
      }
    }
    // meta price:amount
    const metaPrice = getMeta('price:amount') || getMeta('product:price:amount')
    if (metaPrice) return metaPrice

    // Common price patterns in HTML
    const pricePatterns = [
      /\$\s*([\d,]+\.?\d{0,2})/,
      /"price":\s*"?([\d.]+)"?/,
      /data-price=["']([\d.]+)["']/,
      /class=["'][^"']*price[^"']*["'][^>]*>\s*\$?\s*([\d,]+\.?\d{0,2})/i,
    ]
    for (const re of pricePatterns) {
      const m = html.match(re)
      if (m) {
        const val = parseFloat(m[1].replace(/,/g, ''))
        if (val > 0 && val < 100000) return String(val)
      }
    }
    return null
  }

  // Build result
  const title = (jsonLD && jsonLD.name) || getMeta('title') || getTitle()
  const image = (jsonLD && (Array.isArray(jsonLD.image) ? jsonLD.image[0] : jsonLD.image)) || getMeta('image')
  const price = extractPrice()
  const brand = (jsonLD && jsonLD.brand && (jsonLD.brand.name || jsonLD.brand)) || getMeta('brand') || getMeta('product:brand') || null
  const desc  = (jsonLD && jsonLD.description) || getMeta('description') || null

  return res.json({ ok: true, title, image, price, brand, desc })
}
