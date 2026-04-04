// lib/generateQBExport.js
// Generates QuickBooks IIF and CSV export content from a SpanglerBuilt estimate

var TIER_MULT = { good: 1.0, better: 1.18, best: 1.38, luxury: 1.65 }

function fmtQBDate(d) {
  var dt = d || new Date()
  var m  = String(dt.getMonth() + 1).padStart(2, '0')
  var day= String(dt.getDate()).padStart(2, '0')
  var y  = dt.getFullYear()
  return m + '/' + day + '/' + y
}

function fmtAmount(n) {
  return parseFloat(n).toFixed(2)
}

// Returns IIF file content string
function generateIIF(project, estimate) {
  var clientName  = (project && project.client_name)   || 'SpanglerBuilt Client'
  var projNum     = (project && project.project_number) || 'SB-0000-000'
  var projType    = (project && project.project_type)   || 'Renovation'
  var tier        = (estimate && estimate.tier)          || 'good'
  var divisions   = (estimate && estimate.activeDivisions) || []
  var dateStr     = fmtQBDate(new Date())
  var mult        = TIER_MULT[tier] || 1.0

  // Header definitions (only need once)
  var lines = [
    '!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO',
    '!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO',
    '!ENDTRNS',
  ]

  // Calculate tiered division totals
  var divLines  = []
  var grandTotal = 0

  divisions.forEach(function(div) {
    if (!div.items || div.items.length === 0) return
    var rawSub = div.items.reduce(function(s, i) { return s + (i.qty * i.rate) }, 0)
    var tiered = rawSub * mult
    grandTotal += tiered
    divLines.push({
      name: 'Division ' + div.num + ' — ' + div.name,
      amount: tiered,
    })
  })

  // Add contingency, overhead, tax
  var cont  = grandTotal * 0.05
  var op    = (grandTotal + cont) * 0.10
  var tax   = (grandTotal + cont + op) * 0.08
  var total = grandTotal + cont + op + tax

  // TRNS line (invoice header)
  lines.push(
    'TRNS\t\tINVOICE\t' + dateStr + '\tAccounts Receivable\t' + clientName +
    '\t' + fmtAmount(total) + '\t' + projNum + '\t' + projType + ' — ' + tier.charAt(0).toUpperCase() + tier.slice(1) + ' Tier'
  )

  // SPL lines — one per division
  divLines.forEach(function(d) {
    lines.push(
      'SPL\t\tINVOICE\t' + dateStr + '\tConstruction Income\t' + clientName +
      '\t-' + fmtAmount(d.amount) + '\t' + d.name
    )
  })

  // SPL for contingency, overhead, tax
  if (cont > 0) {
    lines.push('SPL\t\tINVOICE\t' + dateStr + '\tConstruction Income\t' + clientName + '\t-' + fmtAmount(cont) + '\tContingency (5%)')
  }
  if (op > 0) {
    lines.push('SPL\t\tINVOICE\t' + dateStr + '\tConstruction Income\t' + clientName + '\t-' + fmtAmount(op) + '\tOverhead & Profit (10%)')
  }
  if (tax > 0) {
    lines.push('SPL\t\tINVOICE\t' + dateStr + '\tSales Tax Payable\t' + clientName + '\t-' + fmtAmount(tax) + '\tSales Tax (8%)')
  }

  lines.push('ENDTRNS')

  return lines.join('\r\n') + '\r\n'
}

// Returns CSV file content string
function generateCSV(project, estimate) {
  var clientName = (project && project.client_name)    || 'SpanglerBuilt Client'
  var projNum    = (project && project.project_number) || 'SB-0000-000'
  var projType   = (project && project.project_type)   || 'Renovation'
  var tier       = (estimate && estimate.tier)          || 'good'
  var divisions  = (estimate && estimate.activeDivisions) || []
  var dateStr    = fmtQBDate(new Date())
  var mult       = TIER_MULT[tier] || 1.0

  var rows = [
    ['Customer', 'Date', 'Invoice#', 'Division', 'Description', 'Quantity', 'Unit', 'Rate', 'Amount', 'Tier Multiplier', 'Tiered Amount'],
  ]

  divisions.forEach(function(div) {
    if (!div.items || div.items.length === 0) return
    div.items.forEach(function(item) {
      var raw    = item.qty * item.rate
      var tiered = raw * mult
      rows.push([
        clientName,
        dateStr,
        projNum,
        'Div ' + div.num + ' — ' + div.name,
        item.desc,
        item.qty,
        item.unit || 'LS',
        fmtAmount(item.rate),
        fmtAmount(raw),
        mult.toFixed(2) + 'x (' + tier + ')',
        fmtAmount(tiered),
      ])
    })
  })

  // Summary rows
  var direct = divisions.reduce(function(s, d) {
    return s + (d.items || []).reduce(function(ss, i) { return ss + i.qty * i.rate }, 0)
  }, 0)
  var tieredTotal = direct * mult
  var cont  = tieredTotal * 0.05
  var op    = (tieredTotal + cont) * 0.10
  var tax   = (tieredTotal + cont + op) * 0.08
  var grand = tieredTotal + cont + op + tax

  rows.push(['', '', '', '', '', '', '', '', '', '', ''])
  rows.push([clientName, dateStr, projNum, '', 'Contingency (5%)', '', '', '', fmtAmount(cont), '', fmtAmount(cont)])
  rows.push([clientName, dateStr, projNum, '', 'Overhead & Profit (10%)', '', '', '', fmtAmount(op), '', fmtAmount(op)])
  rows.push([clientName, dateStr, projNum, '', 'Sales Tax (8%)', '', '', '', fmtAmount(tax), '', fmtAmount(tax)])
  rows.push([clientName, dateStr, projNum, '', 'GRAND TOTAL', '', '', '', '', '', fmtAmount(grand)])

  return rows.map(function(row) {
    return row.map(function(cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"'
    }).join(',')
  }).join('\r\n') + '\r\n'
}

module.exports = { generateIIF, generateCSV }
