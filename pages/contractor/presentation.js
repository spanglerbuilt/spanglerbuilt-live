import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var ROOM_CATS = [
  {
    id:'main', label:'Main Area', icon:'◻',
    cats:['flooring','lighting','paint','doors'],
  },
  {
    id:'bathroom', label:'Bathroom', icon:'◧',
    cats:['bath_floor','shower_wall','shower_floor','shower_bench','shower_door','toilet','fixtures','vanity'],
  },
  {
    id:'bar', label:'Bar Area', icon:'▭',
    cats:['cabinets','countertops'],
  },
]

var CAT_LABELS = {
  flooring:'Flooring', lighting:'Lighting package', paint:'Paint colors', doors:'Interior doors',
  bath_floor:'Floor tile', shower_wall:'Shower wall tile', shower_floor:'Shower floor tile',
  shower_bench:'Shower bench & niche', shower_door:'Shower door / enclosure', toilet:'Toilet',
  fixtures:'Faucets & hardware', vanity:'Vanity',
  cabinets:'Bar cabinets', countertops:'Bar countertop',
}

var CATEGORY_PHOTOS = {
  flooring:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  lighting:     'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=800&q=80',
  paint:        'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=800&q=80',
  doors:        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  bath_floor:   'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  shower_wall:  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  shower_floor: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  shower_bench: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  shower_door:  'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  toilet:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  fixtures:     'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80',
  vanity:       'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80',
  cabinets:     'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800&q=80',
  countertops:  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
}

var TIER_COLORS = {
  good:   '#3B6D11', better:'#185FA5', best:'#534AB7', luxury:'#854F0B',
}

function fmt(n){ return '$'+Math.round(n).toLocaleString('en-US') }

export default function Presentation() {
  var [mode,       setMode]       = useState('checklist') // 'checklist' | 'room'
  var [activeRoom, setActiveRoom] = useState('main')
  var [selections, setSelections] = useState({})
  var [estimate,   setEstimate]   = useState(null)
  var [approved,   setApproved]   = useState(false)
  var [spotlight,  setSpotlight]  = useState(null) // catId being spotlit

  useEffect(function() {
    try {
      var sel = JSON.parse(localStorage.getItem('sb_selections') || '{}')
      setSelections(sel)
    } catch(e) {}
    try {
      var est = JSON.parse(localStorage.getItem('sb_estimate') || 'null')
      if (est) setEstimate(est)
    } catch(e) {}
    try {
      var app = localStorage.getItem('sb_approved')
      if (app === '1') setApproved(true)
    } catch(e) {}
  }, [])

  var allCats     = ROOM_CATS.flatMap(function(r){ return r.cats })
  var totalCats   = allCats.length
  var selectedCount = allCats.filter(function(c){ return selections[c] }).length
  var price       = estimate ? estimate.grand : 62500
  var tierLabel   = estimate ? estimate.label : 'Better'
  var tierKey     = estimate ? estimate.tier  : 'better'

  function approveAll() {
    localStorage.setItem('sb_approved', '1')
    // Also persist approval to Supabase
    try {
      var projectId = new URLSearchParams(window.location.search).get('id')
      if (projectId) {
        fetch('/api/projects/' + projectId + '/approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: true }),
        }).catch(function(){})
      }
    } catch(e) {}
    setApproved(true)
  }

  var room = ROOM_CATS.find(function(r){ return r.id === activeRoom })

  // ── Spotlight overlay ─────────────────────────────────────────────────────
  var spotlitSel = spotlight ? selections[spotlight] : null
  var spotlitPhoto = spotlight ? CATEGORY_PHOTOS[spotlight] : null

  return (
    <Layout>

      {/* Spotlight overlay */}
      {spotlight && spotlitSel && (
        <div onClick={function(){setSpotlight(null)}}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <div onClick={function(e){e.stopPropagation()}} style={{maxWidth:700,width:'100%',margin:'2rem',background:'#001530',borderRadius:8,overflow:'hidden',border:'2px solid rgba(255,140,0,.4)'}}>
            <div style={{height:320,position:'relative',overflow:'hidden'}}>
              <img src={spotlitPhoto} alt={spotlight} style={{width:'100%',height:'100%',objectFit:'cover'}}
                onError={function(e){e.target.style.display='none'}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(transparent 40%,rgba(0,21,48,.95))'}}/>
              <div style={{position:'absolute',bottom:0,left:0,padding:'1.5rem 2rem'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:6}}>{CAT_LABELS[spotlight]}</div>
                <div style={{fontSize:26,fontWeight:600,color:'#fff',marginBottom:4}}>{spotlitSel.value}</div>
                <div style={{fontSize:14,color:'rgba(255,255,255,.6)'}}>{spotlitSel.brand}</div>
              </div>
              <button onClick={function(){setSpotlight(null)}} style={{position:'absolute',top:12,right:14,background:'rgba(0,0,0,.5)',border:'none',color:'rgba(255,255,255,.6)',fontSize:18,cursor:'pointer',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            <div style={{padding:'1.25rem 2rem',display:'flex',alignItems:'center',gap:16}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:spotlitSel.hex||'#ccc',border:'3px solid rgba(255,255,255,.2)',flexShrink:0}}/>
              <div>
                <div style={{fontSize:13,color:'rgba(255,255,255,.9)',fontWeight:600}}>{spotlitSel.value}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.45)',marginTop:2}}>{spotlitSel.brand}</div>
              </div>
              {spotlitSel.tier && (
                <div style={{marginLeft:'auto',background:TIER_COLORS[spotlitSel.tier]||'#185FA5',color:'#fff',fontSize:10,fontWeight:700,padding:'4px 12px',borderRadius:20,textTransform:'uppercase',letterSpacing:'.08em'}}>
                  {spotlitSel.tier}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div style={{background:'rgba(0,0,0,.4)',padding:'.75rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,borderBottom:'2px solid rgba(255,140,0,.3)'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:30,width:'auto'}}/>
          <div style={{width:1,height:24,background:'rgba(255,255,255,.15)'}}/>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase'}}>
            Client Presentation
          </span>
          {approved && (
            <span style={{background:'#3B6D11',color:'#fff',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,letterSpacing:'.06em'}}>✓ Approved</span>
          )}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {/* Mode toggle */}
          <div style={{display:'flex',border:'1px solid rgba(255,255,255,.2)',borderRadius:4,overflow:'hidden'}}>
            {[['checklist','Checklist'],['room','Room view']].map(function(item){return(
              <button key={item[0]} onClick={function(){setMode(item[0])}}
                style={{padding:'5px 14px',fontSize:11,fontWeight:500,border:'none',cursor:'pointer',fontFamily:'Poppins,sans-serif',background:mode===item[0]?'#D06830':'transparent',color:mode===item[0]?'#fff':'rgba(255,255,255,.5)',transition:'all .15s'}}>
                {item[1]}
              </button>
            )})}
          </div>
          <a href="/client/project-book" target="_blank" rel="noopener noreferrer"
            style={{background:'transparent',border:'1px solid rgba(255,255,255,.25)',color:'rgba(255,255,255,.6)',padding:'5px 12px',fontSize:11,textDecoration:'none',borderRadius:3}}>
            Project book ↗
          </a>
          <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.4)',textDecoration:'none'}}>← Dashboard</a>
        </div>
      </div>

      {/* Project header bar */}
      <div style={{background:'rgba(0,0,0,.25)',padding:'.6rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,.08)',flexShrink:0}}>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em'}}>Client</div>
            <div style={{fontSize:13,color:'#fff',fontWeight:600}}>Ryan &amp; Dori Mendel</div>
          </div>
          <div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em'}}>Project</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.8)'}}>SB-2026-001 · Basement Renovation</div>
          </div>
          <div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em'}}>Tier</div>
            <div style={{fontSize:13,color:TIER_COLORS[tierKey]||'#D06830',fontWeight:600}}>{tierLabel} · {fmt(price)}</div>
          </div>
        </div>
        <div style={{fontSize:11,color:selectedCount===totalCats?'#90EE90':'rgba(255,255,255,.4)'}}>
          {selectedCount}/{totalCats} selections confirmed
        </div>
      </div>

      {/* ── CHECKLIST MODE ── */}
      {mode === 'checklist' && (
        <div style={{flex:1,overflowY:'auto',padding:'1.5rem 2rem',maxWidth:1000,width:'100%',margin:'0 auto',boxSizing:'border-box'}}>

          {selectedCount === 0 && (
            <div style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:6,padding:'2rem',textAlign:'center',marginBottom:'1.5rem'}}>
              <div style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:8}}>No selections confirmed yet</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.3)'}}>Client needs to complete selections at <strong style={{color:'rgba(255,255,255,.5)'}}>/client/selections</strong> first.</div>
            </div>
          )}

          {ROOM_CATS.map(function(rc) {
            var roomSels = rc.cats.filter(function(c){ return selections[c] })
            var missingCats = rc.cats.filter(function(c){ return !selections[c] })
            return (
              <div key={rc.id} style={{marginBottom:'1.5rem'}}>
                {/* Room header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,paddingBottom:8,borderBottom:'1px solid rgba(255,255,255,.12)'}}>
                  <span style={{fontSize:16,color:'#D06830'}}>{rc.icon}</span>
                  <span style={{fontSize:15,fontWeight:700,color:'#fff',letterSpacing:'.02em'}}>{rc.label}</span>
                  <span style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>
                    {roomSels.length}/{rc.cats.length} confirmed
                  </span>
                </div>

                {/* Confirmed selections grid */}
                {roomSels.length > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8,marginBottom: missingCats.length > 0 ? 8 : 0}}>
                    {roomSels.map(function(catId) {
                      var sel = selections[catId]
                      var photo = CATEGORY_PHOTOS[catId]
                      return (
                        <div key={catId}
                          onClick={function(){ setSpotlight(catId) }}
                          style={{display:'flex',gap:10,alignItems:'center',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:4,padding:'10px 12px',cursor:'pointer',transition:'background .15s',borderLeft:'3px solid '+(approved?'#3B6D11':'#D06830')}}
                          onMouseEnter={function(e){e.currentTarget.style.background='rgba(255,255,255,.1)'}}
                          onMouseLeave={function(e){e.currentTarget.style.background='rgba(255,255,255,.06)'}}>
                          {/* Thumbnail */}
                          <div style={{width:52,height:52,borderRadius:4,overflow:'hidden',flexShrink:0,background:'#001530'}}>
                            <img src={photo} alt={catId} style={{width:'100%',height:'100%',objectFit:'cover'}}
                              onError={function(e){e.target.style.display='none'}}/>
                          </div>
                          {/* Swatch */}
                          <div style={{width:16,height:16,borderRadius:'50%',background:sel.hex||'#ccc',border:'2px solid rgba(255,255,255,.2)',flexShrink:0}}/>
                          {/* Info */}
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{CAT_LABELS[catId]}</div>
                            <div style={{fontSize:12,fontWeight:600,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sel.value}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{sel.brand}</div>
                          </div>
                          {/* Check */}
                          <div style={{width:20,height:20,borderRadius:'50%',background:approved?'#3B6D11':'rgba(255,140,0,.3)',border:'2px solid '+(approved?'#3B6D11':'#D06830'),display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            <span style={{fontSize:10,color:'#fff',fontWeight:700}}>✓</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Missing items */}
                {missingCats.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {missingCats.map(function(catId){return(
                      <div key={catId} style={{fontSize:10,color:'rgba(255,255,255,.25)',border:'1px dashed rgba(255,255,255,.15)',padding:'4px 10px',borderRadius:3}}>
                        {CAT_LABELS[catId]} — pending
                      </div>
                    )})}
                  </div>
                )}
              </div>
            )
          })}

          {/* Approve button */}
          {selectedCount > 0 && (
            <div style={{background:'rgba(0,0,0,.3)',border:'1px solid rgba(255,255,255,.1)',borderRadius:6,padding:'1.25rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'1rem',gap:12}}>
              <div>
                <div style={{fontSize:14,color:'#fff',fontWeight:600,marginBottom:4}}>
                  {approved ? '✓ All selections approved' : 'Ready for client approval?'}
                </div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>
                  {selectedCount} of {totalCats} categories selected · {tierLabel} tier · {fmt(price)}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                {!approved ? (
                  <button onClick={approveAll}
                    style={{background:'#D06830',color:'#fff',border:'none',padding:'10px 24px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:4,fontFamily:'Poppins,sans-serif',letterSpacing:'.04em',textTransform:'uppercase'}}>
                    Approve all selections →
                  </button>
                ) : (
                  <a href="/client/project-book" target="_blank" rel="noopener noreferrer"
                    style={{background:'#3B6D11',color:'#fff',border:'none',padding:'10px 24px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:4,fontFamily:'Poppins,sans-serif',letterSpacing:'.04em',textTransform:'uppercase',textDecoration:'none'}}>
                    Open project book →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ROOM VIEW MODE ── */}
      {mode === 'room' && (
        <div style={{flex:1,display:'flex',overflow:'hidden'}}>

          {/* Room tabs — left */}
          <div style={{width:140,borderRight:'1px solid rgba(255,255,255,.1)',flexShrink:0,padding:'1rem 0'}}>
            {ROOM_CATS.map(function(rc){
              var done = rc.cats.filter(function(c){ return selections[c] }).length
              return (
                <div key={rc.id} onClick={function(){ setActiveRoom(rc.id) }}
                  style={{padding:'12px 16px',cursor:'pointer',borderLeft:'3px solid '+(activeRoom===rc.id?'#D06830':'transparent'),background:activeRoom===rc.id?'rgba(255,255,255,.08)':'transparent'}}>
                  <div style={{fontSize:12,fontWeight:600,color:activeRoom===rc.id?'#D06830':'rgba(255,255,255,.6)'}}>{rc.label}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:2}}>{done}/{rc.cats.length}</div>
                </div>
              )
            })}
          </div>

          {/* Room selections — right */}
          <div style={{flex:1,overflowY:'auto',padding:'1.5rem'}}>
            <div style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:'1rem'}}>{room.label}</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {room.cats.map(function(catId) {
                var sel = selections[catId]
                var photo = CATEGORY_PHOTOS[catId]
                if (!sel) return (
                  <div key={catId} style={{border:'1px dashed rgba(255,255,255,.15)',borderRadius:6,padding:'1.25rem',textAlign:'center'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.3)'}}>{CAT_LABELS[catId]}</div>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.2)',marginTop:4}}>Not yet selected</div>
                  </div>
                )
                return (
                  <div key={catId} onClick={function(){setSpotlight(catId)}}
                    style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:6,overflow:'hidden',cursor:'pointer',borderTop:'3px solid '+(approved?'#3B6D11':'#D06830')}}
                    onMouseEnter={function(e){e.currentTarget.style.background='rgba(255,255,255,.1)'}}
                    onMouseLeave={function(e){e.currentTarget.style.background='rgba(255,255,255,.06)'}}>
                    <div style={{height:140,overflow:'hidden',position:'relative'}}>
                      <img src={photo} alt={catId} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.85}}
                        onError={function(e){e.target.style.display='none'}}/>
                      <div style={{position:'absolute',inset:0,background:'linear-gradient(transparent 50%,rgba(0,21,48,.8))'}}/>
                      <div style={{position:'absolute',bottom:8,left:10,display:'flex',alignItems:'center',gap:6}}>
                        <div style={{width:18,height:18,borderRadius:'50%',background:sel.hex||'#ccc',border:'2px solid rgba(255,255,255,.5)'}}/>
                        <span style={{fontSize:10,color:'rgba(255,255,255,.8)',fontWeight:600}}>{sel.value}</span>
                      </div>
                      {sel.tier && (
                        <div style={{position:'absolute',top:8,right:8,background:TIER_COLORS[sel.tier]||'#185FA5',color:'#fff',fontSize:8,fontWeight:700,padding:'2px 7px',borderRadius:10,textTransform:'uppercase'}}>
                          {sel.tier}
                        </div>
                      )}
                    </div>
                    <div style={{padding:'10px 12px'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{CAT_LABELS[catId]}</div>
                      <div style={{fontSize:13,fontWeight:600,color:'#fff',marginBottom:2}}>{sel.value}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{sel.brand}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
