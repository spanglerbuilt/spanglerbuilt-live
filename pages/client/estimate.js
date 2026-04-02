import ClientNav from './_nav'
import { useState } from 'react'

var TIER_MULT   = { good:1.0, better:1.18, best:1.38, luxury:1.65 }
var TIER_LABELS = { good:'Good', better:'Better', best:'Best', luxury:'Luxury' }

var TIER_INFO = {
  good: {
    headline: 'Quality materials, clean finish',
    bullets: [
      'Standard LVP flooring — Shaw Floors or Armstrong',
      'Ceramic tile — bathroom floor & shower walls',
      'Stock shaker cabinets — bar area',
      'Builder-grade plumbing fixtures',
      'Standard hollow-core interior doors',
      'Brushed nickel hardware throughout',
    ],
    accent: '#3B6D11',
  },
  better: {
    headline: 'Upgraded finishes, better durability',
    bullets: [
      'Premium waterproof LVP — COREtec or LifeProof',
      'Porcelain tile — wood or stone look',
      'Semi-custom cabinets — dovetail drawers',
      'Mid-grade matte black or polished chrome fixtures',
      'Solid-core shaker doors',
      'Matte black or satin brass hardware',
    ],
    accent: '#185FA5',
  },
  best: {
    headline: 'Designer finishes, premium everything',
    bullets: [
      'Engineered hardwood-look premium LVP — Pergo/Mohawk',
      'Large-format porcelain — premium stone look',
      'Semi-custom inset or full-overlay cabinets',
      'Thermostatic shower valve + designer fixtures',
      'Solid-core 8\' tall doors',
      'Unlacquered brass or oil-rubbed bronze hardware',
    ],
    accent: '#534AB7',
  },
  luxury: {
    headline: 'Custom everything, top-of-market',
    bullets: [
      'Wide-plank engineered hardwood or stone porcelain',
      'Natural marble, travertine, or designer porcelain',
      'Full custom cabinetry — any style, any finish',
      'Full European thermostatic system — Grohe/Brizo',
      'Solid wood custom doors — custom profile',
      'Custom hardware — hand-forged or cast',
    ],
    accent: '#C07820',
  },
}

var DIVISIONS = [
  {num:'01', name:'General requirements',              base:7225},
  {num:'02', name:'Existing conditions & demo',        base:3763},
  {num:'03', name:'Concrete',                          base:3214},
  {num:'04', name:'Masonry',                           base:1750},
  {num:'05', name:'Metals',                            base:1450},
  {num:'06', name:'Wood & plastics (framing)',         base:8643},
  {num:'07', name:'Thermal & moisture protection',     base:3729},
  {num:'08', name:'Openings (doors & windows)',        base:4810},
  {num:'09', name:'Finishes (flooring, tile, drywall, paint)', base:17160},
  {num:'10', name:'Specialties (bath accessories)',    base:1050},
  {num:'11', name:'Equipment (bar sink & appliances)', base:710},
  {num:'12', name:'Furnishings (cabinets & countertops)', base:5800},
  {num:'14', name:'Conveying (stair nosing)',          base:285},
  {num:'15', name:'Mechanical (plumbing & HVAC)',      base:7485},
  {num:'16', name:'Electrical',                        base:3905},
]

var PAYMENTS = [
  {label:'Deposit — contract signing',     pct:25},
  {label:'Demo & framing complete',         pct:25},
  {label:'Drywall & rough-ins complete',    pct:25},
  {label:'Paint, flooring & trim complete', pct:20},
  {label:'Final punch list & closeout',     pct:5},
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

function calcTotals(tier) {
  var direct = DIVISIONS.reduce(function(s,d){ return s + d.base }, 0)
  var mult   = TIER_MULT[tier]
  var tiered = direct * mult
  var cont   = tiered * 0.05
  var op     = (tiered + cont) * 0.10
  var tax    = (tiered + cont + op) * 0.08
  return { direct, tiered, cont, op, tax, grand: tiered + cont + op + tax }
}

export default function ClientEstimate() {
  var [tier,        setTier]        = useState(null)
  var [confirmed,   setConfirmed]   = useState(false)
  var [showDetails, setShowDetails] = useState(false)

  var totals = tier ? calcTotals(tier) : null

  function confirmSelection() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_estimate', JSON.stringify({
        tier, label: TIER_LABELS[tier],
        grand: Math.round(totals.grand),
        confirmedAt: new Date().toISOString(),
      }))
    }
    setConfirmed(true)
    setTimeout(function(){ window.scrollTo({ top:0, behavior:'smooth' }) }, 100)
  }

  var topbar = <ClientNav />

  if (confirmed) {
    return (
      <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
        {topbar}
        <div style={{maxWidth:700, margin:'3rem auto', padding:'0 1.5rem', textAlign:'center'}}>
          <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'3rem', borderTop:'4px solid #D06830'}}>
            <div style={{fontSize:40, marginBottom:'1rem', color:'#D06830'}}>✓</div>
            <div style={{fontSize:24, fontWeight:800, color:'#fff', marginBottom:8}}>Selection confirmed</div>
            <div style={{fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:'2rem'}}>
              You selected the <strong style={{color: TIER_INFO[tier].accent}}>{TIER_LABELS[tier]}</strong> tier at <strong style={{color:'#fff'}}>{fmt(totals.grand)}</strong>
            </div>
            <div style={{background:'rgba(208,104,48,.08)', border:'1px solid rgba(208,104,48,.3)', borderRadius:4, padding:'1rem 1.5rem', marginBottom:'2rem', textAlign:'left'}}>
              <div style={{fontSize:10, fontWeight:700, color:'#D06830', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>What happens next</div>
              <div style={{fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.8}}>
                1. Michael will review your selection and contact you within 1 business day.<br/>
                2. You'll receive your formal contract for review and signature.<br/>
                3. Once signed, we schedule your start date and order materials.
              </div>
            </div>
            <div style={{display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap'}}>
              <a href="/client/selections" style={{display:'inline-block', background:'#D06830', color:'#fff', padding:'12px 24px', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', textDecoration:'none', borderRadius:3}}>
                Choose your materials →
              </a>
              <a href="tel:4044927650" style={{display:'inline-block', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.7)', padding:'12px 24px', fontSize:12, fontWeight:600, textDecoration:'none', borderRadius:3}}>
                Call Michael
              </a>
              <button onClick={function(){ setConfirmed(false) }} style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.35)', padding:'12px 24px', fontSize:12, cursor:'pointer', borderRadius:3, fontFamily:'Poppins,sans-serif'}}>
                Change selection
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      {topbar}

      <div style={{maxWidth:900, margin:'0 auto', padding:'1.5rem'}}>

        {/* Project info */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderLeft:'4px solid #D06830', borderRadius:4, padding:'1.25rem 1.5rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:18, fontWeight:700, color:'#fff', marginBottom:3}}>Mendel Basement Renovation</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.5)'}}>SB-2026-001 · 4995 Shadow Glen Ct, Dunwoody GA · 665 sf</div>
          </div>
          {tier && (
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2}}>Your selection</div>
              <div style={{fontSize:20, color:'#D06830', fontWeight:700}}>{fmt(totals.grand)}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!tier && (
          <div style={{background:'rgba(208,104,48,.08)', border:'1px solid rgba(208,104,48,.3)', borderRadius:4, padding:'1rem 1.25rem', marginBottom:'1.5rem', fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.7}}>
            <strong style={{color:'#fff'}}>Select your tier below</strong> — each tier includes the same scope of work with different materials and finishes. Your total updates instantly. Questions? Call Michael at <a href="tel:4044927650" style={{color:'#D06830'}}>(404) 492-7650</a>.
          </div>
        )}

        {/* Tier selector cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12, marginBottom:'1.5rem'}}>
          {['good','better','best','luxury'].map(function(t) {
            var info     = TIER_INFO[t]
            var tot      = calcTotals(t)
            var selected = tier === t
            return (
              <div key={t} onClick={function(){ setTier(t) }} style={{
                background: selected ? '#1e1e1e' : '#161616',
                border: selected ? ('2px solid ' + info.accent) : '1px solid rgba(255,255,255,.1)',
                borderRadius:4, cursor:'pointer', overflow:'hidden', transition:'all .15s',
              }}
              onMouseEnter={function(e){ if(!selected) e.currentTarget.style.borderColor = info.accent }}
              onMouseLeave={function(e){ if(!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)' }}>
                {/* Header */}
                <div style={{background: selected ? info.accent : '#0d0d0d', padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#fff'}}>{TIER_LABELS[t]}</div>
                    <div style={{fontSize:11, color: selected ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.45)', marginTop:1}}>{info.headline}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18, fontWeight:700, color:'#fff'}}>{fmt(tot.grand)}</div>
                    <div style={{fontSize:9, color:'rgba(255,255,255,.45)', textTransform:'uppercase', letterSpacing:'.06em'}}>{TIER_MULT[t].toFixed(2)}× multiplier</div>
                  </div>
                </div>

                {/* Bullets */}
                <div style={{padding:'12px 14px'}}>
                  {info.bullets.map(function(b, i) {
                    return (
                      <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start', padding:'4px 0', borderBottom: i < info.bullets.length-1 ? '1px solid rgba(255,255,255,.06)' : 'none', fontSize:12, color:'rgba(255,255,255,.55)'}}>
                        <span style={{color: info.accent, fontSize:12, flexShrink:0, marginTop:1}}>✓</span>
                        <span>{b}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Select button */}
                <div style={{padding:'0 14px 12px'}}>
                  <div style={{
                    textAlign:'center', padding:'8px', fontSize:11, fontWeight:700,
                    letterSpacing:'.08em', textTransform:'uppercase', borderRadius:3,
                    background: selected ? info.accent : 'rgba(255,255,255,.06)',
                    color: selected ? '#fff' : 'rgba(255,255,255,.4)',
                    border: selected ? 'none' : '1px solid rgba(255,255,255,.1)',
                  }}>
                    {selected ? '✓ Selected' : 'Select this tier'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live breakdown — shows when tier is selected */}
        {tier && (
          <div>
            {/* Summary bar */}
            <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:8}}>
              <div style={{display:'flex', gap:24, flexWrap:'wrap'}}>
                {[['Direct cost', fmt(totals.direct)], ['Contingency', fmt(totals.cont)], ['O&P', fmt(totals.op)], ['GA sales tax', fmt(totals.tax)]].map(function(pair) {
                  return (
                    <div key={pair[0]}>
                      <div style={{fontSize:9, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2}}>{pair[0]}</div>
                      <div style={{fontSize:13, color:'rgba(255,255,255,.75)', fontWeight:500}}>{pair[1]}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2}}>{TIER_LABELS[tier]} tier total</div>
                <div style={{fontSize:24, color:'#D06830', fontWeight:700}}>{fmt(totals.grand)}</div>
              </div>
            </div>

            {/* Toggle details */}
            <button onClick={function(){ setShowDetails(!showDetails) }} style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', padding:'6px 16px', fontSize:11, cursor:'pointer', borderRadius:3, marginBottom:12, fontFamily:'Poppins,sans-serif', fontWeight:500}}>
              {showDetails ? '▲ Hide' : '▼ Show'} division breakdown
            </button>

            {/* Division breakdown */}
            {showDetails && (
              <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden', marginBottom:12}}>
                <div style={{display:'grid', gridTemplateColumns:'60px 1fr 110px 110px', gap:8, padding:'6px 12px', background:'#0a0a0a', fontSize:10, fontWeight:600, color:'#D06830', textTransform:'uppercase', letterSpacing:'.04em'}}>
                  <span>Div</span><span>Description</span><span style={{textAlign:'right'}}>Base</span><span style={{textAlign:'right'}}>{TIER_LABELS[tier]}</span>
                </div>
                {DIVISIONS.map(function(d, i) {
                  return (
                    <div key={d.num} style={{display:'grid', gridTemplateColumns:'60px 1fr 110px 110px', gap:8, padding:'7px 12px', borderTop:'1px solid rgba(255,255,255,.05)', fontSize:12,
                      background: i%2===0 ? '#161616' : '#181818'}}
                      onMouseEnter={function(e){ e.currentTarget.style.background = 'rgba(208,104,48,.08)' }}
                      onMouseLeave={function(e){ e.currentTarget.style.background = i%2===0 ? '#161616' : '#181818' }}>
                      <span style={{color:'rgba(255,255,255,.3)', fontSize:10, fontWeight:700}}>DIV {d.num}</span>
                      <span style={{color:'rgba(255,255,255,.6)'}}>{d.name}</span>
                      <span style={{textAlign:'right', color:'rgba(255,255,255,.35)'}}>{fmt(d.base)}</span>
                      <span style={{textAlign:'right', fontWeight:600, color:'rgba(255,255,255,.8)'}}>{fmt(d.base * TIER_MULT[tier])}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Payment schedule */}
            <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden', marginBottom:'1.5rem'}}>
              <div style={{padding:'8px 12px', background:'#0a0a0a', fontSize:10, fontWeight:600, color:'#D06830', textTransform:'uppercase', letterSpacing:'.08em'}}>
                Payment schedule — {TIER_LABELS[tier]} tier ({fmt(totals.grand)})
              </div>
              {PAYMENTS.map(function(p, i) {
                return (
                  <div key={p.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderTop: i===0 ? 'none' : '1px solid rgba(255,255,255,.05)', fontSize:12}}>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                      <span style={{fontSize:10, color:'#D06830', fontWeight:700, minWidth:28}}>{p.pct}%</span>
                      <span style={{color:'rgba(255,255,255,.6)'}}>{p.label}</span>
                    </div>
                    <span style={{fontWeight:600, color:'rgba(255,255,255,.8)'}}>{fmt(totals.grand * p.pct / 100)}</span>
                  </div>
                )
              })}
            </div>

            {/* Confirm */}
            <div style={{textAlign:'center'}}>
              <button onClick={confirmSelection} style={{
                background:'#D06830', color:'#fff', border:'none',
                padding:'14px 48px', fontSize:13, fontWeight:700,
                letterSpacing:'.1em', textTransform:'uppercase',
                cursor:'pointer', borderRadius:3, fontFamily:'Poppins,sans-serif',
              }}>
                Confirm {TIER_LABELS[tier]} tier selection →
              </button>
              <div style={{fontSize:11, color:'rgba(255,255,255,.3)', marginTop:8}}>
                Michael will follow up within 1 business day to finalize your contract.
              </div>
            </div>
          </div>
        )}

        <div style={{marginTop:'1.5rem', fontSize:10, color:'rgba(255,255,255,.25)', textAlign:'center'}}>
          SpanglerBuilt Inc. · Michael Spangler, GC · 44 Milton Ave, Alpharetta GA 30009 · (404) 492-7650 · Estimate valid 30 days
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
