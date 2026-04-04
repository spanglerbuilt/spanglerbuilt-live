// Master catalog sync — runs all scrapers then imports to Supabase
// Usage: npm run scrape
// Or individual supplier: node scripts/suppliers/msisurfaces.js

const { scrape: scrapeHD }   = require('./suppliers/homedepot')
const { scrape: scrapeWF }   = require('./suppliers/wayfair')
const { scrape: scrapeTS }   = require('./suppliers/tileshop')
const { scrape: scrapeFerg } = require('./suppliers/ferguson')
const { scrape: scrapePL }   = require('./suppliers/progressivelighting')
const { scrape: scrapeMSI }  = require('./suppliers/msisurfaces')
const { scrape: scrapeCamb } = require('./suppliers/cambria')
const { scrape: scrapeCaes } = require('./suppliers/caesarstone')
const { scrape: scrapeCab }  = require('./suppliers/cabinets')
const { scrape: scrapeSS }   = require('./suppliers/solidsurface')

async function runAll() {
  const start = Date.now()
  console.log('╔═══════════════════════════════════════════╗')
  console.log('║  SpanglerBuilt — Catalog Sync              ║')
  console.log('╚═══════════════════════════════════════════╝')

  const args = process.argv.slice(2)
  const all  = args.length === 0

  const results = {}

  // ── Original suppliers (blocked by bot protection — kept for future) ────────
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

  // ── New suppliers ────────────────────────────────────────────────────────────
  try {
    if (all || args.includes('msi') || args.includes('msisurfaces')) {
      results.msisurfaces = await scrapeMSI()
    }
  } catch(e) { console.error('MSI Surfaces failed:', e.message) }

  try {
    if (all || args.includes('cambria')) {
      results.cambria = await scrapeCamb()
    }
  } catch(e) { console.error('Cambria failed:', e.message) }

  try {
    if (all || args.includes('caesarstone')) {
      results.caesarstone = await scrapeCaes()
    }
  } catch(e) { console.error('Caesarstone failed:', e.message) }

  try {
    if (all || args.includes('cabinets')) {
      results.cabinets = await scrapeCab()
    }
  } catch(e) { console.error('Cabinets.com failed:', e.message) }

  try {
    if (all || args.includes('solidsurface') || args.includes('ss')) {
      results.solidsurface = await scrapeSS()
    }
  } catch(e) { console.error('Solid Surface failed:', e.message) }

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
