import { useState, useEffect } from 'react'

// ─── Catalog data (copied from estimate.js) ──────────────────────────────────
var CATALOG = [
  // ── Flooring ──
  { id:'c01', div:'09', cat:'Flooring', types:['basement','kitchen','addition','bath'],
    desc:'Shaw Floorté Pro LVP', brand:'Shaw Floors', spec:'6mm · Waterproof · Click-lock', qty:600, unit:'SF', rate:6.25, allowance:true,
    link:'https://www.shawfloors.com' },
  { id:'c02', div:'09', cat:'Flooring', types:['basement','kitchen','addition'],
    desc:'COREtec Plus Enhanced LVP', brand:'COREtec', spec:'9" wide · 8mm · Cork underlay', qty:600, unit:'SF', rate:7.85, allowance:true,
    link:'https://www.coretecfloors.com' },
  { id:'c03', div:'09', cat:'Flooring', types:['kitchen','addition'],
    desc:'Anderson Tuftex Bernina Oak', brand:'Anderson Tuftex', spec:'Engineered hardwood · 7" wide', qty:400, unit:'SF', rate:9.49, allowance:true,
    link:'https://www.andersontuftex.com' },
  { id:'c04', div:'09', cat:'Flooring', types:['basement','kitchen','bath'],
    desc:'LVP installation labor', brand:'In-house', spec:'Click-lock · Glue-down option', qty:600, unit:'SF', rate:2.75,
    link:null },
  { id:'c05', div:'09', cat:'Flooring', types:['kitchen','addition','bath'],
    desc:'Hardwood installation labor', brand:'In-house', spec:'Nail-down or float', qty:400, unit:'SF', rate:4.25,
    link:null },
  // ── Tile ──
  { id:'c06', div:'09', cat:'Tile', types:['basement','bath'],
    desc:'Daltile Restore 12×24 ceramic', brand:'Daltile', spec:'Rectified · Frost resistant', qty:65, unit:'SF', rate:4.99, allowance:true,
    link:'https://www.daltile.com' },
  { id:'c07', div:'09', cat:'Tile', types:['basement','bath','kitchen'],
    desc:'MSI Carrara White 24×24', brand:'MSI Surfaces', spec:'Porcelain · Polished · Rectified', qty:65, unit:'SF', rate:8.99, allowance:true,
    link:'https://www.msisurfaces.com' },
  { id:'c08', div:'09', cat:'Tile', types:['bath','basement'],
    desc:'Tile installation labor — floor', brand:'In-house', spec:'Thinset · Grout · Sealed', qty:65, unit:'SF', rate:7.00,
    link:null },
  { id:'c09', div:'09', cat:'Tile', types:['bath','basement'],
    desc:'Shower wall tile installation labor', brand:'In-house', spec:'Large format capable', qty:120, unit:'SF', rate:9.50,
    link:null },
  { id:'c10', div:'07', cat:'Tile', types:['bath','basement'],
    desc:'Schluter Kerdi waterproofing membrane', brand:'Schluter Systems', spec:'Sheet membrane · Full coverage', qty:85, unit:'SF', rate:6.50,
    link:'https://www.schluter.com' },
  // ── Cabinets & countertops ──
  { id:'c11', div:'12', cat:'Cabinets', types:['kitchen','basement'],
    desc:'Hampton Bay shaker stock — base', brand:'Hampton Bay (Home Depot)', spec:'Plywood box · Soft-close hinges', qty:3, unit:'EA', rate:400, allowance:true,
    link:'https://www.homedepot.com' },
  { id:'c12', div:'12', cat:'Cabinets', types:['kitchen','basement'],
    desc:'KraftMaid dovetail shaker — semi-custom', brand:'KraftMaid', spec:'Dovetail drawers · Soft-close', qty:1, unit:'LS', rate:4200, allowance:true,
    link:'https://www.kraftmaid.com' },
  { id:'c13', div:'12', cat:'Cabinets', types:['kitchen'],
    desc:'Dura Supreme inset shaker — best', brand:'Dura Supreme', spec:'Inset doors · Soft-close · Any finish', qty:1, unit:'LS', rate:7800, allowance:true,
    link:'https://www.durasupreme.com' },
  { id:'c14', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Wilsonart HD laminate', brand:'Wilsonart', spec:'1.5" post-form · Easy clean', qty:30, unit:'SF', rate:28, allowance:true,
    link:'https://www.wilsonart.com' },
  { id:'c15', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Silestone quartz — Eternal Calacatta', brand:'Silestone by Cosentino', spec:'3cm · Eased edge · NSF certified', qty:30, unit:'SF', rate:65, allowance:true,
    link:'https://www.silestone.com' },
  { id:'c16', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Cambria Brittanicca Warm quartz', brand:'Cambria', spec:'3cm · Waterfall edge option', qty:30, unit:'SF', rate:95, allowance:true,
    link:'https://www.cambriausa.com' },
  // ── Plumbing fixtures ──
  { id:'c17', div:'15', cat:'Plumbing', types:['bath','basement','kitchen'],
    desc:'Moen Align faucet — brushed nickel', brand:'Moen', spec:'Lifetime warranty · ADA compliant', qty:1, unit:'EA', rate:245, allowance:true,
    link:'https://www.moen.com' },
  { id:'c18', div:'15', cat:'Plumbing', types:['bath','basement'],
    desc:'Delta Trinsic faucet — matte black', brand:'Delta', spec:'Touch2O · Magnetic docking', qty:1, unit:'EA', rate:385, allowance:true,
    link:'https://www.deltafaucet.com' },
  { id:'c19', div:'15', cat:'Plumbing', types:['bath'],
    desc:'Toilet — Kohler Cimarron elongated', brand:'Kohler', spec:'1.28 gpf · Right-height · ADA', qty:1, unit:'EA', rate:285, allowance:true,
    link:'https://www.us.kohler.com' },
  { id:'c20', div:'15', cat:'Plumbing', types:['bath','basement'],
    desc:'Shower valve — Moen Posi-Temp', brand:'Moen', spec:'Pressure-balance · Lifetime', qty:1, unit:'EA', rate:225, allowance:true,
    link:'https://www.moen.com' },
  { id:'c21', div:'15', cat:'Plumbing', types:['bath'],
    desc:'Bathtub — Kohler freestanding soaker', brand:'Kohler', spec:'67" cast iron · Floor mount', qty:1, unit:'EA', rate:1850, allowance:true,
    link:'https://www.us.kohler.com' },
  // ── Lighting ──
  { id:'c22', div:'16', cat:'Lighting', types:['basement','kitchen','bath','addition'],
    desc:'Halo 6" LED recessed (per fixture)', brand:'Halo', spec:'2700K · Dimmable · Airtight', qty:1, unit:'EA', rate:95,
    link:'https://www.acuitybrands.com' },
  { id:'c23', div:'16', cat:'Lighting', types:['kitchen','bath'],
    desc:'Pendant light rough-in (per fixture)', brand:'In-house', spec:'Canopy, wire, j-box', qty:1, unit:'EA', rate:145,
    link:null },
  { id:'c24', div:'16', cat:'Lighting', types:['kitchen','basement'],
    desc:'Under-cabinet LED strip lighting', brand:'In-house', spec:'Low-voltage · Dimmer included', qty:1, unit:'LS', rate:425,
    link:null },
  // ── Drywall ──
  { id:'c25', div:'09', cat:'Drywall', types:['basement','kitchen','bath','addition'],
    desc:'Drywall hang & finish (level 4)', brand:'In-house', spec:'Blueboard · Level 4 taping', qty:665, unit:'SF', rate:4.75,
    link:null },
  { id:'c26', div:'09', cat:'Drywall', types:['bath','basement'],
    desc:'Moisture-resistant drywall', brand:'Georgia-Pacific DensArmor', spec:'Mold/moisture resistant', qty:150, unit:'SF', rate:5.50,
    link:null },
  // ── Paint ──
  { id:'c27', div:'09', cat:'Paint', types:['basement','kitchen','bath','addition'],
    desc:'Sherwin-Williams Emerald — interior', brand:'Sherwin-Williams', spec:'2 coats · Low VOC · Excellent hide', qty:665, unit:'SF', rate:2.50,
    link:'https://www.sherwin-williams.com' },
  { id:'c28', div:'09', cat:'Paint', types:['bath'],
    desc:'Bathroom paint — full room', brand:'Sherwin-Williams', spec:'Moisture-resistant formula', qty:1, unit:'LS', rate:450,
    link:'https://www.sherwin-williams.com' },
  // ── Insulation ──
  { id:'c29', div:'07', cat:'Insulation', types:['basement','addition'],
    desc:'Closed-cell spray foam — rim joists', brand:'Demilec / Icynene', spec:'2" min · R-13 per inch', qty:120, unit:'LF', rate:8.50,
    link:null },
  { id:'c30', div:'07', cat:'Insulation', types:['basement','addition'],
    desc:'Rigid foam board — perimeter walls', brand:'Owens Corning FOAMULAR', spec:'R-10 · Continuous coverage', qty:665, unit:'SF', rate:2.25,
    link:'https://www.owenscorning.com' },
  // ── Vanity / Bath ──
  { id:'c31', div:'12', cat:'Vanity', types:['bath','basement'],
    desc:'Glacier Bay 30" vanity w/ mirror', brand:'Glacier Bay (Home Depot)', spec:'Soft-close door · Integrated top', qty:1, unit:'EA', rate:875, allowance:true,
    link:'https://www.homedepot.com' },
  { id:'c32', div:'12', cat:'Vanity', types:['bath'],
    desc:'Style Selections 36" double vanity', brand:'Style Selections (Lowes)', spec:'Quartz top · Soft-close', qty:1, unit:'EA', rate:1450, allowance:true,
    link:'https://www.lowes.com' },
  // ── Shower enclosure ──
  { id:'c33', div:'08', cat:'Shower', types:['bath','basement'],
    desc:'DreamLine Flex semi-frameless shower door', brand:'DreamLine', spec:'Semi-frameless · 3/8" glass', qty:1, unit:'EA', rate:850, allowance:true,
    link:'https://www.dreamline.com' },
  { id:'c34', div:'08', cat:'Shower', types:['bath'],
    desc:'DreamLine Enigma-X frameless door', brand:'DreamLine', spec:'Full frameless · 3/8" glass · Brushed nickel', qty:1, unit:'EA', rate:1250, allowance:true,
    link:'https://www.dreamline.com' },
  // ── Kitchen appliances ──
  { id:'c35', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Range hood — 30" under-cabinet', brand:'Broan', spec:'400 CFM · 3-speed · LED', qty:1, unit:'EA', rate:425, allowance:true,
    link:'https://www.broan-nutone.com' },
  { id:'c36', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Dishwasher rough-in & supply', brand:'In-house', spec:'240V circuit · water supply + drain', qty:1, unit:'LS', rate:385,
    link:null },
  { id:'c37', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Gas line rough-in — range', brand:'In-house', spec:'3/4" black iron · Tested', qty:1, unit:'LS', rate:650,
    link:null },
]

var CAT_ORDER = ['Flooring','Tile','Drywall','Paint','Cabinets','Countertops','Vanity','Shower','Plumbing','Lighting','Insulation','Appliances']
var PROJECT_TYPES = ['all','basement','kitchen','bath','addition']
var TYPE_LABELS = { all:'All types', basement:'Basement', kitchen:'Kitchen', bath:'Bathroom', addition:'Addition' }

// ─── Category photo map ───────────────────────────────────────────────────────
var CAT_PHOTOS = {
  Flooring:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Tile:        'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  Cabinets:    'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=400&q=80',
  Countertops: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  Plumbing:    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
  Shower:      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  Lighting:    'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
  Drywall:     'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=80',
  Paint:       'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=400&q=80',
  Insulation:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  Vanity:      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  Appliances:  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
}
var DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'

function getCatPhoto(cat) {
  return CAT_PHOTOS[cat] || DEFAULT_PHOTO
}

function fmtPrice(n) {
  return '$' + parseFloat(n).toFixed(2)
}

export default function CatalogPage() {
  var [search,        setSearch]        = useState('')
  var [activeType,    setActiveType]    = useState('all')
  var [activeCat,     setActiveCat]     = useState('all')
  var [estimateQueue, setEstimateQueue] = useState({})
  var [selections,    setSelections]    = useState({})

  useEffect(function() {
    var q = localStorage.getItem('sb_catalog_queue')
    if (q) setEstimateQueue(JSON.parse(q))
    var s = localStorage.getItem('sb_selections')
    if (s) setSelections(JSON.parse(s))
  }, [])

  function toggleEstimate(item) {
    setEstimateQueue(function(prev) {
      var next = Object.assign({}, prev)
      if (next[item.id]) { delete next[item.id] } else { next[item.id] = true }
      localStorage.setItem('sb_catalog_queue', JSON.stringify(next))
      return next
    })
  }

  function addToSelections(item) {
    var catKey = item.cat.toLowerCase()
    setSelections(function(prev) {
      var next = Object.assign({}, prev)
      next[catKey] = { value: item.desc, brand: item.brand, hex: '#C4A882', tier: 'better' }
      localStorage.setItem('sb_selections', JSON.stringify(next))
      return next
    })
  }

  // Filter logic
  var filtered = CATALOG.filter(function(item) {
    var matchType   = activeType === 'all' || item.types.includes(activeType)
    var matchCat    = activeCat  === 'all' || item.cat === activeCat
    var q           = search.toLowerCase()
    var matchSearch = !q || item.desc.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
    return matchType && matchCat && matchSearch
  })

  // Build category counts from full filtered-by-type-and-search set (ignore cat filter for counts)
  var countBase = CATALOG.filter(function(item) {
    var matchType   = activeType === 'all' || item.types.includes(activeType)
    var q           = search.toLowerCase()
    var matchSearch = !q || item.desc.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  var catCounts = {}
  CAT_ORDER.forEach(function(cat) {
    catCounts[cat] = countBase.filter(function(i){ return i.cat === cat }).length
  })
  var totalCount = countBase.length

  var queueCount = Object.keys(estimateQueue).length

  return (
    <div style={{minHeight:'100vh', background:'#f5f4f1', fontFamily:'sans-serif'}}>

      {/* ── Sticky topbar ───────────────────────────────────────────────── */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'#002147', borderBottom:'3px solid #FF8C00',
        padding:'0 2rem',
        display:'grid',
        gridTemplateColumns:'auto 1fr auto',
        alignItems:'center',
        gap:'1.5rem',
        minHeight:58,
      }}>
        {/* Left: logo + title */}
        <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:32, width:'auto'}} onError={function(e){e.target.style.display='none'}}/>
          <span style={{fontSize:11, color:'#FF8C00', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600, whiteSpace:'nowrap'}}>
            Material Catalog
          </span>
        </div>

        {/* Center: search */}
        <div style={{position:'relative'}}>
          <input
            value={search}
            onChange={function(e){ setSearch(e.target.value) }}
            placeholder="Search products, brands, categories..."
            style={{
              width:'100%', boxSizing:'border-box',
              padding:'8px 12px 8px 34px',
              background:'rgba(255,255,255,.1)',
              border:'1px solid rgba(255,255,255,.2)',
              borderRadius:4,
              color:'#fff',
              fontSize:13,
              fontFamily:'sans-serif',
              outline:'none',
            }}
          />
          <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.4)', fontSize:14, pointerEvents:'none'}}>
            ⌕
          </span>
        </div>

        {/* Right: dashboard link */}
        <a href="/dashboard" style={{fontSize:11, color:'rgba(255,255,255,.6)', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0}}>
          ← Dashboard
        </a>
      </div>

      {/* ── Queue banner ────────────────────────────────────────────────── */}
      {queueCount > 0 && (
        <div style={{
          background:'#002147',
          borderBottom:'2px solid #FF8C00',
          padding:'10px 2rem',
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
        }}>
          <span style={{fontSize:13, color:'#fff', fontWeight:500}}>
            <span style={{
              display:'inline-block',
              background:'#FF8C00',
              color:'#fff',
              fontSize:11,
              fontWeight:700,
              borderRadius:10,
              padding:'1px 8px',
              marginRight:8,
            }}>{queueCount}</span>
            {queueCount === 1 ? 'item' : 'items'} queued for estimate
          </span>
          <a href="/contractor/estimate" style={{
            fontSize:12, fontWeight:700, color:'#FF8C00', textDecoration:'none',
            border:'1px solid #FF8C00', padding:'4px 12px', borderRadius:3,
          }}>
            Open estimate →
          </a>
        </div>
      )}

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div style={{display:'flex', alignItems:'flex-start', maxWidth:1380, margin:'0 auto', padding:'1.5rem', gap:16}}>

        {/* ── LEFT SIDEBAR ────────────────────────────────────────────────── */}
        <div style={{width:220, flexShrink:0, position:'sticky', top:queueCount > 0 ? 102 : 62}}>

          {/* Project type pills */}
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10, fontWeight:600, color:'#9a9690', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>
              Project type
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
              {PROJECT_TYPES.map(function(t) {
                var isActive = activeType === t
                return (
                  <button key={t} onClick={function(){ setActiveType(t); setActiveCat('all') }} style={{
                    padding:'4px 10px',
                    fontSize:11,
                    fontWeight:600,
                    fontFamily:'sans-serif',
                    cursor:'pointer',
                    borderRadius:12,
                    border:'1px solid',
                    borderColor: isActive ? '#002147' : '#d8d6d0',
                    background:  isActive ? '#002147' : '#fff',
                    color:       isActive ? '#FF8C00' : '#5f5e5a',
                    letterSpacing:'.02em',
                  }}>
                    {TYPE_LABELS[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category list */}
          <div style={{background:'#fff', border:'1px solid #e8e6e0', borderRadius:4, overflow:'hidden', marginBottom:12}}>
            <div style={{
              padding:'9px 12px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
              cursor:'pointer',
              background: activeCat === 'all' ? '#002147' : '#fff',
              borderLeft: '3px solid ' + (activeCat === 'all' ? '#FF8C00' : 'transparent'),
            }} onClick={function(){ setActiveCat('all') }}>
              <span style={{fontSize:12, fontWeight:600, color: activeCat === 'all' ? '#FF8C00' : '#002147'}}>
                All categories
              </span>
              <span style={{
                fontSize:10, fontWeight:700,
                color: activeCat === 'all' ? 'rgba(255,255,255,.6)' : '#9a9690',
                background: activeCat === 'all' ? 'rgba(255,255,255,.12)' : '#f5f4f1',
                padding:'1px 6px', borderRadius:8,
              }}>
                {totalCount}
              </span>
            </div>
            {CAT_ORDER.map(function(cat) {
              var count   = catCounts[cat] || 0
              var isActive = activeCat === cat
              if (count === 0) return null
              return (
                <div key={cat} style={{
                  padding:'8px 12px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  cursor:'pointer',
                  borderTop:'1px solid #f5f4f1',
                  background: isActive ? '#002147' : '#fff',
                  borderLeft: '3px solid ' + (isActive ? '#FF8C00' : 'transparent'),
                }} onClick={function(){ setActiveCat(cat) }}>
                  <span style={{fontSize:12, fontWeight:500, color: isActive ? '#FF8C00' : '#002147'}}>
                    {cat}
                  </span>
                  <span style={{
                    fontSize:10, fontWeight:700,
                    color: isActive ? 'rgba(255,255,255,.6)' : '#9a9690',
                    background: isActive ? 'rgba(255,255,255,.12)' : '#f5f4f1',
                    padding:'1px 6px', borderRadius:8,
                  }}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Quick-add summary */}
          <div style={{background:'#002147', borderRadius:4, padding:'12px 14px'}}>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>
              Estimate queue
            </div>
            {queueCount === 0 ? (
              <div style={{fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5}}>
                No items queued yet. Click "＋ Estimate" on any product card to add it.
              </div>
            ) : (
              <>
                <div style={{fontSize:22, fontWeight:700, color:'#FF8C00', marginBottom:4}}>
                  {queueCount}
                </div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.6)', marginBottom:10}}>
                  {queueCount === 1 ? 'item' : 'items'} ready to add to estimate
                </div>
                <a href="/contractor/estimate" style={{
                  display:'block', textAlign:'center',
                  background:'#FF8C00', color:'#fff',
                  padding:'7px', fontSize:11, fontWeight:700,
                  textDecoration:'none', borderRadius:3,
                  letterSpacing:'.05em', textTransform:'uppercase',
                }}>
                  Open estimate →
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── MAIN CARD GRID ───────────────────────────────────────────────── */}
        <div style={{flex:1, minWidth:0}}>

          {/* Results meta row */}
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div style={{fontSize:12, color:'#9a9690'}}>
              <strong style={{color:'#002147'}}>{filtered.length}</strong> products
              {activeCat !== 'all' && (
                <span> in <strong style={{color:'#002147'}}>{activeCat}</strong></span>
              )}
              {activeType !== 'all' && (
                <span> · <strong style={{color:'#002147'}}>{TYPE_LABELS[activeType]}</strong></span>
              )}
              {search && (
                <span> matching "<strong style={{color:'#002147'}}>{search}</strong>"</span>
              )}
            </div>
            {(activeCat !== 'all' || activeType !== 'all' || search) && (
              <button onClick={function(){ setActiveCat('all'); setActiveType('all'); setSearch('') }} style={{
                background:'transparent', border:'1px solid #d8d6d0',
                color:'#5f5e5a', fontSize:11, padding:'3px 10px', borderRadius:3,
                cursor:'pointer', fontFamily:'sans-serif',
              }}>
                Clear filters ✕
              </button>
            )}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div style={{
              background:'#fff', border:'1px solid #e8e6e0', borderRadius:4,
              padding:'3rem', textAlign:'center',
            }}>
              <div style={{fontSize:32, marginBottom:12, color:'#d8d6d0'}}>◧</div>
              <div style={{fontSize:14, color:'#002147', fontWeight:600, marginBottom:6}}>No products found</div>
              <div style={{fontSize:12, color:'#9a9690'}}>Try adjusting your filters or search terms.</div>
            </div>
          ) : (
            <div style={{
              display:'grid',
              gridTemplateColumns:'repeat(3, minmax(0, 1fr))',
              gap:12,
            }}>
              {filtered.map(function(item) {
                var inQueue      = !!estimateQueue[item.id]
                var catKey       = item.cat.toLowerCase()
                var inSelections = !!(selections[catKey] && selections[catKey].value === item.desc)
                var photo        = getCatPhoto(item.cat)

                return (
                  <div key={item.id} style={{
                    background:'#fff',
                    border:'1px solid #e8e6e0',
                    borderRadius:4,
                    overflow:'hidden',
                    display:'flex',
                    flexDirection:'column',
                    borderTop: inQueue ? '3px solid #3B6D11' : '3px solid #002147',
                  }}>

                    {/* Photo */}
                    <div style={{position:'relative', height:120, background:'#e8e6e0', overflow:'hidden', flexShrink:0}}>
                      <img
                        src={photo}
                        alt={item.cat}
                        style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}
                        onError={function(e){ e.target.style.display='none' }}
                      />

                      {/* Division badge */}
                      <span style={{
                        position:'absolute', top:8, right:8,
                        background:'rgba(0,33,71,.85)',
                        color:'#fff',
                        fontSize:9, fontWeight:700,
                        padding:'2px 7px',
                        borderRadius:10,
                        letterSpacing:'.06em',
                        textTransform:'uppercase',
                      }}>
                        DIV {item.div}
                      </span>

                      {/* Allowance badge */}
                      {item.allowance && (
                        <span style={{
                          position:'absolute', bottom:8, left:8,
                          background:'#FF8C00',
                          color:'#fff',
                          fontSize:9, fontWeight:700,
                          padding:'2px 7px',
                          borderRadius:10,
                          letterSpacing:'.04em',
                        }}>
                          Allowance
                        </span>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{padding:'10px 12px', flex:1, display:'flex', flexDirection:'column', gap:3}}>
                      {/* Brand */}
                      <div style={{fontSize:10, color:'#9a9690', fontWeight:500}}>
                        {item.brand}
                      </div>
                      {/* Description */}
                      <div style={{fontSize:13, fontWeight:600, color:'#002147', lineHeight:1.35}}>
                        {item.desc}
                      </div>
                      {/* Spec */}
                      <div style={{fontSize:10, color:'#9a9690', lineHeight:1.4}}>
                        {item.spec}
                      </div>

                      {/* Price row */}
                      <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:4}}>
                        <span style={{fontSize:14, fontWeight:700, color:'#002147'}}>
                          {fmtPrice(item.rate)}
                        </span>
                        <span style={{fontSize:10, color:'#9a9690'}}>
                          / {item.unit}
                        </span>
                      </div>

                      {/* Manufacturer link */}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{fontSize:10, color:'#185FA5', textDecoration:'none', marginTop:2}}
                        >
                          ↗ View product
                        </a>
                      )}
                    </div>

                    {/* Card footer */}
                    <div style={{
                      display:'grid', gridTemplateColumns:'1fr 1fr',
                      borderTop:'1px solid #f5f4f1',
                      gap:0,
                    }}>
                      <button
                        onClick={function(){ toggleEstimate(item) }}
                        style={{
                          padding:'8px 6px',
                          fontSize:11, fontWeight:700,
                          fontFamily:'sans-serif',
                          cursor:'pointer',
                          border:'none',
                          borderRight:'1px solid #f5f4f1',
                          background: inQueue ? '#3B6D11' : '#002147',
                          color:'#fff',
                          letterSpacing:'.02em',
                        }}
                      >
                        {inQueue ? '✓ In estimate' : '＋ Estimate'}
                      </button>
                      <button
                        onClick={function(){ addToSelections(item) }}
                        style={{
                          padding:'8px 6px',
                          fontSize:11, fontWeight:700,
                          fontFamily:'sans-serif',
                          cursor:'pointer',
                          border:'none',
                          background: inSelections ? '#3B6D11' : '#fff',
                          color: inSelections ? '#fff' : '#002147',
                          outline: inSelections ? 'none' : '1px solid #d8d6d0',
                          outlineOffset:'-1px',
                          letterSpacing:'.02em',
                        }}
                      >
                        {inSelections ? '✓ Selected' : '＋ Selections'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
