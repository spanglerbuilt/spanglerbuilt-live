import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var CAT_DISPLAY = {
  'interior_doors':      'Doors',
  'egress_windows':      'Windows',
  'lvp_flooring':        'Flooring',
  'bathroom_floor_tile': 'Bath Floor Tile',
  'shower_wall_tile':    'Shower Wall Tile',
  'shower_floor_tile':   'Shower Floor Tile',
  'shower_doors':        'Shower Doors',
  'toilets':             'Toilets',
  'vanities':            'Vanities',
  'bath_faucets':        'Faucets',
  'bath_accessories':    'Bath Accessories',
  'cabinets':            'Cabinets',
  'countertops':         'Countertops',
  'medicine_cabinets':   'Medicine Cabinets',
  'bar_sinks':           'Bar Sinks',
}

var CAT_ORDER = Object.keys(CAT_DISPLAY)

var TIER_SC = {
  good:    { bg:'#eaf3de', color:'#3B6D11',  label:'Good'    },
  better:  { bg:'#e3f2fd', color:'#0d47a1',  label:'Better'  },
  best:    { bg:'#eeedfe', color:'#534AB7',  label:'Best'    },
  luxury:  { bg:'#fff3e0', color:'#e65100',  label:'Luxury'  },
}

var PROJECT_TYPES = ['all','basement','kitchen','bathroom','addition']
var TYPE_LABELS   = { all:'All types', basement:'Basement', kitchen:'Kitchen', bathroom:'Bathroom', addition:'Addition' }

var CATEGORY_PHOTOS = {
  'Flooring':      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'lvp_flooring':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'Countertops':   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'countertops':   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'Tile':          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
  'bathroom_floor_tile': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
  'shower_wall_tile':    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
  'shower_floor_tile':   'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80',
  'Cabinets':      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'cabinets':      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80',
  'Fixtures':      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  'bath_faucets':  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  'toilets':       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  'vanities':      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  'Doors and Trim':'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  'interior_doors':'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
  'shower_doors':  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&q=80',
  'Hardware':      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'hardware':      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
  'Lighting':      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
  'lighting':      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&q=80',
}
var DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'

var VARIANT_TYPE_LABEL = { style:'Style', size:'Size', finish:'Finish', trim:'Trim Style' }
var VARIANT_TYPE_ORDER = ['style','size','finish','trim']

function isDoorProduct(m) {
  var cat = (m.category || '').toLowerCase()
  var sub = (m.subcategory || '').toLowerCase()
  return cat.includes('door') || sub.includes('door')
}

function getBasePrice(m) {
  if (m.total_installed && !isNaN(parseFloat(m.total_installed))) return parseFloat(m.total_installed)
  if (m.price_low != null && m.price_high != null) return (parseFloat(m.price_low||0) + parseFloat(m.price_high||0)) / 2
  return 0
}

export default function CatalogPage() {
  var [materials,     setMaterials]     = useState([])
  var [loading,       setLoading]       = useState(true)
  var [search,        setSearch]        = useState('')
  var [activeType,    setActiveType]    = useState('all')
  var [activeCat,     setActiveCat]     = useState('all')
  var [estimateQueue, setEstimateQueue] = useState({})
  var [selections,    setSelections]    = useState({})

  // Door variant modal
  var [variantModal,  setVariantModal]  = useState(null)  // { material, variants }
  var [variantSel,    setVariantSel]    = useState({})    // { style:'', size:'', ... }
  var [variantQty,    setVariantQty]    = useState(1)
  var [variantLoading,setVariantLoading]= useState(false)

  useEffect(function() {
    var q = localStorage.getItem('sb_catalog_queue')
    if (q) try { setEstimateQueue(JSON.parse(q)) } catch(e){}
    var s = localStorage.getItem('sb_selections')
    if (s) try { setSelections(JSON.parse(s)) } catch(e){}

    fetch('/api/materials')
      .then(function(r){ return r.json() })
      .then(function(json) {
        setMaterials(json.materials || [])
        setLoading(false)
      })
      .catch(function(){ setLoading(false) })
  }, [])

  function toggleEstimate(m, overridePrice) {
    setEstimateQueue(function(prev) {
      var next = Object.assign({}, prev)
      if (next[m.id] && overridePrice == null) {
        delete next[m.id]
      } else {
        next[m.id] = overridePrice != null ? { price: overridePrice } : true
      }
      localStorage.setItem('sb_catalog_queue', JSON.stringify(next))
      return next
    })
  }

  async function openDoorVariants(m) {
    setVariantLoading(true)
    setVariantSel({})
    setVariantQty(1)
    setVariantModal({ material: m, variants: [] })
    try {
      var r = await fetch('/api/catalog/variants?material_id=' + m.id)
      var d = await r.json()
      var variants = d.variants || []
      // Default selections: first in-stock variant per type
      var defaults = {}
      VARIANT_TYPE_ORDER.forEach(function(type) {
        var opts = variants.filter(function(v) { return v.variant_type === type && v.in_stock })
        if (opts.length > 0) defaults[type] = opts[0].id
      })
      setVariantSel(defaults)
      setVariantModal({ material: m, variants })
    } catch(e) {
      setVariantModal({ material: m, variants: [] })
    }
    setVariantLoading(false)
  }

  function calcVariantPrice(material, variants, sel, qty) {
    var base = getBasePrice(material)
    var selectedVariants = Object.values(sel).map(function(id) {
      return variants.find(function(v) { return v.id === id })
    }).filter(Boolean)
    // Check for price_override (replaces base entirely)
    var overrideV = selectedVariants.find(function(v) { return v.price_override != null })
    var effectiveBase = overrideV ? parseFloat(overrideV.price_override) : base
    var delta = selectedVariants.reduce(function(sum, v) {
      if (v.price_override != null) return sum // override doesn't stack
      return sum + parseFloat(v.price_delta || 0)
    }, 0)
    return (effectiveBase + delta) * (qty || 1)
  }

  function addVariantToEstimate() {
    if (!variantModal) return
    var price = calcVariantPrice(variantModal.material, variantModal.variants, variantSel, variantQty)
    toggleEstimate(variantModal.material, price)
    setVariantModal(null)
  }

  function addToSelections(m) {
    setSelections(function(prev) {
      var next = Object.assign({}, prev)
      next[m.category] = { value: m.name, brand: m.brand, tier: m.tier }
      localStorage.setItem('sb_selections', JSON.stringify(next))
      return next
    })
  }

  var filtered = materials.filter(function(m) {
    var matchType   = activeType === 'all' || (m.project_types || []).includes(activeType)
    var matchCat    = activeCat === 'all' || m.category === activeCat
    var q           = search.toLowerCase()
    var matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      (m.brand||'').toLowerCase().includes(q) ||
      (m.description||'').toLowerCase().includes(q) ||
      (CAT_DISPLAY[m.category]||m.category).toLowerCase().includes(q)
    return matchType && matchCat && matchSearch
  })

  var countBase = materials.filter(function(m) {
    var matchType   = activeType === 'all' || (m.project_types || []).includes(activeType)
    var q           = search.toLowerCase()
    var matchSearch = !q ||
      m.name.toLowerCase().includes(q) ||
      (m.brand||'').toLowerCase().includes(q) ||
      (m.description||'').toLowerCase().includes(q) ||
      (CAT_DISPLAY[m.category]||m.category).toLowerCase().includes(q)
    return matchType && matchSearch
  })

  var catCounts = {}
  countBase.forEach(function(m) {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1
  })
  var catsWithItems = CAT_ORDER.filter(function(c){ return catCounts[c] > 0 })

  var queueCount = Object.keys(estimateQueue).length

  return (
    <Layout>

      {/* Topbar */}
      <div style={{
        position:'sticky', top:0, zIndex:100,
        background:'#0a0a0a', borderBottom:'3px solid #D06830',
        padding:'0 2rem',
        display:'grid', gridTemplateColumns:'auto 1fr auto',
        alignItems:'center', gap:'1.5rem', minHeight:58,
      }}>
        <div style={{display:'flex', alignItems:'center', gap:12, flexShrink:0}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:32, width:'auto'}} onError={function(e){e.target.style.display='none'}}/>
          <span style={{fontSize:11, color:'#D06830', letterSpacing:'.12em', textTransform:'uppercase', fontWeight:600, whiteSpace:'nowrap'}}>
            Material Catalog
          </span>
        </div>
        <div style={{position:'relative'}}>
          <input
            value={search}
            onChange={function(e){ setSearch(e.target.value) }}
            placeholder="Search products, brands, categories…"
            style={{
              width:'100%', boxSizing:'border-box',
              padding:'8px 12px 8px 34px',
              background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)',
              borderRadius:4, color:'#fff', fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none',
            }}
          />
          <span style={{position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,.4)', fontSize:14, pointerEvents:'none'}}>⌕</span>
        </div>
        <a href="/dashboard" style={{fontSize:11, color:'rgba(255,255,255,.6)', textDecoration:'none', whiteSpace:'nowrap', flexShrink:0}}>
          ← Dashboard
        </a>
      </div>

      {/* Queue banner */}
      {queueCount > 0 && (
        <div style={{background:'#0a0a0a', borderBottom:'2px solid #D06830', padding:'10px 2rem', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <span style={{fontSize:13, color:'#fff', fontWeight:500}}>
            <span style={{display:'inline-block', background:'#D06830', color:'#fff', fontSize:11, fontWeight:700, borderRadius:10, padding:'1px 8px', marginRight:8}}>{queueCount}</span>
            {queueCount === 1 ? 'item' : 'items'} queued for estimate
          </span>
          <a href="/contractor/estimate" style={{fontSize:12, fontWeight:700, color:'#D06830', textDecoration:'none', border:'1px solid #D06830', padding:'4px 12px', borderRadius:3}}>
            Open estimate →
          </a>
        </div>
      )}

      <div className="sb-split" style={{maxWidth:2100, margin:'0 auto', padding:'1.5rem'}}>

        {/* Sidebar */}
        <div className="sb-split-aside" style={{width:220, position:'sticky', top:queueCount > 0 ? 102 : 62}}>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>Project type</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:5}}>
              {PROJECT_TYPES.map(function(t) {
                var isActive = activeType === t
                return (
                  <button key={t} onClick={function(){ setActiveType(t); setActiveCat('all') }} style={{
                    padding:'4px 10px', fontSize:11, fontWeight:600, fontFamily:'Poppins,sans-serif', cursor:'pointer', borderRadius:12,
                    border:'1px solid', borderColor:isActive?'#0a0a0a':'#d8d6d0',
                    background:isActive?'#0a0a0a':'#fff', color:isActive?'#D06830':'#5f5e5a',
                  }}>{TYPE_LABELS[t]}</button>
                )
              })}
            </div>
          </div>

          <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden', marginBottom:12}}>
            <div style={{
              padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
              background:activeCat==='all'?'#0a0a0a':'#fff',
              borderLeft:'3px solid '+(activeCat==='all'?'#D06830':'transparent'),
            }} onClick={function(){ setActiveCat('all') }}>
              <span style={{fontSize:12, fontWeight:600, color:activeCat==='all'?'#D06830':'#0a0a0a'}}>All categories</span>
              <span style={{fontSize:10, fontWeight:700, color:activeCat==='all'?'rgba(255,255,255,.6)':'#9a9690', background:activeCat==='all'?'rgba(255,255,255,.12)':'rgba(255,255,255,.07)', padding:'1px 6px', borderRadius:8}}>
                {countBase.length}
              </span>
            </div>
            {catsWithItems.map(function(cat) {
              var isActive = activeCat === cat
              return (
                <div key={cat} style={{
                  padding:'8px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer',
                  borderTop:'1px solid rgba(255,255,255,.07)',
                  background:isActive?'#0a0a0a':'#fff',
                  borderLeft:'3px solid '+(isActive?'#D06830':'transparent'),
                }} onClick={function(){ setActiveCat(cat) }}>
                  <span style={{fontSize:12, fontWeight:500, color:isActive?'#D06830':'#0a0a0a'}}>{CAT_DISPLAY[cat]||cat}</span>
                  <span style={{fontSize:10, fontWeight:700, color:isActive?'rgba(255,255,255,.6)':'#9a9690', background:isActive?'rgba(255,255,255,.12)':'rgba(255,255,255,.07)', padding:'1px 6px', borderRadius:8}}>
                    {catCounts[cat]}
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{background:'#0a0a0a', borderRadius:4, padding:'12px 14px'}}>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>Estimate queue</div>
            {queueCount === 0 ? (
              <div style={{fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5}}>No items queued. Click "＋ Estimate" on any card to add.</div>
            ) : (
              <>
                <div style={{fontSize:22, fontWeight:700, color:'#D06830', marginBottom:4}}>{queueCount}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.6)', marginBottom:10}}>{queueCount===1?'item':'items'} ready for estimate</div>
                <a href="/contractor/estimate" style={{display:'block', textAlign:'center', background:'#D06830', color:'#fff', padding:'7px', fontSize:11, fontWeight:700, textDecoration:'none', borderRadius:3, letterSpacing:'.05em', textTransform:'uppercase'}}>
                  Open estimate →
                </a>
              </>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="sb-split-main">

          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div style={{fontSize:12, color:'rgba(255,255,255,.35)'}}>
              {loading ? 'Loading catalog…' : (
                <>
                  <strong style={{color:'rgba(255,255,255,.75)'}}>{filtered.length}</strong> products
                  {activeCat !== 'all' && <span> in <strong style={{color:'rgba(255,255,255,.75)'}}>{CAT_DISPLAY[activeCat]||activeCat}</strong></span>}
                  {activeType !== 'all' && <span> · <strong style={{color:'rgba(255,255,255,.75)'}}>{TYPE_LABELS[activeType]}</strong></span>}
                  {search && <span> matching "<strong style={{color:'rgba(255,255,255,.75)'}}>{search}</strong>"</span>}
                </>
              )}
            </div>
            {(activeCat !== 'all' || activeType !== 'all' || search) && (
              <button onClick={function(){ setActiveCat('all'); setActiveType('all'); setSearch('') }} style={{background:'transparent', border:'1px solid #d8d6d0', color:'rgba(255,255,255,.5)', fontSize:11, padding:'3px 10px', borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
                Clear filters ✕
              </button>
            )}
          </div>

          {loading ? (
            <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'3rem', textAlign:'center'}}>
              <div style={{fontSize:13, color:'rgba(255,255,255,.35)'}}>Loading catalog…</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'3rem', textAlign:'center'}}>
              <div style={{fontSize:32, marginBottom:12, color:'#d8d6d0'}}>◧</div>
              <div style={{fontSize:14, color:'rgba(255,255,255,.75)', fontWeight:600, marginBottom:6}}>No products found</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,.35)'}}>Try adjusting your filters or search terms.</div>
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12}}>
              {filtered.map(function(m) {
                var inQueue      = !!estimateQueue[m.id]
                var inSelections = !!(selections[m.category] && selections[m.category].value === (m.product_name || m.name))
                var photo        = m.photo_url || m.image_url || CATEGORY_PHOTOS[m.category] || DEFAULT_PHOTO
                var tier         = TIER_SC[(m.tier||'').toLowerCase()] || TIER_SC.good

                return (
                  <div key={m.id} style={{
                    background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden',
                    display:'flex', flexDirection:'column',
                    borderTop: inQueue ? '3px solid #3B6D11' : '3px solid #0a0a0a',
                  }}>
                    <div style={{position:'relative', height:120, background:'rgba(255,255,255,.08)', overflow:'hidden', flexShrink:0}}>
                      <img src={photo} alt={m.name} style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}} onError={function(e){ e.target.style.display='none' }}/>
                      <span style={{
                        position:'absolute', top:8, left:8,
                        background:tier.bg, color:tier.color,
                        fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, letterSpacing:'.06em', textTransform:'uppercase',
                      }}>{tier.label}</span>
                      <span style={{
                        position:'absolute', top:8, right:8,
                        background:'rgba(0,0,0,.85)', color:'#fff',
                        fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10, letterSpacing:'.04em',
                      }}>{CAT_DISPLAY[m.category]||m.category}</span>
                    </div>

                    <div style={{padding:'10px 12px', flex:1, display:'flex', flexDirection:'column', gap:3}}>
                      <div style={{fontSize:10, color:'rgba(255,255,255,.35)', fontWeight:500}}>{m.brand}</div>
                      <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.75)', lineHeight:1.35}}>{m.product_name || m.name}</div>
                      <div style={{fontSize:10, color:'rgba(255,255,255,.35)', lineHeight:1.4}}>
                        {[m.description || m.subcategory, m.dimensions || m.size].filter(Boolean).join(' · ')}
                      </div>
                      <div style={{display:'flex', alignItems:'baseline', gap:6, marginTop:4}}>
                        <span style={{fontSize:13, fontWeight:700, color:'rgba(255,255,255,.75)'}}>
                          {m.price_low != null || m.price_high != null
                            ? '$' + (parseFloat(m.price_low)||0).toFixed(0) + '–$' + (parseFloat(m.price_high)||0).toFixed(0)
                            : m.total_installed ? '$' + m.total_installed : '—'}
                        </span>
                        <span style={{fontSize:10, color:'rgba(255,255,255,.35)'}}>/ {m.unit}</span>
                      </div>
                      {m.price_note && (
                        <div style={{fontSize:9, color:'rgba(255,255,255,.35)', lineHeight:1.4}}>{m.price_note}</div>
                      )}
                    </div>

                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid rgba(255,255,255,.07)'}}>
                      <button onClick={function(){ isDoorProduct(m) ? openDoorVariants(m) : toggleEstimate(m) }} style={{
                        padding:'8px 6px', fontSize:11, fontWeight:700, fontFamily:'Poppins,sans-serif', cursor:'pointer',
                        border:'none', borderRight:'1px solid rgba(255,255,255,.07)',
                        background:inQueue?'#3B6D11':'#0a0a0a', color:'#fff', letterSpacing:'.02em',
                      }}>
                        {inQueue ? '✓ In estimate' : isDoorProduct(m) ? '⊞ Configure' : '＋ Estimate'}
                      </button>
                      <button onClick={function(){ addToSelections(m) }} style={{
                        padding:'8px 6px', fontSize:11, fontWeight:700, fontFamily:'Poppins,sans-serif', cursor:'pointer',
                        border:'none',
                        background:inSelections?'#3B6D11':'#fff',
                        color:inSelections?'#fff':'#0a0a0a',
                        outline:inSelections?'none':'1px solid #d8d6d0', outlineOffset:'-1px', letterSpacing:'.02em',
                      }}>
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

      {/* ── Door Variant Modal ───────────────────────────────────────────── */}
      {variantModal && (
        <div
          onClick={function(e){ if (e.target === e.currentTarget) setVariantModal(null) }}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,.75)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem'}}
        >
          <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.3)', borderRadius:8, width:'100%', maxWidth:520, boxShadow:'0 16px 48px rgba(0,0,0,.7)', overflow:'hidden'}}>
            {/* Modal header */}
            <div style={{background:'#FF8C00', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <span style={{fontSize:13, fontWeight:700, color:'#fff'}}>⊞ Configure Door</span>
              <button onClick={function(){ setVariantModal(null) }} style={{background:'transparent', border:'none', color:'rgba(255,255,255,.8)', fontSize:20, cursor:'pointer', lineHeight:1, padding:0}}>×</button>
            </div>

            <div style={{padding:'16px'}}>
              {/* Product info */}
              <div style={{display:'flex', gap:12, marginBottom:14, alignItems:'center'}}>
                {variantModal.material.photo_url && (
                  <img src={variantModal.material.photo_url} alt="" style={{width:60, height:60, objectFit:'cover', borderRadius:4, border:'1px solid rgba(255,255,255,.1)', flexShrink:0}} onError={function(e){e.target.style.display='none'}}/>
                )}
                <div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{variantModal.material.brand}</div>
                  <div style={{fontSize:14, fontWeight:700, color:'#fff'}}>{variantModal.material.product_name || variantModal.material.name}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>Base: ${getBasePrice(variantModal.material).toFixed(0)} / {variantModal.material.unit}</div>
                </div>
              </div>

              {variantLoading ? (
                <div style={{textAlign:'center', padding:'1.5rem', color:'rgba(255,255,255,.4)', fontSize:13}}>Loading variants…</div>
              ) : variantModal.variants.length === 0 ? (
                <div style={{background:'rgba(255,255,255,.04)', borderRadius:4, padding:'1rem', marginBottom:14, fontSize:12, color:'rgba(255,255,255,.4)', textAlign:'center'}}>
                  No variants configured. Set them up in <a href="/contractor/catalog-admin" style={{color:'#FF8C00'}}>Catalog Admin</a>.
                </div>
              ) : (
                <>
                  {/* Variant dropdowns */}
                  <div style={{display:'flex', flexDirection:'column', gap:10, marginBottom:14}}>
                    {VARIANT_TYPE_ORDER.map(function(type) {
                      var opts = variantModal.variants.filter(function(v) { return v.variant_type === type })
                      if (opts.length === 0) return null
                      return (
                        <div key={type}>
                          <label style={{display:'block', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5}}>
                            {VARIANT_TYPE_LABEL[type] || type}
                          </label>
                          <select
                            value={variantSel[type] || ''}
                            onChange={function(e){ var id = e.target.value; setVariantSel(function(prev){ return Object.assign({}, prev, { [type]: id }) }) }}
                            style={{width:'100%', padding:'9px 10px', background:'#0d1117', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, color:'#fff', fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', boxSizing:'border-box', cursor:'pointer'}}
                          >
                            <option value="">— Select {VARIANT_TYPE_LABEL[type]||type} —</option>
                            {opts.map(function(v) {
                              var delta = parseFloat(v.price_delta || 0)
                              var suffix = v.price_override != null
                                ? ' (replaces base: $' + parseFloat(v.price_override).toFixed(0) + ')'
                                : delta === 0 ? '' : delta > 0 ? ' (+$' + delta.toFixed(0) + ')' : ' (-$' + Math.abs(delta).toFixed(0) + ')'
                              return (
                                <option key={v.id} value={v.id} disabled={!v.in_stock}>
                                  {v.variant_name}{suffix}{!v.in_stock ? ' (out of stock)' : ''}
                                </option>
                              )
                            })}
                          </select>
                        </div>
                      )
                    })}
                  </div>

                  {/* Quantity */}
                  <div style={{marginBottom:14}}>
                    <label style={{display:'block', fontSize:10, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5}}>Quantity</label>
                    <input
                      type="number" min="1" value={variantQty}
                      onChange={function(e){ setVariantQty(Math.max(1, parseInt(e.target.value)||1)) }}
                      style={{width:100, padding:'9px 10px', background:'#0d1117', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, color:'#fff', fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', boxSizing:'border-box'}}
                    />
                  </div>

                  {/* Live price */}
                  <div style={{background:'#0d1117', border:'1px solid rgba(255,140,0,.25)', borderRadius:4, padding:'10px 14px', marginBottom:14}}>
                    <div style={{fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4}}>Installed price</div>
                    <div style={{fontSize:22, fontWeight:700, color:'#FF8C00'}}>
                      ${calcVariantPrice(variantModal.material, variantModal.variants, variantSel, variantQty).toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}
                    </div>
                    {variantQty > 1 && (
                      <div style={{fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2}}>
                        ${calcVariantPrice(variantModal.material, variantModal.variants, variantSel, 1).toFixed(0)} × {variantQty} units
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Buttons */}
              <div style={{display:'flex', gap:8}}>
                <button onClick={function(){ setVariantModal(null) }} style={{flex:1, padding:'10px', background:'transparent', border:'1px solid rgba(255,255,255,.12)', borderRadius:4, color:'rgba(255,255,255,.5)', fontSize:12, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
                  Cancel
                </button>
                <button onClick={addVariantToEstimate} style={{flex:2, padding:'10px', background:'#FF8C00', border:'none', borderRadius:4, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
                  ＋ Add to Estimate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
