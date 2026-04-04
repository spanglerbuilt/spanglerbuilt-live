import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

var NAV = {
  contractor: [
    { section: 'Operations' },
    { href: '/dashboard',              label: 'Dashboard',      icon: '◈' },
    { href: '/contractor/leads',       label: 'Projects',       icon: '◻' },
    { href: '/contractor/estimate',    label: 'Estimates',      icon: '$' },
    { href: '/contractor/schedule',    label: 'Schedule',       icon: '◉' },
    { href: '/contractor/payments',    label: 'Payments',       icon: '✦' },
    { href: '/contractor/selections',  label: 'Selections',     icon: '✓' },
    { href: '/contractor/templates',   label: 'Templates',      icon: '◻' },
    { href: '/contractor/catalog',     label: 'Catalog',        icon: '◈' },
    { href: '/ai',                     label: 'AI Tools',       icon: '✦' },
  ],
  marketing: [
    { section: 'Sales & Marketing' },
    { href: '/marketing/dashboard',    label: 'Dashboard',      icon: '◈' },
    { href: '/marketing/pipeline',     label: 'Pipeline',       icon: '◻' },
    { href: '/marketing/leads',        label: 'Leads',          icon: '◉' },
    { href: '/marketing/campaigns',    label: 'Campaigns',      icon: '✉' },
    { href: '/marketing/creative',     label: 'AI Creative',    icon: '✦' },
    { href: '/marketing/ads',          label: 'Ad Platforms',   icon: '$' },
    { href: '/marketing/materials',    label: 'Materials',      icon: '◻' },
    { href: '/marketing/channels',     label: 'Channels',       icon: '◈' },
  ],
  client: [
    { section: 'My Project' },
    { href: '/client/dashboard',       label: 'Dashboard',      icon: '◈' },
    { href: '/client/estimate',        label: 'Estimate',       icon: '$' },
    { href: '/client/scope',           label: 'Scope of work',  icon: '◻' },
    { href: '/client/schedule',        label: 'Schedule',       icon: '◉' },
    { href: '/client/selections',      label: 'Selections',     icon: '✓' },
    { href: '/client/options',         label: 'Options',        icon: '◈' },
    { href: '/client/documents',       label: 'Documents',      icon: '✦' },
    { href: '/client/photos',          label: 'Photos',         icon: '◉' },
    { href: '/client/punch-list',      label: 'Punch list',     icon: '☑' },
    { href: '/client/messages',        label: 'Messages',       icon: '✉' },
    { href: '/client/warranty',        label: 'Warranty',       icon: '◈' },
  ],
}

var MODULE_LABEL = {
  contractor: 'Operations',
  marketing:  'Sales & Marketing',
  client:     'Client Portal',
}

var MODULE_COLOR = {
  contractor: '#D06830',
  marketing:  '#4a9eff',
  client:     '#22c55e',
}

export default function Layout({ children }) {
  var router   = useRouter()
  var [auth,   setAuth]   = useState(null)
  var [open,   setOpen]   = useState(false)  // mobile sidebar

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (!a.role) { window.location.href = '/login'; return }
      setAuth(a)
    } catch(e) { window.location.href = '/login' }
  }, [])

  function signOut() {
    localStorage.removeItem('sb_auth')
    window.location.href = '/login'
  }

  if (!auth) return null

  var role    = auth.role
  var links   = NAV[role] || []
  var color   = MODULE_COLOR[role] || '#D06830'
  var current = router.pathname

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>

      {/* Sidebar */}
      <aside style={{
        width:220, flexShrink:0, background:'#0a0a0a',
        borderRight:'1px solid rgba(255,255,255,.07)',
        display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, bottom:0, zIndex:50,
        transform: open ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{padding:'20px 16px 16px', borderBottom:'1px solid rgba(255,255,255,.07)'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{width:130, height:'auto', display:'block', marginBottom:10}}/>
          <div style={{fontSize:10, fontWeight:700, color:color, letterSpacing:'.12em', textTransform:'uppercase'}}>
            {MODULE_LABEL[role]}
          </div>
        </div>

        {/* Nav links */}
        <nav style={{flex:1, overflowY:'auto', padding:'8px 0'}}>
          {links.map(function(item, i) {
            if (item.section) {
              return (
                <div key={i} style={{padding:'14px 16px 4px', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.2)', textTransform:'uppercase', letterSpacing:'.12em'}}>
                  {item.section}
                </div>
              )
            }
            var active = current === item.href || current.startsWith(item.href + '/')
            return (
              <a key={item.href} href={item.href} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 16px', textDecoration:'none',
                background: active ? 'rgba(255,255,255,.05)' : 'transparent',
                borderLeft: '3px solid ' + (active ? color : 'transparent'),
                transition:'background .12s',
              }}
              onMouseEnter={function(e){ if(!active) e.currentTarget.style.background='rgba(255,255,255,.03)' }}
              onMouseLeave={function(e){ if(!active) e.currentTarget.style.background='transparent' }}
              >
                <span style={{fontSize:12, color: active ? color : 'rgba(255,255,255,.3)', width:14, textAlign:'center', flexShrink:0}}>{item.icon}</span>
                <span style={{fontSize:12, fontWeight: active ? 700 : 400, color: active ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.5)'}}>{item.label}</span>
              </a>
            )
          })}
        </nav>

        {/* User / sign out */}
        <div style={{padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <div style={{fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{auth.email}</div>
          <button onClick={signOut} style={{width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:11, padding:'6px', borderRadius:3, cursor:'pointer', fontFamily:'inherit'}}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{marginLeft:220, flex:1, minWidth:0}}>
        {/* Top bar */}
        <div style={{height:48, background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', padding:'0 1.5rem', position:'sticky', top:0, zIndex:40}}>
          <div style={{flex:1}}/>
          <div style={{fontSize:11, color:'rgba(255,255,255,.25)', letterSpacing:'.06em'}}>
            SpanglerBuilt Inc. &nbsp;·&nbsp; <span style={{color:color}}>{MODULE_LABEL[role]}</span>
          </div>
        </div>

        {/* Page */}
        <div style={{padding:'1.5rem'}}>
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {open && <div onClick={function(){setOpen(false)}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:49}}/>}
    </div>
  )
}
