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
    { href: '/contractor/catalog-admin', label: 'Catalog Admin', icon: '⚙' },
    { href: '/ai',                     label: 'AI Tools',       icon: '✦' },
    { href: '/contractor/qa-feedback', label: 'QA Feedback',    icon: '💬', qaOnly: true },
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
  var router = useRouter()
  var [auth, setAuth] = useState(null)
  var [open, setOpen] = useState(false)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (!a.role) { window.location.href = '/login'; return }
      setAuth(a)
    } catch(e) { window.location.href = '/login' }
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(function() { setOpen(false) }, [router.pathname])

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

      <style>{`
        .sb-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #0a0a0a;
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 50;
          transition: transform .2s ease;
        }
        .sb-main {
          margin-left: 220px;
          flex: 1;
          min-width: 0;
        }
        @media (min-width: 1440px) {
          .sb-sidebar { width: 260px; }
          .sb-main    { margin-left: 260px; }
          .sb-grid-4       { grid-template-columns: repeat(5, 1fr) !important; }
          .sb-grid-modules { grid-template-columns: repeat(5, minmax(0,1fr)) !important; }
        }
        @media (min-width: 1920px) {
          .sb-sidebar { width: 280px; }
          .sb-main    { margin-left: 280px; }
          .sb-grid-4       { grid-template-columns: repeat(6, 1fr) !important; }
          .sb-grid-modules { grid-template-columns: repeat(6, minmax(0,1fr)) !important; }
        }
        .sb-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          background: transparent;
          border: none;
          padding: 4px;
          margin-right: 12px;
          flex-shrink: 0;
        }
        .sb-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: rgba(255,255,255,.6);
          border-radius: 2px;
          transition: all .2s;
        }
        /* ── Responsive grids ───────────────────────────────────── */
        .sb-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .sb-grid-modules {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .sb-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        .sb-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .sb-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* ── Split panel (sidebar + content, stacks on mobile) ── */
        .sb-split {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .sb-split-aside {
          flex-shrink: 0;
        }
        .sb-split-main {
          flex: 1;
          min-width: 0;
        }

        /* ── Sidebar grid (used by estimate/options) ─────────── */
        .sb-grid-sidebar {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 16px;
        }
        .sb-grid-sidebar-wide {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 16px;
        }
        .sb-grid-sidebar-sm {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 20px;
        }

        /* ── Touch-friendly minimum tap target ───────────────── */
        .sb-btn { min-height: 44px; }

        /* ── Prevent iOS font-size zoom on inputs ────────────── */
        @media (max-width: 768px) {
          input, select, textarea { font-size: 16px !important; }
        }

        /* ── Tablet breakpoint (≤900px) ──────────────────────── */
        @media (max-width: 900px) {
          .sb-split {
            flex-direction: column;
          }
          .sb-split-aside {
            width: 100% !important;
            position: static !important;
          }
          .sb-grid-sidebar,
          .sb-grid-sidebar-wide,
          .sb-grid-sidebar-sm {
            grid-template-columns: 1fr !important;
          }
        }

        /* ── Mobile breakpoint (≤768px) ──────────────────────── */
        @media (max-width: 768px) {
          .sb-sidebar {
            transform: translateX(-220px);
          }
          .sb-sidebar.sb-open {
            transform: translateX(0);
          }
          .sb-main {
            margin-left: 0 !important;
          }
          .sb-hamburger {
            display: flex !important;
          }
          .sb-grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .sb-grid-modules {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .sb-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .sb-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .sb-hide-mobile {
            display: none !important;
          }
          .sb-page-pad {
            padding: 0.75rem !important;
          }
        }

        /* ── Small phone (≤480px) ────────────────────────────── */
        @media (max-width: 480px) {
          .sb-grid-4 {
            grid-template-columns: 1fr !important;
          }
          .sb-grid-modules {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={'sb-sidebar' + (open ? ' sb-open' : '')}>
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
            // Hide qaOnly links unless in QA env or michael's account
            if (item.qaOnly && process.env.NEXT_PUBLIC_APP_ENV !== 'qa' && (auth && auth.email) !== 'michael@spanglerbuilt.com') return null
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
      <main className="sb-main">
        {/* Top bar */}
        <div style={{height:48, background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,.07)', display:'flex', alignItems:'center', padding:'0 1rem', position:'sticky', top:0, zIndex:40}}>
          {/* Hamburger — mobile only */}
          <button className="sb-hamburger" onClick={function(){ setOpen(function(o){ return !o }) }} aria-label="Menu">
            <span style={{transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none'}}/>
            <span style={{opacity: open ? 0 : 1}}/>
            <span style={{transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none'}}/>
          </button>
          <div style={{flex:1}}/>
          <div style={{fontSize:11, color:'rgba(255,255,255,.25)', letterSpacing:'.06em'}}>
            SpanglerBuilt &nbsp;·&nbsp; <span style={{color:color}}>{MODULE_LABEL[role]}</span>
          </div>
        </div>

        {/* Page */}
        <div style={{padding:'1.5rem'}} className="sb-page-pad">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={function(){ setOpen(false) }}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:49}}
        />
      )}
    </div>
  )
}
