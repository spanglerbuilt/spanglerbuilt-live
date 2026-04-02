import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { INIT_OPTION_GROUPS } from '../contractor/options'

var BADGE_STYLE = {
  'Included': { bg:'#0a0a0a', color:'#fff' },
  'Upgrade':  { bg:'#D06830', color:'#fff' },
  'Premium':  { bg:'#854F0B', color:'#fff' },
}

var TIER_LABELS = { good:'Good', better:'Better', best:'Best', luxury:'Luxury' }

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function ClientOptions() {
  var { data: session } = useSession()
  // picks: { groupId → optionId }
  var [picks, setPicks]       = useState({})
  var [confirmed, setConfirmed] = useState(false)
  var [basePrice, setBasePrice] = useState(53000)
  var [tierLabel, setTierLabel] = useState('Good')
  var [animGroup, setAnimGroup] = useState(null)

  // Load base estimate + any prior picks from localStorage
  useEffect(function() {
    try {
      var est = JSON.parse(localStorage.getItem('sb_estimate') || 'null')
      if (est) {
        setBasePrice(est.grand || 53000)
        setTierLabel(est.label || 'Good')
      }
      var saved = JSON.parse(localStorage.getItem('sb_option_picks') || 'null')
      if (saved) setPicks(saved)
    } catch(e) {}
    // Default picks = included option for each group
    setPicks(function(prev) {
      if (Object.keys(prev).length > 0) return prev
      var defaults = {}
      INIT_OPTION_GROUPS.forEach(function(g) {
        var inc = g.options.find(function(o){ return o.badge === 'Included' })
        if (inc) defaults[g.id] = inc.id
      })
      return defaults
    })
  }, [])

  // Calculate total upgrade delta
  var upgradeDelta = INIT_OPTION_GROUPS.reduce(function(sum, g) {
    var selId = picks[g.id]
    var opt = g.options.find(function(o){ return o.id === selId })
    return sum + (opt ? opt.delta : 0)
  }, 0)

  var totalPrice = basePrice + upgradeDelta

  function pick(groupId, optId) {
    setPicks(function(prev) {
      var next = Object.assign({}, prev, { [groupId]: optId })
      localStorage.setItem('sb_option_picks', JSON.stringify(next))
      return next
    })
    setAnimGroup(groupId)
    setTimeout(function(){ setAnimGroup(null) }, 600)
  }

  function confirmAll() {
    // Merge into sb_selections so project book sees the options
    var existing = {}
    try { existing = JSON.parse(localStorage.getItem('sb_selections') || '{}') } catch(e) {}
    INIT_OPTION_GROUPS.forEach(function(g) {
      var selId = picks[g.id]
      var opt = g.options.find(function(o){ return o.id === selId })
      if (opt) {
        existing[g.id] = {
          value: opt.name,
          tier: opt.tier,
          brand: opt.brand,
          hex: opt.hex,
          delta: opt.delta,
          photo: opt.photo,
        }
      }
    })
    localStorage.setItem('sb_selections', JSON.stringify(existing))
    // Also persist option picks to Supabase
    try {
      var projectId = new URLSearchParams(window.location.search).get('id')
      if (projectId) {
        var upgTotal = INIT_OPTION_GROUPS.reduce(function(s, g) {
          var selId = picks[g.id]
          var opt = g.options.find(function(o){ return o.id === selId })
          return s + (opt ? opt.delta : 0)
        }, 0)
        fetch('/api/projects/' + projectId + '/option-picks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ picks: picks, upgradeDelta: upgTotal }),
        }).catch(function(){})
      }
    } catch(e) {}
    setConfirmed(true)
  }

  if (confirmed) {
    return (
      <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{maxWidth:520,width:'100%',padding:'2rem',textAlign:'center'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem',border:'3px solid #D06830'}}>
            <span style={{fontSize:28,color:'#D06830'}}>✓</span>
          </div>
          <div style={{fontFamily:'Poppins,sans-serif',fontSize:26,color:'#0a0a0a',marginBottom:8}}>Selections confirmed!</div>
          <div style={{fontSize:14,color:'#666',marginBottom:6}}>Your upgrades have been saved.</div>
          <div style={{fontSize:22,fontWeight:700,color:'#0a0a0a',marginBottom:'1.5rem'}}>
            Revised total: {fmt(totalPrice)}
            {upgradeDelta > 0 && <span style={{fontSize:13,color:'#D06830',marginLeft:8}}>+{fmt(upgradeDelta)} upgrades</span>}
          </div>
          <a href="/client/project-book"
            style={{display:'inline-block',background:'#0a0a0a',color:'#fff',padding:'12px 28px',fontSize:14,fontWeight:700,textDecoration:'none',borderRadius:3,border:'2px solid #D06830'}}>
            View project book →
          </a>
          <div style={{marginTop:12}}>
            <a href="/client/dashboard" style={{fontSize:12,color:'rgba(255,255,255,.35)',textDecoration:'none'}}>← Back to dashboard</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>

      {/* Topbar */}
      <div style={{background:'#0a0a0a',padding:'0.85rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:30,width:'auto'}}/>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase'}}>Options &amp; Upgrades</span>
        </div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      {/* Sticky upgrade bar */}
      <div style={{background:'#0a0a0a',borderBottom:'2px solid #D06830',padding:'0.6rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:57,zIndex:49}}>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <div>
            <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em'}}>Base estimate ({tierLabel})</div>
            <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,.8)'}}>{fmt(basePrice)}</div>
          </div>
          {upgradeDelta > 0 && (
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em'}}>Upgrades selected</div>
              <div style={{fontSize:14,fontWeight:600,color:'#D06830'}}>+{fmt(upgradeDelta)}</div>
            </div>
          )}
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.08em'}}>Revised total</div>
          <div style={{fontSize:18,fontWeight:700,color:'#D06830'}}>{fmt(totalPrice)}</div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'2rem 1.5rem'}}>

        {/* Intro */}
        <div style={{marginBottom:'2rem'}}>
          <div style={{fontFamily:'Poppins,sans-serif',fontSize:24,color:'#0a0a0a',marginBottom:6}}>Choose your finishes</div>
          <div style={{fontSize:13,color:'#666',lineHeight:1.6,maxWidth:620}}>
            Your base estimate includes the "Included" option for each category. Select any upgrade to see how it affects your total — all pricing is transparent, no surprises.
          </div>
        </div>

        {/* Option groups */}
        {INIT_OPTION_GROUPS.map(function(g) {
          var selectedId = picks[g.id] || g.options[0].id
          var selectedOpt = g.options.find(function(o){ return o.id === selectedId }) || g.options[0]
          var isAnimating = animGroup === g.id

          return (
            <div key={g.id} style={{marginBottom:'2rem',border:'1px solid rgba(255,255,255,.09)',borderRadius:6,overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>

              {/* Group header */}
              <div style={{background:'#0a0a0a',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{g.label}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>{g.room}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em'}}>selected</div>
                  <div style={{fontSize:12,fontWeight:600,color:selectedOpt.delta===0?'#90EE90':'#D06830'}}>
                    {selectedOpt.delta===0 ? 'Included' : '+'+fmt(selectedOpt.delta)}
                  </div>
                </div>
              </div>

              {/* 4 option cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,background:'rgba(255,255,255,.08)'}}>
                {g.options.map(function(opt) {
                  var isSelected = selectedId === opt.id
                  var bs = BADGE_STYLE[opt.badge]
                  return (
                    <div key={opt.id}
                      onClick={function(){ pick(g.id, opt.id) }}
                      style={{
                        background:'#fff',
                        margin:'1px',
                        cursor:'pointer',
                        transition:'all .15s',
                        outline: isSelected ? '2px solid #D06830' : '2px solid transparent',
                        outlineOffset: '-2px',
                        position:'relative',
                      }}>

                      {/* Selected checkmark */}
                      {isSelected && (
                        <div style={{position:'absolute',top:8,right:8,zIndex:2,width:20,height:20,borderRadius:'50%',background:'#D06830',display:'flex',alignItems:'center',justifyContent:'center'}}>
                          <span style={{color:'#fff',fontSize:11,fontWeight:700}}>✓</span>
                        </div>
                      )}

                      {/* Photo */}
                      <div style={{height:110,background:'#1a1a1a',overflow:'hidden',position:'relative'}}>
                        <img src={opt.photo} alt={opt.name}
                          style={{width:'100%',height:'100%',objectFit:'cover',opacity: isSelected ? 1 : 0.82}}
                          onError={function(e){e.target.style.display='none'}}/>
                        {/* Swatch */}
                        <div style={{position:'absolute',bottom:6,left:6,width:16,height:16,borderRadius:'50%',background:opt.hex,border:'2px solid rgba(255,255,255,.9)',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}/>
                        {/* Badge */}
                        <div style={{position:'absolute',top:6,left:6,background:bs.bg,color:bs.color,fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:2,textTransform:'uppercase'}}>{opt.badge}</div>
                      </div>

                      {/* Info */}
                      <div style={{padding:'10px 10px 12px'}}>
                        <div style={{fontSize:11,fontWeight:600,color:'#0a0a0a',marginBottom:2,lineHeight:1.3}}>{opt.name}</div>
                        <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:1}}>{opt.brand}</div>
                        <div style={{fontSize:9,color:'#aaa',marginBottom:8,lineHeight:1.4}}>{opt.spec}</div>
                        <div style={{
                          fontSize:13,fontWeight:700,
                          color: opt.delta===0 ? '#3B6D11' : '#0a0a0a',
                          padding:'5px 8px',
                          background: isSelected ? (opt.delta===0?'#eaf3de':'#fff3e0') : '#f5f4f1',
                          borderRadius:3,
                          textAlign:'center',
                          border: isSelected ? '1px solid '+(opt.delta===0?'#3B6D11':'#D06830') : '1px solid #e8e6e0',
                        }}>
                          {opt.delta===0 ? 'Included' : '+'+fmt(opt.delta)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Upgrade summary + confirm */}
        <div style={{border:'2px solid #0a0a0a',borderRadius:6,overflow:'hidden',marginTop:'1rem'}}>
          <div style={{background:'#0a0a0a',padding:'1rem 1.5rem'}}>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,color:'#fff'}}>Your selections summary</div>
          </div>
          <div style={{background:'#fff',padding:'1.25rem 1.5rem'}}>
            <div style={{display:'grid',gap:6,marginBottom:'1rem'}}>
              {INIT_OPTION_GROUPS.map(function(g) {
                var selId = picks[g.id]
                var opt = g.options.find(function(o){ return o.id === selId })
                if (!opt) return null
                return (
                  <div key={g.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #f5f4f1'}}>
                    <div>
                      <span style={{fontSize:12,color:'#0a0a0a',fontWeight:500}}>{g.label}</span>
                      <span style={{fontSize:11,color:'rgba(255,255,255,.35)',marginLeft:8}}>{opt.name}</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:600,color: opt.delta===0?'#3B6D11':'#D06830'}}>
                      {opt.delta===0 ? 'Included' : '+'+fmt(opt.delta)}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderTop:'2px solid #0a0a0a',marginBottom:'1.25rem'}}>
              <div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:2}}>Base ({tierLabel})</div>
                <div style={{fontSize:22,fontWeight:700,color:'#0a0a0a'}}>{fmt(basePrice)}</div>
              </div>
              {upgradeDelta > 0 && (
                <div style={{textAlign:'center',padding:'0 1rem'}}>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:2}}>Upgrade total</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#D06830'}}>+{fmt(upgradeDelta)}</div>
                </div>
              )}
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:2}}>Revised project total</div>
                <div style={{fontSize:26,fontWeight:700,color:'#0a0a0a'}}>{fmt(totalPrice)}</div>
              </div>
            </div>
            <button
              onClick={confirmAll}
              style={{width:'100%',background:'#0a0a0a',color:'#fff',border:'2px solid #D06830',padding:'14px',fontSize:14,fontWeight:700,cursor:'pointer',borderRadius:4,fontFamily:'Poppins,sans-serif',letterSpacing:'.04em'}}>
              Confirm all selections →
            </button>
            <div style={{fontSize:11,color:'rgba(255,255,255,.35)',textAlign:'center',marginTop:8}}>
              Your selections are saved automatically and shared with your contractor.
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
