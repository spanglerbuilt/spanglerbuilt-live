import { useEffect, useState } from 'react'
import MarketingNav from './_nav'

export default function MarketingDashboard() {
  var [auth,  setAuth]  = useState(null)
  var [leads, setLeads] = useState([])
  var [stats, setStats] = useState({ total: 0, thisMonth: 0, newLeads: 0 })

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
      setAuth(a)
    } catch(e) { window.location.href = '/login' }

    // Load recent leads
    fetch('/api/leads/list')
      .then(function(r) { return r.json() })
      .then(function(d) {
        var list = d.projects || []
        var now  = new Date()
        var thisMonth = list.filter(function(p) {
          return new Date(p.created_at).getMonth() === now.getMonth() &&
                 new Date(p.created_at).getFullYear() === now.getFullYear()
        })
        setLeads(list.slice(0, 8))
        setStats({
          total:     list.length,
          thisMonth: thisMonth.length,
          newLeads:  list.filter(function(p){ return p.status === 'new_lead' }).length,
        })
      })
      .catch(function(){})
  }, [])

  var STATUS_COLOR = {
    new_lead:    '#D06830',
    contacted:   '#4a9eff',
    in_progress: '#22c55e',
    closed:      'rgba(255,255,255,.3)',
  }

  var statCards = [
    { label: 'Total leads',   value: stats.total },
    { label: 'This month',    value: stats.thisMonth },
    { label: 'New / unread',  value: stats.newLeads },
  ]

  var quickLinks = [
    { label: 'Manage campaigns',  href: '/marketing/campaigns',  desc: 'Email blasts & drip sequences' },
    { label: 'Lead pipeline',     href: '/marketing/leads',      desc: 'All contacts & HubSpot sync' },
    { label: 'Marketing materials', href: '/marketing/materials', desc: 'Brochures, photos, assets' },
    { label: 'Social channels',   href: '/marketing/channels',   desc: 'Facebook, Instagram & more' },
  ]

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      <MarketingNav />

      <div style={{maxWidth:960, margin:'0 auto', padding:'1.5rem'}}>

        {/* Header */}
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{fontSize:22, fontWeight:700, color:'#fff'}}>
            Welcome back{auth ? ', Cari' : ''}
          </div>
          <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:4}}>
            SpanglerBuilt Marketing Dashboard · {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </div>
        </div>

        {/* Stat cards */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:'1.5rem'}}>
          {statCards.map(function(s) {
            return (
              <div key={s.label} style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1.25rem 1.5rem'}}>
                <div style={{fontSize:28, fontWeight:700, color:'#fff', marginBottom:4}}>{s.value}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em'}}>{s.label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick actions */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Quick access</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10, marginBottom:'1.75rem'}}>
          {quickLinks.map(function(l) {
            return (
              <a key={l.href} href={l.href} style={{
                display:'block', padding:'1rem 1.25rem',
                background:'#161616', border:'1px solid rgba(255,255,255,.08)',
                borderLeft:'4px solid #D06830', borderRadius:4, textDecoration:'none',
              }}>
                <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.85)', marginBottom:3}}>{l.label}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{l.desc}</div>
              </a>
            )
          })}
        </div>

        {/* Recent leads */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Recent leads</div>
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, overflow:'hidden', marginBottom:'1.5rem'}}>
          {leads.length === 0 ? (
            <div style={{padding:'1.5rem', fontSize:13, color:'rgba(255,255,255,.3)', textAlign:'center'}}>No leads yet.</div>
          ) : leads.map(function(p, i) {
            var status = p.status || 'new_lead'
            return (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                padding:'12px 16px', gap:12,
                borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
              }}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)', marginBottom:2}}>{p.client_name}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{p.project_type} · {p.client_email}</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0}}>
                  <div style={{
                    display:'inline-block', fontSize:10, fontWeight:700,
                    color: STATUS_COLOR[status] || '#fff',
                    background: 'rgba(255,255,255,.05)',
                    padding:'2px 8px', borderRadius:3, textTransform:'uppercase', letterSpacing:'.06em',
                    marginBottom:4,
                  }}>{status.replace(/_/g,' ')}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,.25)'}}>
                    {new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* HubSpot callout */}
        <div style={{background:'rgba(255,122,0,.06)', border:'1px solid rgba(255,122,0,.2)', borderRadius:4, padding:'1rem 1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div>
            <div style={{fontSize:12, fontWeight:700, color:'rgba(255,165,0,.8)', marginBottom:3}}>HubSpot not yet connected</div>
            <div style={{fontSize:12, color:'rgba(255,255,255,.4)'}}>Connect HubSpot to sync leads, run email campaigns, and track the pipeline.</div>
          </div>
          <a href="/marketing/channels" style={{flexShrink:0, background:'#D06830', color:'#fff', fontSize:12, fontWeight:700, padding:'8px 16px', borderRadius:3, textDecoration:'none', whiteSpace:'nowrap'}}>Connect →</a>
        </div>

      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
