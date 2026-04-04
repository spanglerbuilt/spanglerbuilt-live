// Shared utilities for all SpanglerBuilt catalog scrapers

const axios = require('axios')
const fs    = require('fs')
const path  = require('path')

// ── Tier auto-assignment ────────────────────────────────────────────────────
function assignTier(price, category) {
  if (!price || isNaN(price)) return 'Good'
  const p = parseFloat(price)
  const cat = (category || '').toLowerCase()

  if (cat.includes('tile')) {
    if (p < 5)   return 'Good'
    if (p < 10)  return 'Better'
    if (p < 20)  return 'Best'
    return 'Luxury'
  }
  if (cat.includes('floor') || cat.includes('lvp') || cat.includes('hardwood') || cat.includes('carpet')) {
    if (p < 4)   return 'Good'
    if (p < 7)   return 'Better'
    if (p < 12)  return 'Best'
    return 'Luxury'
  }
  if (cat.includes('light') || cat.includes('fan') || cat.includes('pendant') || cat.includes('recessed')) {
    if (p < 100)  return 'Good'
    if (p < 300)  return 'Better'
    if (p < 800)  return 'Best'
    return 'Luxury'
  }
  if (cat.includes('appli') || cat.includes('refriger') || cat.includes('dishwash') || cat.includes('range')) {
    if (p < 600)  return 'Good'
    if (p < 1500) return 'Better'
    if (p < 4000) return 'Best'
    return 'Luxury'
  }
  // Fixtures / plumbing / hardware / doors / vanities / cabinets
  if (p < 200)  return 'Good'
  if (p < 500)  return 'Better'
  if (p < 1000) return 'Best'
  return 'Luxury'
}

// ── HTTP helpers ────────────────────────────────────────────────────────────
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
]

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

async function get(url, opts = {}) {
  const res = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      ...opts.headers,
    },
    ...opts,
  })
  return res.data
}

async function getJSON(url, opts = {}) {
  const res = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': randomUA(),
      'Accept': 'application/json, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      ...opts.headers,
    },
    ...opts,
  })
  return res.data
}

// ── Rate limiting ───────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function rateLimit() {
  const ms = 1200 + Math.random() * 800  // 1.2–2.0s
  await sleep(ms)
}

// ── File helpers ────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data')
const LOG_DIR  = path.join(__dirname, 'logs')

function saveJSON(supplier, products) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  const file = path.join(DATA_DIR, supplier + '-products.json')
  fs.writeFileSync(file, JSON.stringify(products, null, 2))
  console.log(`  ✓ Saved ${products.length} products → ${file}`)
}

function logError(supplier, msg) {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  const line = `[${new Date().toISOString()}] [${supplier}] ${msg}\n`
  fs.appendFileSync(path.join(LOG_DIR, 'scrape-errors.log'), line)
  console.error(`  ✗ ${msg}`)
}

// ── JSON-LD extractor (works on many e-commerce sites) ─────────────────────
function extractJsonLD(html) {
  const results = []
  const regex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    try { results.push(JSON.parse(match[1])) } catch(e) {}
  }
  return results
}

// ── Timestamp ───────────────────────────────────────────────────────────────
function now() { return new Date().toISOString() }

module.exports = { assignTier, get, getJSON, rateLimit, sleep, saveJSON, logError, extractJsonLD, now }
