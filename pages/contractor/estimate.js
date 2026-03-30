import { useState } from 'react'

const TIER_MULT = { good: 1.0, better: 1.18, best: 1.38, luxury: 1.65 }
const TIER_LABELS = { good: 'Good', better: 'Better', best: 'Best', luxury: 'Luxury' }

const DIVISIONS = [
  { num: '01', name: 'General requirements', items: [
    { desc: 'Project management & supervision', qty: 1, unit: 'LS', rate: 3200 },
    { desc: 'Building permit', qty: 1, unit: 'LS', rate: 1850 },
    { desc: 'Temporary facilities & site protection', qty: 1, unit: 'LS', rate: 650 },
    { desc: 'Dumpster / waste removal (2 pulls)', qty: 2, unit: 'EA', rate: 525 },
    { desc: 'Final cleaning & punch list', qty: 1, unit: 'LS', rate: 475 },
  ]},
  { num: '02', name: 'Existing conditions', items: [
    { desc: 'Selective demo — existing framing/drywall', qty: 665, unit: 'SF', rate: 1.85 },
    { desc: 'Concrete floor prep & grinding', qty: 665, unit: 'SF', rate: 1.25 },
    { desc: 'Moisture testing & vapor barrier', qty: 665, unit: 'SF', rate: 0.95 },
    { desc: 'Egress window assessment', qty: 1, unit: 'LS', rate: 350 },
    { desc: 'Haul-off & disposal', qty: 1, unit: 'LS', rate: 750 },
  ]},
  { num: '03', name: 'Concrete', items: [
    { desc: 'Concrete crack repair & patching', qty: 1, unit: 'LS', rate: 850 },
    { desc: 'Floor leveling compound', qty: 665, unit: 'SF', rate: 1.75 },
    { desc: 'Bathroom rough-in saw cut & patch', qty: 1, unit: 'LS', rate: 1200 },
  ]},
  { num: '04', name: 'Masonry', items: [
    { desc: 'Masonry wall waterproofing seal', qty: 1, unit: 'LS', rate: 1100 },
    { desc: 'CMU block repair / tuckpointing', qty: 1, unit: 'LS', rate: 650, allowance: true },
  ]},
  { num: '05', name: 'Metals', items: [
    { desc: 'Steel lally column wrap', qty: 2, unit: 'EA', rate: 425 },
    { desc: 'Metal stair stringers', qty: 1, unit: 'LS', rate: 600, allowance: true },
  ]},
  { num: '06', name: 'Wood & plastics', items: [
    { desc: 'Pressure-treated bottom plate', qty: 200, unit: 'LF', rate: 3.25 },
    { desc: 'Stud framing — perimeter & interior', qty: 665, unit: 'SF', rate: 4.50 },
    { desc: 'Soffit & beam box framing', qty: 1, unit: 'LS', rate: 1250 },
    { desc: 'Custom bar framing & rough carpentry', qty: 1, unit: 'LS', rate: 2200 },
    { desc: 'Bathroom backing & blocking', qty: 1, unit: 'LS', rate: 450 },
    { desc: 'Stair handrail & guardrail', qty: 1, unit: 'LS', rate: 1100 },
  ]},
  { num: '07', name: 'Thermal & moisture', items: [
    { desc: 'Closed-cell spray foam — rim joists', qty: 120, unit: 'LF', rate: 8.50 },
    { desc: 'Rigid foam insulation — perimeter walls', qty: 665, unit: 'SF', rate: 2.25 },
    { desc: 'Batt insulation — interior partitions', qty: 400, unit: 'SF', rate: 1.65 },
    { desc: 'Bathroom waterproofing membrane', qty: 85, unit: 'SF', rate: 6.50 },
  ]},
  { num: '08', name: 'Openings', items: [
    { desc: 'Prehung interior door — hollow core', qty: 3, unit: 'EA', rate: 385 },
    { desc: 'Prehung bathroom door w/ privacy hardware', qty: 1, unit: 'EA', rate: 425 },
    { desc: 'Barn door / bypass — bar room', qty: 1, unit: 'EA', rate: 650, allowance: true },
    { desc: 'Door hardware — passage & privacy sets', qty: 4, unit: 'EA', rate: 95 },
    { desc: 'Egress window', qty: 1, unit: 'EA', rate: 2200, allowance: true },
  ]},
  { num: '09', name: 'Finishes', items: [
    { desc: 'LVP flooring — main areas', qty: 600, unit: 'SF', rate: 6.25, allowance: true },
    { desc: 'LVP installation labor', qty: 600, unit: 'SF', rate: 2.75 },
    { desc: 'Tile flooring — bathroom', qty: 65, unit: 'SF', rate: 8.50, allowance: true },
    { desc: 'Tile installation labor — bathroom', qty: 65, unit: 'SF', rate: 7.00 },
    { desc: 'Shower tile — walls', qty: 120, unit: 'SF', rate: 9.00, allowance: true },
    { desc: 'Shower tile installation labor', qty: 120, unit: 'SF', rate: 9.50 },
    { desc: 'Drywall — hang & finish (level 4)', qty: 665, unit: 'SF', rate: 4.75 },
    { desc: 'Moisture-resistant drywall — bathroom', qty: 150, unit: 'SF', rate: 5.50 },
    { desc: 'Ceiling drywall — hang & finish', qty: 665, unit: 'SF', rate: 3.85 },
    { desc: 'Paint — walls, ceilings, trim (2 coats)', qty: 665, unit: 'SF', rate: 2.50 },
    { desc: 'Bathroom paint', qty: 1, unit: 'LS', rate: 450 },
    { desc: 'Schluter / trim strips & transitions', qty: 1, unit: 'LS', rate: 325 },
  ]},
  { num: '10', name: 'Specialties', items: [
    { desc: 'Bath accessories', qty: 1, unit: 'LS', rate: 425, allowance: true },
    { desc: 'Shower niche', qty: 1, unit: 'EA', rate: 350 },
    { desc: 'Medicine cabinet', qty: 1, unit: 'EA', rate: 275, allowance: true },
  ]},
  { num: '11', name: 'Equipment', items: [
    { desc: 'Bar sink rough-in & fixture', qty: 1, unit: 'LS', rate: 485, allowance: true },
    { desc: 'Wet bar refrigerator rough-in', qty: 1, unit: 'LS', rate: 225 },
  ]},
  { num: '12', name: 'Furnishings', items: [
    { desc: 'Bar base cabinets — 3 ea', qty: 3, unit: 'EA', rate: 400, allowance: true },
    { desc: 'Bar upper cabinets — 3 ea', qty: 3, unit: 'EA', rate: 400, allowance: true },
    { desc: 'Bar countertop — solid surface', qty: 1, unit: 'LS', rate: 1850, allowance: true },
    { desc: 'Vanity cabinet & top', qty: 1, unit: 'LS', rate: 875, allowance: true },
  ]},
  { num: '14', name: 'Conveying equipment', items: [
    { desc: 'Stair nosing & landing strip', qty: 1, unit: 'LS', rate: 285 },
  ]},
  { num: '15', name: 'Mechanical', items: [
    { desc: 'Bathroom plumbing rough-in (DWV)', qty: 1, unit: 'LS', rate: 2200 },
    { desc: 'Plumbing fixtures — toilet, vanity, shower', qty: 1, unit: 'LS', rate: 1850, allowance: true },
    { desc: 'HVAC extension — ductwork & 2 registers', qty: 1, unit: 'LS', rate: 1650 },
    { desc: 'Exhaust fan — bathroom', qty: 1, unit: 'EA', rate: 385 },
    { desc: 'Bar sink plumbing rough-in', qty: 1, unit: 'LS', rate: 850 },
    { desc: 'Laundry hookup / utility rough-in', qty: 1, unit: 'LS', rate: 550 },
  ]},
  { num: '16', name: 'Electrical', items: [
    { desc: 'Panel capacity review & circuit additions', qty: 1, unit: 'LS', rate: 850 },
    { desc: 'LED recessed lights — 4" (20 fixtures)', qty: 20, unit: 'EA', rate: 95 },
    { desc: 'Dimmer switches', qty: 4, unit: 'EA', rate: 65 },
    { desc: 'Electrical outlets — 15 amp', qty: 12, unit: 'EA', rate: 85 },
    { desc: 'GFCI outlets (wet areas)', qty: 6, unit: 'EA', rate: 95 },
    { desc: 'Bathroom vanity light rough-in', qty: 1, unit: 'LS', rate: 185 },
    { desc: 'Bar area under-cabinet lighting', qty: 1, unit: 'LS', rate: 425 },
    { desc: 'Smoke & CO detectors', qty: 2, unit: 'EA', rate: 125 },
    { desc: 'Electrical panel schedule update', qty: 1, unit: 'LS', rate: 275 },
  ]},
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }
function fmtD(n) { return '$' + parseFloat(n).toFixed(2) }

function divSubtotal(div) {
  return div.items.reduce((s, i) => s + i.qty * i.rate, 0)
}

function calcTotals(tier) {
  const direct = DIVISIONS.reduce((s, d) => s + divSubtotal(d), 0)
  const mult   = TIER_MULT[tier]
  const tiered = direct * mult
  const cont   = tiered * 0.05
  const op     = (tiered + cont) * 0.10
  const tax    = (tiered + cont + op) * 0.08
  return { direct, tiered, cont, op, tax, grand: tiered + cont + op + tax }
}

const S = {
  page:    { minHeight: '100vh', background: '#f5f4f1', fontFamily: 'sans-serif' },
  topbar:  { background: '#002147', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  brand:   { fontFamily: 'Georgia,serif', fontSize: 16, color: '#fff', fontWeight: 700, letterSpacing: '.08em' },
  back:    { fontSize: 11, color: '#9a9690', textDecoration: 'none' },
  wrap:    { padding: '1.5rem', maxWidth: 1100, margin: '0 auto' },
  metGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: '1.25rem' },
  met:     { background: '#fff', border: '1px solid #e8e6e0', borderRadius: 4, padding: '.7rem .9rem' },
  metL:    { fontSize: 10, color: '#9a9690', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.04em' },
  metV:    { fontSize: 18, fontWeight: 500 },
  tierRow: { display: 'flex', gap: 6, marginBottom: '1rem', flexWrap: 'wrap' },
  divCard: { background: '#fff', border: '1px solid #e8e6e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  divHdr:  { padding: '8px 12px', background: '#FFFCEB', display: 'flex', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #e8e6e0' },
  tbl:     { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
  th:      { padding: '5px 10px', background: '#f5f4f1', fontSize: 10, fontWeight: 500, color: '#9a9690', textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'left', borderBottom: '1px solid #e8e6e0' },
  td:      { padding: '6px 10px', borderBottom: '1px solid #f5f4f1', color: '#3d3b37' },
  totalBar:{ background: '#002147', color: '#FF8C00', padding: '12px 16px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.75rem' },
  payCard: { background: '#fff', border: '1px solid #e8e6e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  payRow:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: '1px solid #f5f4f1', fontSize: 12 },
}

const TIER_STYLES = {
  good:   { border: '1px solid', borderColor: '#3B6D11', background: '#eaf3de', color: '#3B6D11' },
  better: { border: '1px solid', borderColor: '#185FA5', background: '#e6f1fb', color: '#185FA5' },
  best:   { border: '1px solid', borderColor: '#534AB7', background: '#eeedfe', color: '#534AB7' },
  luxury: { border: '1px solid', borderColor: '#854F0B', background: '#faeeda', color: '#854F0B' },
}

export default function EstimatePage() {
  const [tier,     setTier]     = useState('good')
  const [openDivs, setOpenDivs] = useState({})

  const totals = calcTotals(tier)
  const mult   = TIER_MULT[tier]

  function toggleDiv(num) {
    setOpenDivs(prev => ({ ...prev, [num]: !prev[num] }))
  }

  const tierBtn = (t) => (
    <button key={t} onClick={() => setTier(t)} style={{
      padding: '5px 14px', fontSize: 11, fontFamily: 'inherit', fontWeight: 500,
      cursor: 'pointer', borderRadius: 3,
      ...(tier === t ? TIER_STYLES[t] : { border: '1px solid #e8e6e0', background: '#fff', color: '#9a9690' }),
    }}>{TIER_LABELS[t]}</button>
  )

  const PAYMENTS = [
    { label: 'Deposit — contract signing', pct: 25 },
    { label: 'Demo & framing complete',    pct: 25 },
    { label: 'Drywall & rough-ins complete', pct: 25 },
    { label: 'Paint, flooring & trim complete', pct: 20 },
    { label: 'Final punch list & CO',       pct: 5  },
  ]

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.brand}>SPANGLERBUILT <span style={{ fontSize: 11, color: '#c9a96e', fontWeight: 400 }}> · ESTIMATING</span></div>
        <a href="/dashboard" style={S.back}>← Dashboard</a>
      </div>

      <div style={S.wrap}>
        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, fontFamily: 'Georgia,serif' }}>Mendel Basement Renovation</div>
            <div style={{ fontSize: 11, color: '#9a9690' }}>SB-2026-001 · 4995 Shadow Glen Ct, Dunwoody GA · 665 sf</div>
          </div>
          <div style={S.tierRow}>{['good','better','best','luxury'].map(tierBtn)}</div>
        </div>

        <div style={S.metGrid}>
          <div style={S.met}><div style={S.metL}>Direct cost</div><div style={S.metV}>{fmt(totals.direct)}</div></div>
          <div style={S.met}><div style={S.metL}>Tier ({TIER_LABELS[tier]})</div><div style={S.metV}>{fmt(totals.tiered)}</div></div>
          <div style={S.met}><div style={S.metL}>Contingency + O&P</div><div style={S.metV}>{fmt(totals.cont + totals.op)}</div></div>
          <div style={{ ...S.met, borderColor: '#3B6D11' }}><div style={S.metL}>Contract total</div><div style={{ ...S.metV, color: '#002147' }}>{fmt(totals.grand)}</div></div>
        </div>

        <div style={{ fontSize: 10, fontWeight: 500, color: '#9a9690', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.5rem' }}>Division line items — click to expand</div>

        {DIVISIONS.map(div => {
          const sub  = divSubtotal(div)
          const adj  = sub * mult
          const open = !!openDivs[div.num]
          return (
            <div key={div.num} style={S.divCard}>
              <div style={S.divHdr} onClick={() => toggleDiv(div.num)}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: '#9a9690', marginRight: 10, textTransform: 'uppercase' }}>DIV {div.num}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{div.name}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#002147', marginRight: 8 }}>{fmt(adj)}</span>
                <span style={{ fontSize: 10, color: '#9a9690' }}>{open ? '▲' : '▼'}</span>
              </div>
              {open && (
                <table style={S.tbl}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: '45%' }}>Description</th>
                      <th style={S.th}>Qty</th>
                      <th style={S.th}>Unit</th>
                      <th style={S.th}>Rate</th>
                      <th style={{ ...S.th, textAlign: 'right' }}>Base</th>
                      <th style={{ ...S.th, textAlign: 'right' }}>{TIER_LABELS[tier]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {div.items.map((item, i) => {
                      const base = item.qty * item.rate
                      const adj2 = base * mult
                      return (
                        <tr key={i}>
                          <td style={S.td}>
                            {item.desc}
                            {item.allowance && <span style={{ marginLeft: 6, background: '#fff3e0', color: '#e65100', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>allowance</span>}
                          </td>
                          <td style={{ ...S.td, color: '#9a9690' }}>{item.qty}</td>
                          <td style={{ ...S.td, color: '#9a9690' }}>{item.unit}</td>
                          <td style={{ ...S.td, color: '#9a9690' }}>{fmtD(item.rate)}</td>
                          <td style={{ ...S.td, textAlign: 'right' }}>{fmt(base)}</td>
                          <td style={{ ...S.td, textAlign: 'right', fontWeight: 500, color: '#002147' }}>{fmt(adj2)}</td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: '#f5f4f1' }}>
                      <td colSpan={4} style={{ ...S.td, fontWeight: 500 }}>Division {div.num} subtotal</td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 500 }}>{fmt(sub)}</td>
                      <td style={{ ...S.td, textAlign: 'right', fontWeight: 500, color: '#002147' }}>{fmt(adj)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          )
        })}

        <div style={{ fontSize: 10, fontWeight: 500, color: '#9a9690', textTransform: 'uppercase', letterSpacing: '.05em', margin: '.75rem 0 .5rem' }}>Below the line</div>
        <div style={S.payCard}>
          {[
            ['Direct cost subtotal', fmt(totals.direct)],
            [TIER_LABELS[tier] + ' tier (' + mult.toFixed(2) + '×)', fmt(totals.tiered)],
            ['Contingency (5%)', fmt(totals.cont)],
            ['Overhead & profit (10%)', fmt(totals.op)],
            ['Georgia sales tax (8%)', fmt(totals.tax)],
          ].map(([l, v]) => (
            <div key={l} style={S.payRow}><span style={{ color: '#9a9690' }}>{l}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
          ))}
        </div>

        <div style={S.totalBar}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7 }}>{TIER_LABELS[tier]} tier — contract total</span>
          <span style={{ fontSize: 24, fontWeight: 500 }}>{fmt(totals.grand)}</span>
        </div>

        <div style={{ fontSize: 10, fontWeight: 500, color: '#9a9690', textTransform: 'uppercase', letterSpacing: '.05em', margin: '.75rem 0 .5rem' }}>Payment schedule</div>
        <div style={S.payCard}>
          {PAYMENTS.map(p => (
            <div key={p.label} style={S.payRow}>
              <span style={{ color: '#9a9690', marginRight: 8, fontSize: 10 }}>{p.pct}%</span>
              <span style={{ flex: 1 }}>{p.label}</span>
              <span style={{ fontWeight: 500 }}>{fmt(totals.grand * p.pct / 100)}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 10, color: '#9a9690', marginTop: '.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
          <span>SpanglerBuilt Inc. · Michael Spangler, GC · (404) 492-7650 · michael@spanglerbuilt.com</span>
          <span>Metro Atlanta market pricing · Valid 30 days</span>
        </div>
      </div>
    </div>
  )
}
