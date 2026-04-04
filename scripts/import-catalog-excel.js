// Import SpanglerBuilt_Material_Catalog.xlsx into Supabase catalog_materials
// Usage: node scripts/import-catalog-excel.js [path/to/file.xlsx]
// Default path: SpanglerBuilt_Material_Catalog.xlsx in project root

require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })

const fs   = require('fs')
const path = require('path')
const XLSX = require('xlsx')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Accept file path from CLI arg or default to project root
const filePath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '../SpanglerBuilt_Material_Catalog.xlsx')

function parseNum(val) {
  if (val === undefined || val === null || val === '') return null
  const n = parseFloat(String(val).replace(/[$,]/g, '').trim())
  return isNaN(n) ? null : n
}

function parseStr(val) {
  if (val === undefined || val === null) return ''
  return String(val).trim()
}

// Column name aliases — handles slight variations in header spelling
const COL = {
  category:        ['Category', 'CATEGORY'],
  subcategory:     ['Subcategory', 'Sub-Category', 'Sub Category', 'SUBCATEGORY'],
  brand:           ['Brand', 'BRAND', 'Manufacturer'],
  product_name:    ['Product Name', 'ProductName', 'Name', 'PRODUCT NAME'],
  style_type:      ['Style/Type', 'Style Type', 'StyleType', 'Style'],
  size:            ['Size', 'SIZE'],
  finish:          ['Finish', 'FINISH'],
  trim_style:      ['Trim Style', 'TrimStyle', 'Trim'],
  unit:            ['Unit', 'UNIT'],
  material_cost:   ['Material Cost', 'MaterialCost', 'Material'],
  labor_cost:      ['Labor Cost', 'LaborCost', 'Labor'],
  total_installed: ['Total Installed', 'TotalInstalled', 'Total', 'Price'],
  tier:            ['Tier', 'TIER', 'Quality Tier'],
  photo_url:       ['photo_url', 'Photo URL', 'Photo', 'Image URL', 'Image'],
  manufacturer_url:['product_url', 'Product URL', 'URL', 'Link', 'manufacturer_url'],
  supplier:        ['Supplier', 'SUPPLIER', 'Source'],
  description:     ['Description', 'DESCRIPTION', 'Notes'],
}

function findCol(headers, aliases) {
  for (const alias of aliases) {
    const found = headers.find(h => h && h.toLowerCase() === alias.toLowerCase())
    if (found) return found
  }
  return null
}

async function importExcel() {
  console.log(`\n📊 Importing from: ${filePath}`)
  if (!fs.existsSync(filePath)) {
    console.error(`  File not found: ${filePath}`)
    process.exit(1)
  }

  const workbook = XLSX.readFile(filePath)

  // Find the main catalog sheet (prefer "Material Catalog", fallback to first sheet)
  const sheetName =
    workbook.SheetNames.find(n => /material.*catalog|catalog/i.test(n)) ||
    workbook.SheetNames[0]

  console.log(`  Sheet: "${sheetName}"`)
  const sheet = workbook.Sheets[sheetName]
  const rows  = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  if (rows.length === 0) {
    console.error('  No rows found in sheet.')
    process.exit(1)
  }

  // Detect columns from first row's keys
  const headers = Object.keys(rows[0])
  const colMap  = {}
  for (const [field, aliases] of Object.entries(COL)) {
    colMap[field] = findCol(headers, aliases)
  }

  console.log(`  Rows: ${rows.length}`)
  console.log('  Column mapping:')
  Object.entries(colMap).forEach(([f, c]) => console.log(`    ${f.padEnd(18)} ← ${c || '(not found)'}`))

  // Map rows to catalog_materials schema
  const records = rows
    .map((row, i) => {
      const get = (field) => colMap[field] ? row[colMap[field]] : ''

      const name = parseStr(get('product_name'))
      if (!name) return null // skip blank rows

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

  console.log(`\n  Valid records: ${records.length}`)

  // Upsert in batches of 50
  const BATCH = 50
  let upserted = 0
  let errors   = 0

  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('catalog_materials')
      .upsert(batch, { onConflict: 'product_name,subcategory' })
      .select()

    if (error) {
      console.error(`  Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errors += batch.length
    } else {
      upserted += batch.length
      process.stdout.write(`  Upserted ${Math.min(i + BATCH, records.length)}/${records.length}...\r`)
    }
  }

  console.log(`\n\n  Done: ${upserted} upserted, ${errors} errors`)
}

importExcel().catch(err => {
  console.error('Fatal error:', err.message)
  process.exit(1)
})
