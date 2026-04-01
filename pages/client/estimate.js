import { useState } from 'react'

const TIER_MULT   = { good:1.0, better:1.18, best:1.38, luxury:1.65 }
const TIER_LABELS = { good:'Good', better:'Better', best:'Best', luxury:'Luxury' }

const TIER_INFO = {
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
    color: '#3B6D11', bg: '#eaf3de', border: '#3B6D11',
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
    color: '#185FA5', bg: '#e6f1fb', border: '#185FA5',
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
    color: '#534AB7', bg: '#eeedfe', border: '#534AB7',
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
    color: '#854F0B', bg: '#faeeda', border: '#854F0B',
  },
}

const DIVISIONS = [
  {num:'01',name:'General requirements',base:7225},
  {num:'02',name:'Existing conditions & demo',base:3763},
  {num:'03',name:'Concrete',base:3214},
  {num:'04',name:'Masonry',base:1750},
  {num:'05',name:'Metals',base:1450},
  {num:'06',name:'Wood & plastics (framing)',base:8643},
  {num:'07',name:'Thermal & moisture protection',base:3729},
  {num:'08',name:'Openings (doors & windows)',base:4810},
  {num:'09',name:'Finishes (flooring, tile, drywall, paint)',base:17160},
  {num:'10',name:'Specialties (bath accessories)',base:1050},
  {num:'11',name:'Equipment (bar sink & appliances)',base:710},
  {num:'12',name:'Furnishings (cabinets & countertops)',base:5800},
  {num:'14',name:'Conveying (stair nosing)',base:285},
  {num:'15',name:'Mechanical (plumbing & HVAC)',base:7485},
  {num:'16',name:'Electrical',base:3905},
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

function calcTotals(tier) {
  const direct = DIVISIONS.reduce((s,d) => s + d.base, 0)
  const mult   = TIER_MULT[tier]
  const tiered = direct * mult
  const cont   = tiered * 0.05
  const op     = (tiered + cont) * 0.10
  const tax    = (tiered + cont + op) * 0.08
  return { direct, tiered, cont, op, tax, grand: tiered + cont + op + tax }
}

const PAYMENTS = [
  {label:'Deposit — contract signing',      pct:25},
  {label:'Demo & framing complete',          pct:25},
  {label:'Drywall & rough-ins complete',     pct:25},
  {label:'Paint, flooring & trim complete',  pct:20},
  {label:'Final punch list & closeout',      pct:5},
]

export default function ClientEstimate() {
  const [tier,        setTier]        = useState(null)
  const [confirmed,   setConfirmed]   = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const totals = tier ? calcTotals(tier) : null

  function confirmSelection() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sb_estimate', JSON.stringify({
        tier: tier,
        label: TIER_LABELS[tier],
        grand: Math.round(totals.grand),
        direct: Math.round(totals.direct),
        cont: Math.round(totals.cont),
        op: Math.round(totals.op),
        tax: Math.round(totals.tax),
        confirmedAt: new Date().toISOString(),
      }))
    }
    setConfirmed(true)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
  }

  const topbar = (
    <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
      <div>
        <img src='/logo.png' alt='SpanglerBuilt' style={{height:32,width:'auto'}}/>
        <div style={{fontSize:9,color:'#FF8C00',letterSpacing:'.16em',textTransform:'uppercase',marginTop:2}}>Project Estimate · Mendel Basement Renovation</div>
      </div>
      <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
    </div>
  )

  if (confirmed) {
    return (
      <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>
        {topbar}
        <div style={{maxWidth:700,margin:'3rem auto',padding:'0 1.5rem',textAlign:'center'}}>
          <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,padding:'3rem',borderTop:'4px solid #FF8C00'}}>
            <div style={{fontSize:40,marginBottom:'1rem'}}>✓</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:24,color:'#002147',marginBottom:8}}>Selection confirmed</div>
            <div style={{fontSize:13,color:'#9a9690',marginBottom:'2rem'}}>You selected the <strong style={{color:TIER_INFO[tier].color}}>{TIER_LABELS[tier]}</strong> tier at <strong style={{color:'#002147'}}>{fmt(totals.grand)}</strong></div>
            <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'1rem 1.5rem',marginBottom:'2rem',textAlign:'left'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>What happens next</div>
              <div style={{fontSize:13,color:'#3d3b37',lineHeight:1.8}}>
                1. Michael will review your selection and contact you within 1 business day.<br/>
                2. You'll receive your formal contract for review and signature.<br/>
                3. Once signed, we schedule your start date and order materials.
              </div>
            </div>
            <a href="/client/selections" style={{display:'inline-block',background:'#FF8C00',color:'#fff',padding:'12px 28px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none',borderRadius:3,marginRight:8}}>Choose your materials →</a>
            <a href="tel:4044927650" style={{display:'inline-block',background:'#002147',color:'#fff',padding:'12px 28px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none',borderRadius:3,marginRight:8}}>Call Michael</a>
            <button onClick={()=>{setConfirmed(false)}} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'12px 28px',fontSize:12,fontWeight:500,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Change selection</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>
      {topbar}

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.5rem'}}>

        {/* Project info */}
        <div style={{background:'#002147',borderRadius:4,padding:'1.25rem 1.5rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:18,color:'#fff',marginBottom:3}}>Ryan &amp; Dori Mendel</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>SB-2026-001 · 4995 Shadow Glen Ct, Dunwoody GA · 665 sf · Basement Renovation</div>
          </div>
          {tier && (
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>Your selection</div>
              <div style={{fontSize:20,color:'#FF8C00',fontWeight:500}}>{fmt(totals.grand)}</div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!tier && (
          <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'1rem 1.25rem',marginBottom:'1.5rem',fontSize:13,color:'#3d3b37',lineHeight:1.7}}>
            <strong style={{color:'#002147'}}>Select your tier below</strong> — each tier includes the same scope of work but with different materials and finishes. Your total updates instantly as you choose. Questions? Call Michael at (404) 492-7650.
          </div>
        )}

        {/* Tier selector cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12,marginBottom:'1.5rem'}}>
          {['good','better','best','luxury'].map(t => {
            const info    = TIER_INFO[t]
            const tot     = calcTotals(t)
            const selected = tier === t
            return (
              <div key={t} onClick={() => setTier(t)} style={{
                background:'#fff',
                border: selected ? `2px solid ${info.border}` : '1px solid #e8e6e0',
                borderRadius:4, cursor:'pointer', overflow:'hidden',
                transition:'all .15s',
                transform: selected ? 'scale(1.01)' : 'scale(1)',
              }}
              onMouseEnter={e => { if(!selected) e.currentTarget.style.borderColor = info.border }}
              onMouseLeave={e => { if(!selected) e.currentTarget.style.borderColor = '#e8e6e0' }}>
                {/* Tier header */}
                <div style={{background: selected ? info.border : '#002147',padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color: selected ? '#fff' : '#FF8C00'}}>{TIER_LABELS[t]}</div>
                    <div style={{fontSize:11,color: selected ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.5)',marginTop:1}}>{info.headline}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:18,fontWeight:500,color:'#fff'}}>{fmt(tot.grand)}</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em'}}>{TIER_MULT[t].toFixed(2)}× multiplier</div>
                  </div>
                </div>

                {/* What's included */}
                <div style={{padding:'12px 14px'}}>
                  {info.bullets.map((b,i) => (
                    <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'4px 0',borderBottom:i<info.bullets.length-1?'1px solid #f5f4f1':'none',fontSize:12,color:'#3d3b37'}}>
                      <span style={{color:info.color,fontSize:12,flexShrink:0,marginTop:1}}>✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                {/* Select button */}
                <div style={{padding:'0 14px 12px'}}>
                  <div style={{
                    textAlign:'center',padding:'8px',fontSize:11,fontWeight:700,
                    letterSpacing:'.08em',textTransform:'uppercase',borderRadius:3,
                    background: selected ? info.border : '#f5f4f1',
                    color: selected ? '#fff' : '#9a9690',
                    border: selected ? 'none' : '1px solid #e8e6e0',
                  }}>
                    {selected ? '✓ Selected' : 'Select this tier'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Live estimate breakdown — shows when tier is selected */}
        {tier && (
          <div>
            {/* Summary bar */}
            <div style={{background:'#002147',borderRadius:4,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
              <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
                {[
                  ['Direct cost',   fmt(totals.direct)],
                  ['Contingency',   fmt(totals.cont)],
                  ['O&P',           fmt(totals.op)],
                  ['GA sales tax',  fmt(totals.tax)],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13,color:'rgba(255,255,255,.8)',fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{TIER_LABELS[tier]} tier total</div>
                <div style={{fontSize:24,color:'#FF8C00',fontWeight:500}}>{fmt(totals.grand)}</div>
              </div>
            </div>

            {/* Toggle details */}
            <button onClick={()=>setShowDetails(!showDetails)} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'6px 16px',fontSize:11,cursor:'pointer',borderRadius:3,marginBottom:12,fontFamily:'sans-serif',fontWeight:500}}>
              {showDetails ? '▲ Hide' : '▼ Show'} division breakdown
            </button>

            {/* Division breakdown */}
            {showDetails && (
              <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',marginBottom:12}}>
                <div style={{display:'grid',gridTemplateColumns:'60px 1fr 110px 110px',gap:8,padding:'6px 12px',background:'#002147',fontSize:10,fontWeight:500,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.04em'}}>
                  <span>Div</span><span>Description</span><span style={{textAlign:'right'}}>Base cost</span><span style={{textAlign:'right'}}>{TIER_LABELS[tier]} cost</span>
                </div>
                {DIVISIONS.map((d,i)=>(
                  <div key={d.num} style={{display:'grid',gridTemplateColumns:'60px 1fr 110px 110px',gap:8,padding:'7px 12px',borderTop:i===0?'none':'1px solid #f5f4f1',fontSize:12,background:i%2===0?'#fff':'#fafaf8'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#FFFCEB'}
                    onMouseLeave={e=>e.currentTarget.style.background=i%2===0?'#fff':'#fafaf8'}>
                    <span style={{color:'#9a9690',fontSize:10,fontWeight:700}}>DIV {d.num}</span>
                    <span style={{color:'#3d3b37'}}>{d.name}</span>
                    <span style={{textAlign:'right',color:'#9a9690'}}>{fmt(d.base)}</span>
                    <span style={{textAlign:'right',fontWeight:500,color:'#002147'}}>{fmt(d.base*TIER_MULT[tier])}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment schedule */}
            <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',marginBottom:'1.5rem'}}>
              <div style={{padding:'8px 12px',background:'#002147',fontSize:10,fontWeight:500,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.08em'}}>
                Payment schedule — {TIER_LABELS[tier]} tier ({fmt(totals.grand)})
              </div>
              {PAYMENTS.map((p,i)=>(
                <div key={p.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderTop:i===0?'none':'1px solid #f5f4f1',fontSize:12}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:10,color:'#FF8C00',fontWeight:700,minWidth:28}}>{p.pct}%</span>
                    <span style={{color:'#3d3b37'}}>{p.label}</span>
                  </div>
                  <span style={{fontWeight:500,color:'#002147'}}>{fmt(totals.grand*p.pct/100)}</span>
                </div>
              ))}
            </div>

            {/* Confirm button */}
            <div style={{textAlign:'center'}}>
              <button onClick={confirmSelection} style={{
                background:'#FF8C00',color:'#fff',border:'none',
                padding:'14px 48px',fontSize:13,fontWeight:700,
                letterSpacing:'.1em',textTransform:'uppercase',
                cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',
              }}>
                Confirm {TIER_LABELS[tier]} tier selection →
              </button>
              <div style={{fontSize:11,color:'#9a9690',marginTop:8}}>Michael will follow up within 1 business day to finalize your contract.</div>
            </div>
          </div>
        )}

        <div style={{marginTop:'1.5rem',fontSize:10,color:'#9a9690',textAlign:'center'}}>
          SpanglerBuilt Inc. · Michael Spangler, GC · (404) 492-7650 · michael@spanglerbuilt.com · Estimate valid 30 days
        </div>
      </div>
    </div>
  )
}
