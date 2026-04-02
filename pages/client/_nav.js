import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

var NAV_ITEMS = [
  { href:'/client/dashboard',  label:'Home',       short:'Home',   icon:'⌂'  },
  { href:'/client/estimate',   label:'Estimate',   short:'Est.',   icon:'$',  alert:true,  alertMsg:'Action' },
  { href:'/client/scope',      label:'Scope',      short:'Scope',  icon:'◻'  },
  { href:'/client/selections', label:'Selections', short:'Select', icon:'✓',  alert:true,  alertMsg:'10' },
  { href:'/client/options',    label:'Options',    short:'Options',icon:'◈'  },
  { href:'/client/documents',  label:'Documents',  short:'Docs',   icon:'✦',  alert:true,  alertMsg:'1' },
  { href:'/client/photos',     label:'Photos',     short:'Photos', icon:'◉'  },
  { href:'/client/punch-list', label:'Punch List', short:'Punch',  icon:'☑'  },
  { href:'/client/warranty',   label:'Warranty',   short:'Warranty',icon:'◈' },
  { href:'/client/messages',   label:'Messages',   short:'Msgs',   icon:'✉',  alert:true,  alertMsg:'2' },
]

export default function ClientNav() {
  var router = useRouter()
  var path   = router.pathname
  var [email, setEmail] = useState('')

  useEffect(function() {
    if (typeof window !== 'undefined') {
      try {
        var auth = JSON.parse(localStorage.getItem('sb_auth') || '{}')
        setEmail(auth.email || '')
      } catch(e) {}
    }
  }, [])

  function handleSignOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth')
      window.location.href = '/login'
    }
  }

  return (
    <div style={{position:'sticky', top:0, zIndex:200, background:'#0a0a0a', borderBottom:'2px solid #D06830'}}>

      {/* Top row: logo + user */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'.6rem 1.5rem', borderBottom:'1px solid rgba(255,255,255,.06)'}}>
        <a href="/client/dashboard" style={{display:'flex', alignItems:'center', gap:10, textDecoration:'none'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:28, width:'auto'}}/>
          <span style={{fontSize:9, color:'#D06830', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', display:'block'}}>Client Portal</span>
        </a>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {email && <span style={{fontSize:10, color:'rgba(255,255,255,.35)', display:'none'}} className="nav-email">{email}</span>}
          <button onClick={handleSignOut} style={{fontSize:10, color:'rgba(255,255,255,.45)', background:'transparent', border:'1px solid rgba(255,255,255,.1)', padding:'3px 10px', borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
            Sign out
          </button>
        </div>
      </div>

      {/* Nav tabs — horizontally scrollable */}
      <div style={{overflowX:'auto', WebkitOverflowScrolling:'touch', scrollbarWidth:'none', msOverflowStyle:'none'}}>
        <div style={{display:'flex', padding:'0 1rem', minWidth:'max-content'}}>
          {NAV_ITEMS.map(function(item) {
            var isActive = path === item.href || (item.href !== '/client/dashboard' && path.startsWith(item.href))
            return (
              <a key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'.55rem .9rem',
                fontSize:11, fontWeight: isActive ? 700 : 400,
                color: isActive ? '#D06830' : 'rgba(255,255,255,.5)',
                textDecoration:'none', whiteSpace:'nowrap',
                borderBottom: isActive ? '2px solid #D06830' : '2px solid transparent',
                marginBottom:'-2px',
                position:'relative',
                transition:'color .15s',
              }}
              onMouseEnter={function(e){ if(!isActive) e.currentTarget.style.color = 'rgba(255,255,255,.8)' }}
              onMouseLeave={function(e){ if(!isActive) e.currentTarget.style.color = 'rgba(255,255,255,.5)' }}
              >
                <span style={{fontSize:12}}>{item.icon}</span>
                {item.label}
                {item.alert && (
                  <span style={{
                    background:'#D06830', color:'#fff',
                    fontSize:8, fontWeight:700,
                    padding:'1px 5px', borderRadius:10,
                    lineHeight:1.4,
                  }}>{item.alertMsg}</span>
                )}
              </a>
            )
          })}
        </div>
      </div>

    </div>
  )
}
