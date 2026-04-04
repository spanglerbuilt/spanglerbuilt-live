// POST multipart/form-data with field "file" (xlsx)
// Parses the workbook in-process and upserts into catalog_materials
// No tmp file needed — reads buffer directly

import { getAdminClient } from '../../../lib/supabase-server'

export const config = {
  api: { bodyParser: false },
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

// Parse multipart body manually to extract file buffer
// Avoids adding multer/formidable as a prod dependency
function parseMultipart(buffer, boundary) {
  const parts = []
  const sep   = Buffer.from('--' + boundary)
  let start   = 0

  while (start < buffer.length) {
    const sepIdx = buffer.indexOf(sep, start)
    if (sepIdx === -1) break
    const headStart = sepIdx + sep.length + 2 // skip \r\n
    const headEnd   = buffer.indexOf(Buffer.from('\r\n\r\n'), headStart)
    if (headEnd === -1) break
    const headers   = buffer.slice(headStart, headEnd).toString()
    const bodyStart = headEnd + 4
    const nextSep   = buffer.indexOf(sep, bodyStart)
    const bodyEnd   = nextSep === -1 ? buffer.length : nextSep - 2 // trim \r\n
    parts.push({ headers, data: buffer.slice(bodyStart, bodyEnd) })
    start = nextSep === -1 ? buffer.length : nextSep
  }
  return parts
}

function parseNum(val) {
  if (val === undefined || val === null || val === '') return null
  const n = parseFloat(String(val).replace(/[$,]/g, '').trim())
  return isNaN(n) ? null : n
}
function parseStr(val) {
  return (val === undefined || val === null) ? '' : String(val).trim()
}

const COL_ALIASES = {
  category:         ['Category', 'CATEGORY'],
  subcategory:      ['Subcategory', 'Sub-Category', 'Sub Category', 'SUBCATEGORY'],
  brand:            ['Brand', 'BRAND', 'Manufacturer'],
  product_name:     ['Product Name', 'ProductName', 'Name', 'PRODUCT NAME'],
  style_type:       ['Style/Type', 'Style Type', 'StyleType', 'Style'],
  size:             ['Size', 'SIZE'],
  finish:           ['Finish', 'FINISH'],
  trim_style:       ['Trim Style', 'TrimStyle', 'Trim'],
  unit:             ['Unit', 'UNIT'],
  material_cost:    ['Material Cost', 'MaterialCost', 'Material'],
  labor_cost:       ['Labor Cost', 'LaborCost', 'Labor'],
  total_installed:  ['Total Installed', 'TotalInstalled', 'Total', 'Price'],
  tier:             ['Tier', 'TIER', 'Quality Tier'],
  photo_url:        ['photo_url', 'Photo URL', 'Photo', 'Image URL', 'Image'],
  manufacturer_url: ['product_url', 'Product URL', 'URL', 'Link', 'manufacturer_url'],
  supplier:         ['Supplier', 'SUPPLIER', 'Source'],
  description:      ['Description', 'DESCRIPTION', 'Notes'],
}

function findCol(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h => h && h.toLowerCase() === alias.toLowerCase())
    if (found) return found
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const contentType = req.headers['content-type'] || ''
  const boundaryMatch = contentType.match(/boundary=([^\s;]+)/)
  if (!boundaryMatch) return res.status(400).json({ error: 'Expected multipart/form-data' })

  const rawBody   = await readBody(req)
  const parts     = parseMultipart(rawBody, boundaryMatch[1])
  const filePart  = parts.find(p => p.headers.includes('filename='))
  if (!filePart) return res.status(400).json({ error: 'No file found in upload' })

  // Dynamically import xlsx (it's in devDependencies but available at runtime in dev/build)
  let XLSX
  try {
    XLSX = require('xlsx')
  } catch {
    return res.status(500).json({ error: 'xlsx package not available on server' })
  }

  let workbook
  try {
    workbook = XLSX.read(filePart.data, { type: 'buffer' })
  } catch (e) {
    return res.status(400).json({ error: 'Could not parse Excel file: ' + e.message })
  }

  const sheetName =
    workbook.SheetNames.find(n => /material.*catalog|catalog/i.test(n)) ||
    workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows  = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (!rows.length) return res.status(400).json({ error: 'No rows found in sheet' })

  const headers = Object.keys(rows[0])
  const colMap  = {}
  for (const [field, aliases] of Object.entries(COL_ALIASES)) {
    colMap[field] = findCol(headers, aliases)
  }

  const records = rows
    .map(row => {
      const get = (field) => colMap[field] ? row[colMap[field]] : ''
      const name = parseStr(get('product_name'))
      if (!name) return null

      const totalRaw = parseStr(get('total_installed'))
      const totalNum = parseNum(totalRaw)

      return {
        category:         parseStr(get('category')),
        subcategory:      parseStr(get('subcategory')),
        brand:            parseStr(get('brand')),
        product_name:     name,
        style_type:       parseStr(get('style_type')),
        size:             parseStr(get('size')),
        finish:           parseStr(get('finish')),
        trim_style:       parseStr(get('trim_style')),
        unit:             parseStr(get('unit')) || 'EA',
        material_cost:    parseNum(get('material_cost')),
        labor_cost:       parseNum(get('labor_cost')),
        total_installed:  totalNum ? String(totalNum) : (totalRaw || 'Allowance'),
        tier:             parseStr(get('tier')) || 'Good',
        photo_url:        parseStr(get('photo_url')),
        manufacturer_url: parseStr(get('manufacturer_url')),
        supplier:         parseStr(get('supplier')),
        description:      parseStr(get('description')),
      }
    })
    .filter(Boolean)

  if (!records.length) return res.status(400).json({ error: 'No valid product rows found' })

  // Upsert in batches of 50
  const BATCH = 50
  let upserted = 0
  let errors   = 0

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { error } = await supabase
      .from('catalog_materials')
      .upsert(batch, { onConflict: 'product_name,subcategory' })

    if (error) {
      errors += batch.length
    } else {
      upserted += batch.length
    }
  }

  return res.json({ ok: true, upserted, errors, total: records.length, sheet: sheetName })
}
