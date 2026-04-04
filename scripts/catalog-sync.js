// Master catalog sync — runs all scrapers then imports to Supabase
// Usage: npm run scrape
// Or individual supplier: node scripts/suppliers/homedepot.js

const { scrape: scrapeHD }   = require('./suppliers/homedepot')
const { scrape: scrapeWF }   = require('./suppliers/wayfair')
const { scrape: scrapeTS }   = require('./suppliers/tileshop')
const { scrape: scrapeFerg } = require('./suppliers/ferguson')
const { scrape: scrapePL }   = require('./suppliers/progressivelighting')

async function runAll() {
  const start = Date.now()
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║  SpanglerBuilt — Catalog Sync              ║')
  console.log('╚═══════════════════════════════════════════╝')

  // Which suppliers to run (can pass args: node catalog-sync.js hd wayfair)
  const args = process.argv.slice(2)
  const all  = args.length === 0

  const results = {}

  try {
    if (all || args.includes('hd') || args.includes('homedepot')) {
      results.homedepot = await scrapeHD()
    }
  } catch(e) { console.error('HD failed:', e.message) }

  try {
    if (all || args.includes('wayfair') || args.includes('wf')) {
      results.wayfair = await scrapeWF()
    }
  } catch(e) { console.error('Wayfair failed:', e.message) }

  try {
    if (all || args.includes('tileshop') || args.includes('ts')) {
      results.tileshop = await scrapeTS()
    }
  } catch(e) { console.error('Tile Shop failed:', e.message) }

  try {
    if (all || args.includes('ferguson') || args.includes('ferg')) {
      results.ferguson = await scrapeFerg()
    }
  } catch(e) { console.error('Ferguson failed:', e.message) }

  try {
    if (all || args.includes('pl') || args.includes('progressive')) {
      results.progressivelighting = await scrapePL()
    }
  } catch(e) { console.error('Progressive Lighting failed:', e.message) }

  // Print summary
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log('\n═══════════════════════════════════════════')
  console.log('  Scrape complete:')
  Object.entries(results).forEach(([supplier, products]) => {
    console.log(`  ${supplier}: ${(products || []).length} products`)
  })
  console.log(`  Time: ${elapsed}s`)
  console.log('═══════════════════════════════════════════')

  // Import to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    await require('./import-catalog')
  } else {
    console.log('\n  Skipping Supabase import — no NEXT_PUBLIC_SUPABASE_URL set')
    console.log('  Run: node scripts/import-catalog.js when ready')
  }
}

runAll().catch(console.error)
