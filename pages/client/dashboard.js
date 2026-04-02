import { useEffect, useState } from 'react'

var PHASES = ['Pre-construction','Demo & framing','Drywall & rough-ins','Paint & flooring','Closeout']
var NAV = [
  {href:'/client/estimate',   label:'Estimate',           icon:'$', desc:'View and select your tier',          alert:true,  alertMsg:'Action needed'},
  {href:'/client/scope',      label:'Scope of work',      icon:'◻', desc:'What is included phase by phase',    alert:false},
  {href:'/client/selections', label:'My selections',      icon:'✓', desc:'Choose your materials',              alert:true,  alertMsg:'10 pending'},
  {href:'/client/options',    label:'Options & upgrades', icon:'◈', desc:'Customize finishes & see pricing',   alert:false},
  {href:'/client/documents',  label:'Documents',          icon:'✦', desc:'Contract, proposals, sign',          alert:true,  alertMsg:'1 to sign'},
  {href:'/client/photos',     label:'Progress photos',    icon:'◉', desc:'Latest site photos',                 alert:false},
  {href:'/client/punch-list', label:'Punch list',         icon:'☑', desc:'Submit items and track status',      alert:false},
  {href:'/client/warranty',   label:'Warranty',           icon:'◈', desc:'Submit a warranty request',          alert:false},
  {href:'/client/messages',   label:'Messages',           icon:'✉', desc:'Chat with SpanglerBuilt',            alert:true,  alertMsg:'2 unread'},
]

export default function ClientDashboard() {
  var [clientEmail, setClientEmail] = useState('')

  useEffect(function() {
    if (typeof window !== 'undefined') {
      try {
        var auth = JSON.parse(localStorage.getItem('sb_auth') || '{}')
        if (!auth.role) { window.location.href = '/login'; return }
        setClientEmail(auth.email || '')
      } catch(e) { window.location.href = '/login' }
    }
  }, [])

  function handleSignOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth')
      window.location.href = '/login'
    }
  }

  var phaseNum = 1
  var phasePct = Math.round((phaseNum / PHASES.length) * 100)

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>

      {/* Header */}
      <div style={{background:'#0a0a0a', padding:'1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'3px solid #D06830', position:'sticky', top:0, zIndex:100}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:32, width:'auto'}}/>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <span style={{fontSize:11, color:'rgba(255,255,255,.5)'}}>{clientEmail}</span>
          <button onClick={handleSignOut} style={{fontSize:11, color:'#D06830', background:'transparent', border:'1px solid rgba(208,104,48,.4)', padding:'4px 12px', borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{maxWidth:900, margin:'0 auto', padding:'1.5rem'}}>

        {/* Project summary card */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderLeft:'4px solid #D06830', borderRadius:4, padding:'1.25rem 1.5rem', marginBottom:'1.25rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8}}>
            <div>
              <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Welcome back</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:2}}>SB-2026-001 · Basement Renovation</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>4995 Shadow Glen Ct, Dunwoody GA 30338</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:9, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2}}>Est. completion</div>
              <div style={{fontSize:13, color:'#D06830', fontWeight:600}}>Apr 22, 2026</div>
            </div>
          </div>
          <div style={{marginTop:'1rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em'}}>Project progress</div>
              <div style={{fontSize:10, color:'#D06830', fontWeight:600}}>{phasePct}%</div>
            </div>
            <div style={{height:6, background:'rgba(255,255,255,.08)', borderRadius:3, overflow:'hidden'}}>
              <div style={{height:6, width:phasePct+'%', background:'#D06830', borderRadius:3}}/>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}>
              {PHASES.map(function(ph, i) {
                return (
                  <div key={ph} style={{fontSize:9, color: i <= phaseNum ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.25)', fontWeight: i === phaseNum ? 700 : 400, textAlign:'center', flex:1, lineHeight:1.4}}>
                    {i < phaseNum ? '✓ ' : i === phaseNum ? '● ' : ''}{ph}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Action required */}
        <div style={{background:'rgba(208,104,48,.08)', border:'1px solid rgba(208,104,48,.3)', borderRadius:4, padding:'1rem 1.25rem', marginBottom:'1.25rem'}}>
          <div style={{fontSize:10, fontWeight:700, color:'#D06830', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Action required</div>
          <div style={{fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:2}}>
            · <a href="/client/estimate"   style={{color:'#D06830', fontWeight:500}}>Select your project tier</a> — Good, Better, Best, or Luxury.<br/>
            · <a href="/client/selections" style={{color:'#D06830', fontWeight:500}}>10 material selections</a> are waiting for your input.<br/>
            · <a href="/client/options"    style={{color:'#D06830', fontWeight:500}}>Review options &amp; upgrades</a> — customize your finishes.<br/>
            · <a href="/client/documents"  style={{color:'#D06830', fontWeight:500}}>1 document</a> ready for your review and signature.
          </div>
        </div>

        {/* Nav grid */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Your project portal</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:10, marginBottom:'1.5rem'}}>
          {NAV.map(function(item) {
            return (
              <a key={item.href} href={item.href} style={{
                display:'flex', gap:12, alignItems:'center',
                padding:'1rem 1.25rem',
                background:'#161616',
                border:'1px solid ' + (item.alert ? 'rgba(208,104,48,.4)' : 'rgba(255,255,255,.08)'),
                borderLeft:'4px solid ' + (item.alert ? '#D06830' : 'rgba(255,255,255,.1)'),
                borderRadius:4, textDecoration:'none',
                transition:'border-color .15s',
              }}
              onMouseEnter={function(e){ e.currentTarget.style.borderColor = '#D06830' }}
              onMouseLeave={function(e){ e.currentTarget.style.borderColor = item.alert ? 'rgba(208,104,48,.4)' : 'rgba(255,255,255,.08)' }}
              >
                <div style={{width:36, height:36, background:'#0a0a0a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, color:'#D06830', flexShrink:0}}>
                  {item.icon}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.85)', marginBottom:2}}>{item.label}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{item.desc}</div>
                </div>
                {item.alert && (
                  <span style={{background:'#D06830', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:3, flexShrink:0, whiteSpace:'nowrap'}}>
                    {item.alertMsg}
                  </span>
                )}
              </a>
            )
          })}
        </div>

        {/* Footer contact bar */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:12, color:'rgba(255,255,255,.55)', marginBottom:2}}>Questions? Contact Michael directly</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>SpanglerBuilt Inc. · 44 Milton Ave, Alpharetta GA 30009</div>
          </div>
          <div style={{display:'flex', gap:8}}>
            <a href="tel:4044927650" style={{background:'#D06830', color:'#fff', padding:'8px 16px', fontSize:12, fontWeight:700, textDecoration:'none', borderRadius:3}}>(404) 492-7650</a>
            <a href="mailto:michael@spanglerbuilt.com" style={{background:'transparent', border:'1px solid rgba(255,255,255,.15)', color:'rgba(255,255,255,.6)', padding:'8px 16px', fontSize:12, textDecoration:'none', borderRadius:3}}>Email</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
