import { useState } from 'react'

var TIERS = [
  {
    id: 'good',
    label: 'Good',
    mult: '1.0×',
    price: 53000,
    color: '#3B6D11',
    bg: '#eaf3de',
    tagline: 'Quality materials, clean finish',
    bullets: [
      'Standard LVP flooring — Shaw Floors or Armstrong',
      'Ceramic tile — bathroom floor and shower walls',
      'Stock shaker cabinets — bar area',
      'Builder-grade plumbing fixtures',
      'Standard hollow-core interior doors',
      'Brushed nickel hardware throughout',
      'Standard LED recessed lighting package',
    ],
    ideal: 'Great for homeowners focused on maximizing value and function.',
  },
  {
    id: 'better',
    label: 'Better',
    mult: '1.18×',
    price: 62500,
    color: '#185FA5',
    bg: '#e6f1fb',
    tagline: 'Upgraded finishes, better durability',
    bullets: [
      'Premium waterproof LVP — COREtec or LifeProof',
      'Porcelain tile — wood or stone look',
      'Semi-custom cabinets with dovetail drawers',
      'Mid-grade matte black or polished chrome fixtures',
      'Solid-core shaker doors',
      'Matte black or satin brass hardware',
      'Dimmable LED lighting with smart switches',
    ],
    ideal: 'Most popular choice — the best balance of quality and value.',
  },
  {
    id: 'best',
    label: 'Best',
    mult: '1.38×',
    price: 73000,
    color: '#534AB7',
    bg: '#eeedfe',
    tagline: 'Designer finishes, premium everything',
    bullets: [
      'Engineered hardwood-look premium LVP — Pergo or Mohawk',
      'Large-format porcelain — premium stone look',
      'Semi-custom inset or full-overlay cabinets',
      'Thermostatic shower valve and designer fixtures',
      'Solid-core 8-foot tall doors',
      'Unlacquered brass or oil-rubbed bronze hardware',
      'Full lighting design package with dimmers',
    ],
    ideal: 'For homeowners who want a truly custom feel without full luxury pricing.',
  },
  {
    id: 'luxury',
    label: 'Luxury',
    mult: '1.65×',
    price: 87500,
    color: '#854F0B',
    bg: '#faeeda',
    tagline: 'Custom everything, top of market',
    bullets: [
      'Wide-plank engineered hardwood or natural stone',
      'Natural marble, travertine, or designer porcelain',
      'Full custom cabinetry — any style, any finish',
      'Full European thermostatic system — Grohe or Brizo',
      'Solid wood custom doors with custom profile',
      'Custom hardware — hand-forged or cast',
      'Lutron lighting control system',
    ],
    ideal: 'The finest materials and craftsmanship — built to last a lifetime.',
  },
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function Presentation() {
  var [current,    setCurrent]    = useState(0)
  var [fullscreen, setFullscreen] = useState(false)

  var tier = TIERS[current]

  function prev() { if (current > 0) setCurrent(current - 1) }
  function next() { if (current < TIERS.length - 1) setCurrent(current + 1) }

  function handleKey(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')  prev()
    if (e.key === 'Escape') setFullscreen(false)
  }

  var containerStyle = fullscreen
    ? {position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:9999,background:'#002147',display:'flex',flexDirection:'column',minHeight:'100vh'}
    : {minHeight:'100vh',background:'#002147',display:'flex',flexDirection:'column',fontFamily:'sans-serif'}

  return (
    <div style={containerStyle} onKeyDown={handleKey} tabIndex={0}>

      {/* Topbar */}
      <div style={{background:'rgba(0,0,0,.3)',padding:'.75rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:30,width:'auto'}}/>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase'}}>Project Estimate Presentation</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={function(){setFullscreen(!fullscreen)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'rgba(255,255,255,.7)',padding:'5px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
            {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.4)',textDecoration:'none'}}>← Back</a>
        </div>
      </div>

      {/* Tier dots */}
      <div style={{display:'flex',justifyContent:'center',gap:8,padding:'.75rem',flexShrink:0}}>
        {TIERS.map(function(t,i){return(
          <button key={t.id} onClick={function(){setCurrent(i)}} style={{width:10,height:10,borderRadius:'50%',border:'none',cursor:'pointer',background:i===current?'#FF8C00':'rgba(255,255,255,.3)',padding:0,transition:'all .2s'}}/>
        )})}
      </div>

      {/* Main slide */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem',maxWidth:900,margin:'0 auto',width:'100%'}}>

        {/* Tier badge */}
        <div style={{background:tier.color,color:'#fff',fontSize:12,fontWeight:700,letterSpacing:'.16em',textTransform:'uppercase',padding:'6px 20px',borderRadius:20,marginBottom:'1.25rem'}}>
          {tier.label} tier · {tier.mult} multiplier
        </div>

        {/* Price */}
        <div style={{fontFamily:'Georgia,serif',fontSize:fullscreen?72:56,fontWeight:400,color:'#fff',marginBottom:8,letterSpacing:'-.02em'}}>
          {fmt(tier.price)}
        </div>
        <div style={{fontSize:14,color:'rgba(255,255,255,.6)',marginBottom:'2rem',letterSpacing:'.04em'}}>{tier.tagline}</div>

        {/* Divider */}
        <div style={{width:60,height:3,background:'#FF8C00',borderRadius:2,marginBottom:'2rem'}}/>

        {/* Bullets */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 32px',width:'100%',marginBottom:'2rem'}}>
          {tier.bullets.map(function(b,i){return(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'#FF8C00',flexShrink:0,marginTop:7}}/>
              <span style={{fontSize:14,color:'rgba(255,255,255,.85)',lineHeight:1.6}}>{b}</span>
            </div>
          )})}
        </div>

        {/* Ideal for */}
        <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.15)',borderRadius:4,padding:'12px 20px',fontSize:13,color:'rgba(255,255,255,.7)',fontStyle:'italic',textAlign:'center',marginBottom:'2rem',maxWidth:600}}>
          {tier.ideal}
        </div>

        {/* All tier prices comparison */}
        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:'1.5rem'}}>
          {TIERS.map(function(t,i){return(
            <div key={t.id} onClick={function(){setCurrent(i)}} style={{background:i===current?t.color:'rgba(255,255,255,.08)',border:'1px solid '+(i===current?t.color:'rgba(255,255,255,.15)'),borderRadius:4,padding:'8px 16px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}>
              <div style={{fontSize:9,color:i===current?'rgba(255,255,255,.8)':'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:3}}>{t.label}</div>
              <div style={{fontSize:16,fontWeight:500,color:i===current?'#fff':'rgba(255,255,255,.5)'}}>{fmt(t.price)}</div>
            </div>
          )})}
        </div>
      </div>

      {/* Navigation */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem 2rem',flexShrink:0,background:'rgba(0,0,0,.2)'}}>
        <button onClick={prev} disabled={current===0} style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:current===0?'rgba(255,255,255,.2)':'#fff',padding:'10px 24px',fontSize:12,fontWeight:500,cursor:current===0?'default':'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.06em'}}>
          ← Previous
        </button>
        <div style={{fontSize:11,color:'rgba(255,255,255,.4)',letterSpacing:'.1em',textTransform:'uppercase'}}>
          {current+1} of {TIERS.length} · Use arrow keys to navigate
        </div>
        <button onClick={next} disabled={current===TIERS.length-1} style={{background:current===TIERS.length-1?'transparent':'#FF8C00',border:'1px solid '+(current===TIERS.length-1?'rgba(255,255,255,.3)':'#FF8C00'),color:current===TIERS.length-1?'rgba(255,255,255,.2)':'#fff',padding:'10px 24px',fontSize:12,fontWeight:500,cursor:current===TIERS.length-1?'default':'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.06em'}}>
          Next →
        </button>
      </div>
    </div>
  )
}
