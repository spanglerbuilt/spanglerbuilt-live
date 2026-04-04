// Import all scraped products into Supabase catalog_materials
// Reads JSON files from scripts/data/, deduplicates by SKU+supplier, upserts

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const fs        = require('fs')
const path      = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const DATA_DIR = path.join(__dirname, 'data')

async function importCatalog() {
  console.log('\n📥 Importing catalog to Supabase...')

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('-products.json'))
  if (files.length === 0) {
    console.log('  No data files found. Run scrapers first: npm run scrape')
    return
  }

  let allProducts = []
  files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'))
    console.log(`  Loaded ${data.length} products from ${file}`)
    allProducts.push(...data)
  })

  // Deduplicate by sku + supplier (keep last/newest)
  const seen = new Map()
  allProducts.forEach(p => {
    const key = `${p.supplier}::${p.sku || p.product_name}`
    seen.set(key, p)
  })
  const unique = Array.from(seen.values())
  console.log(`\n  Total unique products: ${unique.length} (${allProducts.length - unique.length} duplicates removed)`)

  // Map to catalog_materials schema
  const rows = unique.map(p => ({
    category:        p.category || '',
    subcategory:     p.subcategory || '',
    brand:           p.brand || '',
    product_name:    p.product_name || '',
    style_type:      p.style_type || p.finish || '',
    size:            p.size || '',
    finish:          p.finish || '',
    trim_style:      '',
    unit:            p.unit || 'EA',
    material_cost:   p.price ? parseFloat((p.price * 0.6).toFixed(2)) : null,   // ~60% material
    labor_cost:      p.price ? parseFloat((p.price * 0.4).toFixed(2)) : null,   // ~40% labor
    total_installed: p.price ? String(p.price) : 'Allowance',
    tier:            p.tier || 'Good',
    photo_url:       p.photo_url || '',
    manufacturer_url: p.product_url || '',
    description:     `${p.brand ? p.brand + ' ' : ''}${p.product_name}${p.sku ? ' — Model: ' + p.sku : ''}`,
  }))

  // Upsert in batches of 50
  const BATCH = 50
  let inserted = 0, updated = 0, errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('catalog_materials')
      .upsert(batch, { onConflict: 'product_name,subcategory' })
      .select()

    if (error) {
      console.error(`  Batch ${Math.floor(i/BATCH)+1} error:`, error.message)
      errors += batch.length
    } else {
      inserted += batch.length
      process.stdout.write(`  Upserted ${Math.min(i + BATCH, rows.length)}/${rows.length}...\r`)
    }
  }

  console.log(`\n\n  ✓ Done: ${inserted} products upserted, ${errors} errors`)
}

importCatalog().catch(console.error)
