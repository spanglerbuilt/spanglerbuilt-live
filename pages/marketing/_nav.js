import { useEffect, useState } from 'react'

var LINKS = [
  { href: '/marketing/dashboard',   label: 'Dashboard'   },
  { href: '/marketing/leads',       label: 'Leads'       },
  { href: '/marketing/pipeline',    label: 'Pipeline'    },
  { href: '/marketing/campaigns',   label: 'Campaigns'   },
  { href: '/marketing/ads',         label: 'Ads'         },
  { href: '/marketing/materials',   label: 'Materials'   },
  { href: '/marketing/channels',    label: 'Channels'    },
]

export default function MarketingNav() {
  var [path, setPath] = useState('')
  useEffect(function() { setPath(window.location.pathname) }, [])

  function signOut() {
    localStorage.removeItem('sb_auth')
    window.location.href = '/login'
  }

  return (
    <nav style={{background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,.07)', padding:'0 1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:52, position:'sticky', top:0, zIndex:100}}>
      <div style={{display:'flex', alignItems:'center', gap:'1.5rem'}}>
        <span style={{fontSize:12, fontWeight:700, color:'rgba(255,255,255,.5)', letterSpacing:'.12em', textTransform:'uppercase', marginRight:8}}>Marketing</span>
        {LINKS.map(function(l) {
          var active = path === l.href
          return (
            <a key={l.href} href={l.href} style={{
              fontSize:12, fontWeight: active ? 700 : 500,
              color: active ? '#D06830' : 'rgba(255,255,255,.45)',
              textDecoration:'none', borderBottom: active ? '2px solid #D06830' : '2px solid transparent',
              paddingBottom:2, transition:'color .15s',
            }}>{l.label}</a>
          )
        })}
      </div>
      <button onClick={signOut} style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.35)', fontSize:11, padding:'5px 12px', borderRadius:3, cursor:'pointer'}}>
        Sign out
      </button>
    </nav>
  )
}
