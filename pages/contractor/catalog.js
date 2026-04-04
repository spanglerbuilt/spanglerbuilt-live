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

export default function CatalogPage() {
  var [materials,     setMaterials]     = useState([])
  var [loading,       setLoading]       = useState(true)
  var [search,        setSearch]        = useState('')
  var [activeType,    setActiveType]    = useState('all')
  var [activeCat,     setActiveCat]     = useState('all')
  var [estimateQueue, setEstimateQueue] = useState({})
  var [selections,    setSelections]    = useState({})

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

  function toggleEstimate(m) {
    setEstimateQueue(function(prev) {
      var next = Object.assign({}, prev)
      if (next[m.id]) { delete next[m.id] } else { next[m.id] = true }
      localStorage.setItem('sb_catalog_queue', JSON.stringify(next))
      return next
    })
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

      <div style={{display:'flex', alignItems:'flex-start', maxWidth:1380, margin:'0 auto', padding:'1.5rem', gap:16}}>

        {/* Sidebar */}
        <div style={{width:220, flexShrink:0, position:'sticky', top:queueCount > 0 ? 102 : 62}}>

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
        <div style={{flex:1, minWidth:0}}>

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
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:12}}>
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
                      <button onClick={function(){ toggleEstimate(m) }} style={{
                        padding:'8px 6px', fontSize:11, fontWeight:700, fontFamily:'Poppins,sans-serif', cursor:'pointer',
                        border:'none', borderRight:'1px solid rgba(255,255,255,.07)',
                        background:inQueue?'#3B6D11':'#0a0a0a', color:'#fff', letterSpacing:'.02em',
                      }}>
                        {inQueue ? '✓ In estimate' : '＋ Estimate'}
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
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
