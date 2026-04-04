import Layout from '../components/Layout'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  var [authChecked, setAuthChecked] = useState(false)
  var [pipeline,    setPipeline]    = useState([
    {id:'',pn:'SB-2026-001',name:'Ryan and Dori Mendel', type:'Basement',value:'$55,394', status:'Estimate',sc:{bg:'#eeedfe',color:'#534AB7'}},
    {id:'',pn:'SB-2026-002',name:'John and Susan Park',  type:'Kitchen', value:'$78,200', status:'Approved',sc:{bg:'#eaf3de',color:'#3B6D11'}},
    {id:'',pn:'SB-2026-003',name:'Tom and Wendy Harris', type:'Addition',value:'$148,000',status:'Started', sc:{bg:'#e8f5e9',color:'#1b5e20'}},
    {id:'',pn:'SB-2026-004',name:'Amy Chen',             type:'Bath',    value:'$24,500', status:'New lead',sc:{bg:'#fff3e0',color:'#e65100'}},
  ])

  var STATUS_SC = {
    'New lead':  {bg:'#fff3e0',color:'#e65100'},
    'Contacted': {bg:'#e3f2fd',color:'#0d47a1'},
    'Estimate':  {bg:'#eeedfe',color:'#534AB7'},
    'Approved':  {bg:'#eaf3de',color:'#3B6D11'},
    'Started':   {bg:'#e8f5e9',color:'#1b5e20'},
    'Completed': {bg:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.5)'},
    'Lost':      {bg:'#fcebeb',color:'#c0392b'},
  }

  useEffect(function() {
    try {
      var auth = JSON.parse(localStorage.getItem('sb_auth') || 'null')
      if (!auth || auth.role !== 'contractor') {
        window.location.href = '/login'
        return
      }
    } catch(e) {
      window.location.href = '/login'
      return
    }
    setAuthChecked(true)

    // Load live pipeline from Supabase via leads API
    fetch('/api/leads/list')
      .then(function(r){ return r.json() })
      .then(function(json) {
        if (!json.leads || json.leads.length === 0) return
        var live = json.leads.slice(0, 6).map(function(l) {
          return {
            id:     l.id,
            pn:     l.pn,
            name:   l.name,
            type:   l.type,
            value:  '$' + (l.value || 0).toLocaleString(),
            status: l.status,
            sc:     STATUS_SC[l.status] || STATUS_SC['New lead'],
          }
        })
        setPipeline(live)
      })
      .catch(function(){})
  }, [])

  if (!authChecked) return null

  var modules = [
    {label:'Estimating tool',    href:'/contractor/estimate',  desc:'16 CSI divisions, G/B/B/L', icon:'$'},
    {label:'Material catalog',   href:'/contractor/catalog',   desc:'Browse and queue materials', icon:'◧'},
    {label:'Lead pipeline',      href:'/contractor/leads',     desc:'All projects and contacts',  icon:'◉'},
    {label:'Project templates',  href:'/contractor/templates', desc:'Searchable and cloneable',   icon:'◈'},
    {label:'AI tools',           href:'/ai',                      desc:'Claude-powered generation',  icon:'✦'},
    {label:'Options & Upgrades', href:'/contractor/options',      desc:'Build upgrade packages',      icon:'◈'},
    {label:'Client selections',  href:'/contractor/selections',   desc:'Material choices by tier',   icon:'✓'},
    {label:'Presentation',       href:'/contractor/presentation', desc:'Client-facing slide deck',    icon:'▶'},
    {label:'Schedule',           href:'/contractor/schedule',     desc:'Project Gantt chart',         icon:'◉'},
    {label:'Payments',           href:'/contractor/payments',     desc:'Draw schedule & invoicing',   icon:'$'},
    {label:'Contact form',       href:'/contact',                 desc:'Lead intake and AI ballpark', icon:'↗'},
  ]

  return (
    <Layout>
      <div style={{padding:'1.5rem',maxWidth:1800,margin:'0 auto'}}>

        <div className="sb-grid-4" style={{marginBottom:'1.5rem'}}>
          {[['Active projects','3'],['Open leads','7'],['Pipeline','$284K'],['YTD revenue','$127K']].map(function(item){return (
            <div key={item[0]} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'.75rem 1rem',borderTop:'3px solid #0a0a0a'}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{item[0]}</div>
              <div style={{fontSize:22,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{item[1]}</div>
            </div>
          )})}
        </div>

        <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.75rem'}}>Quick actions</div>
        <div className="sb-grid-modules" style={{marginBottom:'1.5rem'}}>
          {modules.map(function(m){return (
            <a key={m.href} href={m.href} style={{display:'flex',gap:12,alignItems:'center',padding:'1rem',background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,textDecoration:'none',borderLeft:'4px solid #0a0a0a'}}>
              <div style={{width:36,height:36,background:'#0a0a0a',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#D06830',flexShrink:0}}>{m.icon}</div>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.75)',marginBottom:2}}>{m.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{m.desc}</div>
              </div>
            </a>
          )})}
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.5rem'}}>
          <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em'}}>Active pipeline</div>
          <a href="/contractor/leads" style={{fontSize:11,color:'#D06830',textDecoration:'none',fontWeight:600}}>View all leads →</a>
        </div>
        <div className="sb-table-wrap" style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'140px 1fr 100px 110px 100px 1fr',gap:10,padding:'7px 1rem',background:'#0a0a0a',fontSize:10,fontWeight:500,color:'#D06830',textTransform:'uppercase',letterSpacing:'.04em',minWidth:640}}>
            <span>Project ID</span><span>Client</span><span>Type</span><span>Value</span><span>Status</span><span>Open in</span>
          </div>
          {pipeline.map(function(p,i){return (
            <div key={p.pn} style={{display:'grid',gridTemplateColumns:'140px 1fr 100px 110px 100px 1fr',gap:10,padding:'9px 1rem',alignItems:'center',fontSize:12,borderTop:i===0?'none':'1px solid rgba(255,255,255,.07)',background:'#161616',minWidth:640}}>
              <span style={{fontWeight:500,color:'rgba(255,255,255,.75)',fontSize:11}}>{p.pn}</span>
              <span>{p.name}</span>
              <span style={{color:'rgba(255,255,255,.35)'}}>{p.type}</span>
              <span style={{fontWeight:500,color:'rgba(255,255,255,.75)'}}>{p.value}</span>
              <span><span style={{background:p.sc.bg,color:p.sc.color,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3}}>{p.status}</span></span>
              <span style={{display:'flex',gap:6}}>
                <a href={'/contractor/estimate?id=' + p.id} style={{fontSize:10,color:'rgba(255,255,255,.75)',textDecoration:'none',border:'1px solid rgba(255,255,255,.09)',padding:'2px 8px',borderRadius:3,fontWeight:600,whiteSpace:'nowrap'}}>Estimate</a>
                <a href={'/client/project-book?id=' + p.id} style={{fontSize:10,color:'#D06830',textDecoration:'none',border:'1px solid #D06830',padding:'2px 8px',borderRadius:3,fontWeight:600,whiteSpace:'nowrap'}}>Book</a>
              </span>
            </div>
          )})}
        </div>

        <div style={{marginTop:'1rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · Design/Build Contractor · GC &amp; Home Builder · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
