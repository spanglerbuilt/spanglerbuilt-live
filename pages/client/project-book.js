import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { INIT_OPTION_GROUPS } from '../contractor/options'

var DEFAULT_PROJECT = {
  number:'SB-2026-001', client:'Ryan & Dori Mendel',
  address:'4995 Shadow Glen Ct, Dunwoody, GA 30338',
  type:'Basement Renovation', tier:'Better', price:62500,
  start:'April 28, 2026', end:'June 20, 2026', prepared:'March 31, 2026',
}

var HEADSHOT = 'https://images.squarespace-cdn.com/content/v1/69358d7c8272151c17be540c/f801ea2e-5193-427a-aacb-eff13f1ae8cf/IMG_6546.jpg'

var DEFAULT_MILESTONES = [
  {label:'Deposit — contract signing',    pct:25,date:'April 28'},
  {label:'Demo and framing complete',     pct:25,date:'May 12'},
  {label:'Drywall and rough-ins complete',pct:25,date:'May 28'},
  {label:'Paint, flooring and trim',      pct:20,date:'June 10'},
  {label:'Final punch list and closeout', pct:5, date:'June 20'},
]

var PHASES = [
  {num:1,name:'Pre-construction',           dates:'April 14–28',    items:['Site visit and final measurements','Permit application submitted','Material selections finalized','Subcontractor schedule confirmed']},
  {num:2,name:'Demo and framing',           dates:'April 28–May 12',items:['Existing finishes demolished','Concrete floor prepped and leveled','Moisture barrier installed','Perimeter and interior walls framed']},
  {num:3,name:'Rough mechanicals',          dates:'May 12–28',      items:['Bathroom plumbing rough-in','Electrical panel review and new circuits','20 LED recessed light rough-in','HVAC ductwork extension']},
  {num:4,name:'Insulation, drywall & finishes',dates:'May 28–June 10',items:['Spray foam — rim joists','Drywall hang and finish level 4','Tile — bathroom floor and shower walls','LVP flooring installation','Paint 2 coats']},
  {num:5,name:'Fixtures, trim & closeout',  dates:'June 10–20',     items:['Plumbing fixtures installed','Bar cabinets and countertop','Interior doors and hardware','Electrical fixtures and lighting','Final walkthrough']},
]

// Map CSI division numbers to project phases for dynamic SOW
var DIV_PHASE_MAP = {
  '01':'Pre-construction', '02':'Demo & site work', '03':'Demo & site work',
  '04':'Demo & site work', '05':'Structure & framing', '06':'Structure & framing',
  '07':'Insulation & moisture', '08':'Openings', '09':'Finishes',
  '10':'Specialties', '11':'Equipment', '12':'Furnishings',
  '14':'Conveying', '15':'Mechanical', '16':'Electrical',
}

function buildDynamicSOW(activeDivisions) {
  if (!activeDivisions || activeDivisions.length === 0) return null
  // Group divisions into phases
  var phaseMap = {}
  activeDivisions.forEach(function(div) {
    var phaseName = DIV_PHASE_MAP[div.num] || ('Division ' + div.num)
    if (!phaseMap[phaseName]) phaseMap[phaseName] = { name: phaseName, divs: [] }
    phaseMap[phaseName].divs.push(div)
  })
  return Object.values(phaseMap).map(function(phase, idx) {
    var items = phase.divs.flatMap(function(div) {
      return div.items.map(function(item) {
        return 'Div ' + div.num + ' — ' + item.desc + ' (' + item.qty + ' ' + item.unit + ')'
      })
    })
    return { num: idx + 1, name: phase.name, dates: '', items }
  })
}

var TENANTS = [
  {icon:'◉',name:'Owner on-site daily',desc:'Michael Spangler is personally present on every project, every day. No middlemen.'},
  {icon:'◻',name:'Transparent pricing', desc:'Every estimate in four tiers with complete line-item detail. No surprises.'},
  {icon:'✦',name:'Written everything',  desc:'Every change is a signed change order. Every commitment is in writing.'},
  {icon:'✓',name:'Craftsmanship first', desc:'We select subcontractors the same way we would hire for our own home.'},
  {icon:'◈',name:'Client partnership',  desc:'Your home is your most important investment. We treat it accordingly.'},
  {icon:'↗',name:'Long-term value',     desc:'We build with materials that hold up, backed by our 1-year warranty.'},
]

var STEPS = [
  {n:'01',t:'Initial consultation',    d:'We visit your home, listen to your vision, take measurements, and understand your goals.'},
  {n:'02',t:'4-tier written estimate', d:'Within 48 hours of our site visit, you receive a complete written estimate in all four tiers.'},
  {n:'03',t:'Presentation',            d:'We walk you through every material selection room by room at each price point.'},
  {n:'04',t:'Contract and project book',d:'Once you select your tier, we prepare your contract and this project book.'},
  {n:'05',t:'Build',                   d:'Michael is on your job site every day. Direct access by phone, text, or client portal.'},
  {n:'06',t:'Closeout and warranty',   d:'We walk the project together, complete the punch list, and hand you a 1-year warranty.'},
]

var TIER_PRICES = { good:53000, better:62500, best:73000, luxury:87500 }
var TIER_COLORS = {
  good:  { color:'#3B6D11', bg:'#eaf3de' },
  better:{ color:'#185FA5', bg:'#e6f1fb' },
  best:  { color:'#534AB7', bg:'#eeedfe' },
  luxury:{ color:'#854F0B', bg:'#faeeda' },
}

// Photos keyed by selection category id
var CATEGORY_PHOTOS = {
  flooring:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  lighting:     'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80',
  paint:        'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&q=80',
  doors:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  bath_floor:   'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  shower_wall:  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  shower_floor: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  shower_bench: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  shower_door:  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  toilet:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  fixtures:     'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80',
  vanity:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  cabinets:     'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
  countertops:  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  // legacy keys
  tile:  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
  shower:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
}

var ROOM_CATS = [
  { room:'Main Area',  cats:['flooring','lighting','paint','doors'] },
  { room:'Bathroom',   cats:['bath_floor','shower_wall','shower_floor','shower_bench','shower_door','toilet','fixtures','vanity'] },
  { room:'Bar Area',   cats:['cabinets','countertops'] },
]

var CAT_LABELS = {
  flooring:'Flooring', lighting:'Lighting package', paint:'Paint colors', doors:'Interior doors',
  bath_floor:'Floor tile', shower_wall:'Shower wall tile', shower_floor:'Shower floor tile',
  shower_bench:'Shower bench & niche', shower_door:'Shower door / enclosure', toilet:'Toilet',
  fixtures:'Faucets & hardware', vanity:'Vanity',
  cabinets:'Bar cabinets', countertops:'Bar countertop',
  // legacy
  tile:'Bathroom tile', shower:'Shower enclosure',
}

function fmt(n){ return '$' + Math.round(n).toLocaleString('en-US') }

function SectionBar(props) {
  return (
    <div style={{background:'#0a0a0a',borderLeft:'6px solid #D06830',padding:'1rem 2rem'}}>
      <div style={{fontSize:10,color:'#D06830',letterSpacing:'.2em',textTransform:'uppercase',fontFamily:'Poppins,sans-serif'}}>{props.label}</div>
    </div>
  )
}

function Section(props) {
  return <div style={{padding:'2.5rem 3rem',borderBottom:'1px solid #e8e6e0'}}>{props.children}</div>
}

function Eyebrow(props) {
  return <div style={{fontSize:9,color:'#D06830',letterSpacing:'.2em',textTransform:'uppercase',fontFamily:'Poppins,sans-serif',marginBottom:'.75rem'}}>{props.children}</div>
}

function H2(props) {
  return <div style={{fontSize:28,fontWeight:400,marginBottom:'1.5rem',color:'#0a0a0a',fontFamily:'Poppins,sans-serif'}}>{props.children}</div>
}

export default function ProjectBook() {
  var router = useRouter()
  var [estimate,     setEstimate]     = useState(null)
  var [selections,   setSelections]   = useState({})
  var [approved,     setApproved]     = useState(false)
  var [optionPicks,  setOptionPicks]  = useState({})
  var [loading,      setLoading]      = useState(false)
  var [projectMeta,  setProjectMeta]  = useState(null)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var est = localStorage.getItem('sb_estimate')
      if (est) setEstimate(JSON.parse(est))
    } catch(e) {}
    try {
      var sel = localStorage.getItem('sb_selections')
      if (sel) setSelections(JSON.parse(sel))
    } catch(e) {}
    try {
      if (localStorage.getItem('sb_approved') === '1') setApproved(true)
    } catch(e) {}
    try {
      var ops = localStorage.getItem('sb_option_picks')
      if (ops) setOptionPicks(JSON.parse(ops))
    } catch(e) {}
  }, [])

  useEffect(function() {
    if (!router.isReady || !router.query.id) return
    setLoading(true)
    fetch('/api/projects/' + router.query.id + '/book')
      .then(function(r){ return r.json() })
      .then(function(data) {
        if (data.estimate)    setEstimate(data.estimate)
        if (data.selections)  setSelections(data.selections)
        if (data.optionPicks) setOptionPicks(data.optionPicks)
        if (data.approved)    setApproved(data.approved)
        if (data.project)     setProjectMeta(data.project)
        setLoading(false)
      })
      .catch(function(){ setLoading(false) })
  }, [router.isReady, router.query.id])

  var tierKey    = estimate ? estimate.tier : 'better'
  var tierLabel  = estimate ? estimate.label : DEFAULT_PROJECT.tier
  var price      = estimate ? estimate.grand : DEFAULT_PROJECT.price
  var tc         = TIER_COLORS[tierKey] || TIER_COLORS.better

  // Calculate upgrade delta from option picks
  var upgradeDelta = INIT_OPTION_GROUPS.reduce(function(sum, g) {
    var selId = optionPicks[g.id]
    if (!selId) return sum
    var opt = g.options.find(function(o){ return o.id === selId })
    return sum + (opt && opt.delta ? opt.delta : 0)
  }, 0)
  var finalPrice = price + upgradeDelta
  var hasUpgrades = upgradeDelta > 0

  // Selected upgrades (non-included options)
  var selectedUpgrades = INIT_OPTION_GROUPS.reduce(function(acc, g) {
    var selId = optionPicks[g.id]
    if (!selId) return acc
    var opt = g.options.find(function(o){ return o.id === selId })
    if (opt && opt.delta > 0) acc.push({ group: g, opt: opt })
    return acc
  }, [])

  var milestones = DEFAULT_MILESTONES.map(function(m){
    return Object.assign({}, m, { amount: Math.round(finalPrice * m.pct / 100) })
  })

  var hasSelections = Object.keys(selections).length > 0

  return (
    <div style={{background:'#fff',color:'#0a0a0a',fontFamily:'Poppins,sans-serif',maxWidth:900,margin:'0 auto'}}>
      <style>{'.no-print{} @media print{.no-print{display:none!important}.pb{page-break-before:always}} @page{margin:.75in;size:letter}'}</style>

      <div className="no-print" style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:32,width:'auto'}}/>
        {loading && (
          <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:'Poppins,sans-serif',letterSpacing:'.05em'}}>Loading project data…</div>
        )}
        <div style={{display:'flex',gap:8}}>
          <button onClick={function(){window.print()}} style={{background:'#D06830',color:'#fff',border:'none',padding:'8px 20px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.06em',textTransform:'uppercase'}}>Print / Save PDF</button>
          <a href="/client/dashboard" style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'rgba(255,255,255,.7)',padding:'8px 16px',fontSize:12,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>Back</a>
        </div>
      </div>

      {/* COVER */}
      <div style={{background:'#0a0a0a',padding:'3rem',minHeight:480,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
        <div>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:48,width:'auto',marginBottom:'2rem'}}/>
          <div style={{width:48,height:4,background:'#D06830',borderRadius:2,marginBottom:'1rem'}}/>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.2em',textTransform:'uppercase',fontFamily:'Poppins,sans-serif',marginBottom:'1rem'}}>Project proposal and agreement</div>
          <div style={{fontSize:44,color:'#fff',fontWeight:400,lineHeight:1.15,marginBottom:'.75rem'}}>{projectMeta ? projectMeta.client_name : DEFAULT_PROJECT.client}</div>
          <div style={{fontSize:16,color:'rgba(255,255,255,.65)',marginBottom:'.5rem',fontFamily:'Poppins,sans-serif'}}>{projectMeta ? projectMeta.address : DEFAULT_PROJECT.address}</div>
          <div style={{fontSize:14,color:'#D06830',fontFamily:'Poppins,sans-serif',marginBottom: approved ? '1rem' : '2.5rem'}}>
            {projectMeta ? projectMeta.project_type : DEFAULT_PROJECT.type} · {tierLabel} Tier · {fmt(finalPrice)}
            {hasUpgrades && <span style={{fontSize:11,opacity:.7,marginLeft:6}}>(base {fmt(price)} + upgrades {fmt(upgradeDelta)})</span>}
          </div>
          {approved && (
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(59,109,17,.3)',border:'1px solid rgba(59,109,17,.6)',borderRadius:4,padding:'8px 16px',marginBottom:'1.5rem'}}>
              <span style={{color:'#90EE90',fontSize:14}}>✓</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,.8)',fontFamily:'Poppins,sans-serif',fontWeight:600}}>Selections approved — ready for contract</span>
            </div>
          )}
          <div style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:4,padding:'1.5rem 2rem',display:'inline-block'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem 3rem'}}>
              {[['Project',projectMeta ? projectMeta.project_number : DEFAULT_PROJECT.number],['Tier',tierLabel+' — '+fmt(finalPrice)],['Timeline',DEFAULT_PROJECT.start+' to '+DEFAULT_PROJECT.end],['Prepared',DEFAULT_PROJECT.prepared]].map(function(item){return(
                <div key={item[0]}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'Poppins,sans-serif',marginBottom:4}}>{item[0]}</div>
                  <div style={{fontSize:12,color:'#fff',fontFamily:'Poppins,sans-serif'}}>{item[1]}</div>
                </div>
              )})}
            </div>
          </div>
        </div>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',fontFamily:'Poppins,sans-serif',letterSpacing:'.06em',marginTop:'2rem'}}>SPANGLERBUILT INC. · 44 MILTON AVE SUITE 243 · WOODSTOCK GA 30188 · (404) 492-7650 · SPANGLERBUILT.COM</div>
      </div>

      {/* ABOUT */}
      <div className="pb"><SectionBar label="About SpanglerBuilt"/></div>
      <Section>
        <Eyebrow>A message from our founder</Eyebrow>
        <H2>Michael Spangler, CEO and Founder</H2>
        <div style={{display:'grid',gridTemplateColumns:'180px 1fr',gap:'2.5rem',alignItems:'start',marginBottom:'2rem'}}>
          <div>
            <img src={HEADSHOT} alt="Michael Spangler" style={{width:'100%',borderRadius:4,marginBottom:12,border:'3px solid #D06830'}} onError={function(e){e.target.style.display='none'}}/>
            <div style={{fontSize:13,fontWeight:600,color:'#0a0a0a',fontFamily:'Poppins,sans-serif'}}>Michael Spangler</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>CEO and Founder</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>Licensed General Contractor</div>
            <div style={{fontSize:12,color:'#D06830',fontFamily:'Poppins,sans-serif',marginTop:6,fontWeight:600}}>(404) 492-7650</div>
          </div>
          <div>
            <p style={{fontSize:13,lineHeight:1.85,color:'rgba(255,255,255,.65)',fontFamily:'Poppins,sans-serif',marginBottom:'1rem'}}>SpanglerBuilt was founded on a simple belief: homeowners deserve a contractor who shows up, communicates clearly, and delivers exactly what they were promised — every time.</p>
            <p style={{fontSize:13,lineHeight:1.85,color:'rgba(255,255,255,.65)',fontFamily:'Poppins,sans-serif',marginBottom:'1rem'}}>When you hire SpanglerBuilt, you get me — on your job site, every day, personally accountable for every decision made. We serve homeowners across Cherokee, Fulton, Cobb, and DeKalb counties who want a partner who treats their investment with the same respect they do.</p>
            <div style={{background:'#0a0a0a',borderRadius:4,padding:'1rem 1.25rem',borderLeft:'4px solid #D06830'}}>
              <div style={{fontSize:14,color:'#fff',fontStyle:'italic',lineHeight:1.7}}>"We build more than projects — we build lifestyles."</div>
            </div>
          </div>
        </div>
        <div style={{width:48,height:4,background:'#D06830',borderRadius:2,marginBottom:'1rem'}}/>
        <Eyebrow>Our core tenants</Eyebrow>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem',marginTop:'1rem'}}>
          {TENANTS.map(function(t){return(
            <div key={t.name} style={{borderTop:'3px solid #0a0a0a',paddingTop:'1rem'}}>
              <div style={{fontSize:18,marginBottom:6,color:'#D06830'}}>{t.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:'#0a0a0a',marginBottom:4,fontFamily:'Poppins,sans-serif',textTransform:'uppercase',letterSpacing:'.04em'}}>{t.name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.7,fontFamily:'Poppins,sans-serif'}}>{t.desc}</div>
            </div>
          )})}
        </div>
      </Section>

      {/* PROCESS */}
      <div className="pb"><SectionBar label="How We Work"/></div>
      <Section>
        <Eyebrow>Our process</Eyebrow>
        <H2>How SpanglerBuilt works</H2>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
          {STEPS.map(function(s){return(
            <div key={s.n} style={{display:'flex',gap:'1rem',alignItems:'flex-start',padding:'1.25rem',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,borderTop:'3px solid #D06830'}}>
              <div style={{width:40,height:40,background:'#0a0a0a',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif',flexShrink:0}}>{s.n}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#0a0a0a',marginBottom:4,fontFamily:'Poppins,sans-serif'}}>{s.t}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.5)',lineHeight:1.7,fontFamily:'Poppins,sans-serif'}}>{s.d}</div>
              </div>
            </div>
          )})}
        </div>
      </Section>

      {/* ESTIMATE */}
      <div className="pb"><SectionBar label="Your Estimate"/></div>
      <Section>
        <Eyebrow>Your selected tier</Eyebrow>
        <H2>{tierLabel} Tier — {fmt(finalPrice)}</H2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {['good','better','best','luxury'].map(function(t){
            var sel = t === tierKey
            var c   = TIER_COLORS[t]
            return(
              <div key={t} style={{border:sel?'3px solid '+c.color:'1px solid #e8e6e0',borderRadius:4,padding:'1rem',background:sel?c.bg:'#fafaf8',textAlign:'center'}}>
                <div style={{fontSize:10,fontWeight:700,color:sel?c.color:'rgba(255,255,255,.35)',letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'Poppins,sans-serif',marginBottom:6}}>{t.charAt(0).toUpperCase()+t.slice(1)}{sel?' ✓':''}</div>
                <div style={{fontSize:20,fontWeight:sel?700:400,color:sel?c.color:'#c0c0c0',fontFamily:'Poppins,sans-serif'}}>{fmt(TIER_PRICES[t])}</div>
              </div>
            )
          })}
        </div>
        <div style={{background:'#0a0a0a',padding:'1.5rem 2rem',borderRadius:4,borderLeft:'6px solid #D06830'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom: hasUpgrades ? '1rem' : 0}}>
            <div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'Poppins,sans-serif',marginBottom:4}}>Contract total — {tierLabel} tier</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:'Poppins,sans-serif'}}>{DEFAULT_PROJECT.type} · {DEFAULT_PROJECT.address}</div>
              {estimate && (
                <div style={{display:'flex',gap:20,marginTop:8}}>
                  {[['Direct cost',estimate.direct],['Contingency',estimate.cont],['O&P',estimate.op],['GA sales tax',estimate.tax]].map(function(item){return(
                    <div key={item[0]}>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>{item[0]}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.7)',fontFamily:'Poppins,sans-serif'}}>{item[1]?fmt(item[1]):'—'}</div>
                    </div>
                  )})}
                </div>
              )}
            </div>
            <div style={{textAlign:'right'}}>
              {hasUpgrades && <div style={{fontSize:13,color:'rgba(255,255,255,.5)',fontFamily:'Poppins,sans-serif',marginBottom:4}}>{fmt(price)} base</div>}
              <div style={{fontSize:36,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif'}}>{fmt(finalPrice)}</div>
              {hasUpgrades && <div style={{fontSize:12,color:'#D06830',opacity:.8,fontFamily:'Poppins,sans-serif'}}>includes +{fmt(upgradeDelta)} upgrades</div>}
            </div>
          </div>
          {hasUpgrades && (
            <div style={{borderTop:'1px solid rgba(255,255,255,.15)',paddingTop:'1rem',display:'flex',gap:16,flexWrap:'wrap'}}>
              {selectedUpgrades.map(function(u){return(
                <div key={u.group.id} style={{background:'rgba(255,140,0,.15)',border:'1px solid rgba(255,140,0,.3)',borderRadius:3,padding:'5px 10px'}}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em'}}>{u.group.label}</div>
                  <div style={{fontSize:11,color:'#fff',fontFamily:'Poppins,sans-serif'}}>{u.opt.name} <span style={{color:'#D06830',fontWeight:700}}>+{fmt(u.opt.delta)}</span></div>
                </div>
              )})}
            </div>
          )}
        </div>
      </Section>

      {/* MATERIAL SELECTIONS */}
      <div className="pb"><SectionBar label="Material Selections"/></div>
      <Section>
        <Eyebrow>{tierLabel} tier materials</Eyebrow>
        <H2>Your confirmed selections {approved && <span style={{fontSize:14,background:'#eaf3de',color:'#3B6D11',padding:'3px 12px',borderRadius:20,fontFamily:'Poppins,sans-serif',fontWeight:600,letterSpacing:'.04em',verticalAlign:'middle'}}>✓ Approved</span>}</H2>
        {!hasSelections && (
          <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'1.25rem 1.5rem',fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:'Poppins,sans-serif',lineHeight:1.7}}>
            Material selections have not been confirmed yet. Visit the <strong>My Selections</strong> section of your client portal to choose your finishes. Once confirmed, they will appear here automatically.
          </div>
        )}
        {hasSelections && ROOM_CATS.map(function(rc) {
          var roomSels = rc.cats.filter(function(c){ return selections[c] })
          if (roomSels.length === 0) return null
          return (
            <div key={rc.room} style={{marginBottom:'2rem'}}>
              <div style={{fontSize:10,fontWeight:700,color:tc.color,textTransform:'uppercase',letterSpacing:'.12em',fontFamily:'Poppins,sans-serif',marginBottom:12,borderBottom:'2px solid '+tc.color,paddingBottom:6}}>{rc.room}</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem'}}>
                {roomSels.map(function(catId) {
                  var sel   = selections[catId]
                  var photo = CATEGORY_PHOTOS[catId]
                  return (
                    <div key={catId} style={{border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
                      {photo && <img src={photo} alt={catId} style={{width:'100%',height:120,objectFit:'cover',display:'block'}} onError={function(e){e.target.style.display='none'}}/>}
                      <div style={{padding:'10px 14px'}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:3}}>{CAT_LABELS[catId] || catId}</div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:20,height:20,borderRadius:'50%',background:sel.hex||'#ccc',border:'1px solid rgba(0,0,0,.12)',flexShrink:0}}/>
                          <div style={{fontSize:13,fontWeight:600,color:'#0a0a0a',fontFamily:'Poppins,sans-serif'}}>{sel.value}</div>
                        </div>
                        {sel.brand && <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:3,fontFamily:'Poppins,sans-serif'}}>{sel.brand}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {hasSelections && (
          <div style={{background:'#1a1a1a',borderRadius:4,padding:'10px 14px',marginTop:'.5rem',fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>
            All selections above are confirmed by client. Material orders will be placed per project schedule.
          </div>
        )}
      </Section>

      {/* UPGRADES */}
      {hasUpgrades && (
        <>
          <div className="pb"><SectionBar label="Options &amp; Upgrades"/></div>
          <Section>
            <Eyebrow>Upgrades above standard inclusions</Eyebrow>
            <H2>Selected upgrades — +{fmt(upgradeDelta)}</H2>
            <div style={{display:'grid',gap:'1rem',marginBottom:'1.5rem'}}>
              {selectedUpgrades.map(function(u){
                var opt = u.opt
                return (
                  <div key={u.group.id} style={{display:'grid',gridTemplateColumns:'80px 1fr auto',gap:'1rem',alignItems:'center',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
                    <img src={opt.photo} alt={opt.name} style={{width:'100%',height:80,objectFit:'cover',display:'block'}} onError={function(e){e.target.style.display='none'}}/>
                    <div style={{padding:'10px 0'}}>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:2}}>{u.group.label} · {u.group.room}</div>
                      <div style={{fontSize:13,fontWeight:700,color:'#0a0a0a',fontFamily:'Poppins,sans-serif',marginBottom:2}}>{opt.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>{opt.brand} · {opt.spec}</div>
                    </div>
                    <div style={{padding:'0 1.25rem',textAlign:'right'}}>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.06em',fontFamily:'Poppins,sans-serif',marginBottom:2}}>Upgrade</div>
                      <div style={{fontSize:18,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif'}}>+{fmt(opt.delta)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{background:'#0a0a0a',borderRadius:4,padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderLeft:'6px solid #D06830'}}>
              <div style={{display:'flex',gap:32}}>
                <div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:3}}>Base estimate ({tierLabel})</div>
                  <div style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,.8)',fontFamily:'Poppins,sans-serif'}}>{fmt(price)}</div>
                </div>
                <div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:3}}>Upgrade total</div>
                  <div style={{fontSize:16,fontWeight:600,color:'#D06830',fontFamily:'Poppins,sans-serif'}}>+{fmt(upgradeDelta)}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:3}}>Revised contract total</div>
                <div style={{fontSize:28,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif'}}>{fmt(finalPrice)}</div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* SCOPE */}
      <div className="pb"><SectionBar label="Scope of Work"/></div>
      <Section>
        <Eyebrow>What we are building</Eyebrow>
        <H2>Scope of work</H2>
        {(function(){
          var dynamicPhases = estimate && estimate.activeDivisions ? buildDynamicSOW(estimate.activeDivisions) : null
          var phases = dynamicPhases || PHASES
          var isDynamic = !!dynamicPhases
          return (
            <>
              {isDynamic && (
                <div style={{background:'#eaf3de',border:'1px solid #c8dfc0',borderRadius:3,padding:'8px 12px',marginBottom:'1.25rem',fontSize:11,color:'#3B6D11',fontFamily:'Poppins,sans-serif'}}>
                  ✓ Scope generated from your estimate — only active line items shown
                </div>
              )}
              {phases.map(function(ph,pi){return(
                <div key={ph.num} style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:'1.5rem',marginBottom:'1.25rem',paddingBottom:'1.25rem',borderBottom:pi<phases.length-1?'1px solid #f5f4f1':'none'}}>
                  <div style={{background:pi%2===0?'#0a0a0a':'#D06830',borderRadius:4,padding:'1rem'}}>
                    <div style={{fontSize:22,fontWeight:700,color:'rgba(255,255,255,.3)',fontFamily:'Poppins,sans-serif',marginBottom:4}}>{String(ph.num).padStart(2,'0')}</div>
                    <div style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:'Poppins,sans-serif',marginBottom:4}}>{ph.name}</div>
                    {ph.dates && <div style={{fontSize:11,color:'rgba(255,255,255,.65)',fontFamily:'Poppins,sans-serif'}}>{ph.dates}</div>}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:6}}>
                    {ph.items.map(function(item){return(
                      <div key={item} style={{display:'flex',gap:8,alignItems:'flex-start',fontSize:12,color:'rgba(255,255,255,.65)',fontFamily:'Poppins,sans-serif'}}>
                        <span style={{color:'#D06830',flexShrink:0,fontWeight:700}}>✓</span><span>{item}</span>
                      </div>
                    )})}
                  </div>
                </div>
              )})}
            </>
          )
        })()}
      </Section>

      {/* PAYMENT */}
      <div className="pb"><SectionBar label="Payment Schedule"/></div>
      <Section>
        <Eyebrow>5-milestone payment plan</Eyebrow>
        <H2>Payment schedule</H2>
        <div style={{border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'10px 20px',background:'#0a0a0a',fontSize:9,fontWeight:700,color:'#D06830',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'Poppins,sans-serif'}}>
            <span>#</span><span>Milestone</span><span>%</span><span>Due</span><span style={{textAlign:'right'}}>Amount</span>
          </div>
          {milestones.map(function(m,i){return(
            <div key={i} style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'14px 20px',borderTop:'1px solid #f5f4f1',alignItems:'center',background:i%2===0?'#fff':'#fafaf8'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif'}}>{i+1}</div>
              <div style={{fontSize:12,color:'#0a0a0a',fontFamily:'Poppins,sans-serif'}}>{m.label}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>{m.pct}%</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>{m.date}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#0a0a0a',fontFamily:'Poppins,sans-serif',textAlign:'right'}}>{fmt(m.amount)}</div>
            </div>
          )})}
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'14px 20px',background:'#0a0a0a',alignItems:'center'}}>
            <div/><div>
              <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)',fontFamily:'Poppins,sans-serif'}}>Total contract value</div>
              {hasUpgrades && <div style={{fontSize:10,color:'rgba(255,255,255,.4)',fontFamily:'Poppins,sans-serif'}}>Includes +{fmt(upgradeDelta)} upgrades</div>}
            </div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.4)',fontFamily:'Poppins,sans-serif'}}>100%</div><div/>
            <div style={{fontSize:20,fontWeight:700,color:'#D06830',fontFamily:'Poppins,sans-serif',textAlign:'right'}}>{fmt(finalPrice)}</div>
          </div>
        </div>
      </Section>

      {/* WARRANTY */}
      <div className="pb"><SectionBar label="Warranty and Agreement"/></div>
      <div style={{padding:'2.5rem 3rem'}}>
        <Eyebrow>Workmanship warranty</Eyebrow>
        <H2>1-year warranty and authorization</H2>
        <div style={{background:'#0a0a0a',borderRadius:4,padding:'1.5rem 2rem',marginBottom:'1.5rem',borderLeft:'6px solid #D06830'}}>
          <div style={{fontSize:15,color:'#fff',marginBottom:'.75rem',lineHeight:1.5,fontFamily:'Poppins,sans-serif'}}>SpanglerBuilt warrants all workmanship for one full year from the date of project completion.</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.65)',lineHeight:1.8,fontFamily:'Poppins,sans-serif'}}>This warranty covers defects in workmanship and installation. It does not cover damage caused by misuse, normal wear and tear, or acts of nature. Manufacturer warranties are separate and may extend beyond this period.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'2.5rem'}}>
          {[['Coverage period','1 year from project completion date'],['What is covered','All labor and installation by SpanglerBuilt'],['Response time','Michael responds within 2 business days'],['How to submit','Client portal · (404) 492-7650']].map(function(item){return(
            <div key={item[0]} style={{borderTop:'3px solid #D06830',paddingTop:'1rem'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',fontFamily:'Poppins,sans-serif',marginBottom:4}}>{item[0]}</div>
              <div style={{fontSize:12,color:'#0a0a0a',fontFamily:'Poppins,sans-serif',lineHeight:1.6}}>{item[1]}</div>
            </div>
          )})}
        </div>
        <div style={{borderTop:'2px solid #0a0a0a',paddingTop:'2rem',marginBottom:'2rem'}}>
          <Eyebrow>Authorization and agreement</Eyebrow>
          <div style={{fontSize:12,color:'rgba(255,255,255,.5)',fontFamily:'Poppins,sans-serif',marginBottom:'2rem',lineHeight:1.7}}>Client signature confirms acceptance of all scope, selected tier, payment schedule, and terms in this project book.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem'}}>
            <div>
              <div style={{borderBottom:'2px solid #0a0a0a',height:48,marginBottom:8}}/>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>Client signature · Date</div>
            </div>
            <div>
              <div style={{borderBottom:'2px solid #0a0a0a',height:48,marginBottom:8}}/>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif'}}>Michael Spangler — SpanglerBuilt Inc. · Date</div>
            </div>
          </div>
        </div>
        <div style={{borderTop:'1px solid #e8e6e0',paddingTop:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:28,width:'auto'}}/>
          <div style={{fontSize:9,color:'rgba(255,255,255,.35)',fontFamily:'Poppins,sans-serif',textAlign:'right',lineHeight:1.7}}>
            SpanglerBuilt Inc. · Design/Build Contractor · GC &amp; Home Builder<br/>
            44 Milton Ave, Suite 243 · Woodstock, GA 30188<br/>
            (404) 492-7650 · michael@spanglerbuilt.com · spanglerbuilt.com<br/>
            Licensed General Contractor · State of Georgia · {projectMeta ? projectMeta.project_number : DEFAULT_PROJECT.number}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
