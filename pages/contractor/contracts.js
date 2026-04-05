import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var STATUS_STYLE = {
  draft:  { bg:'rgba(255,255,255,.08)', color:'rgba(255,255,255,.5)', label:'Draft' },
  sent:   { bg:'#e3f2fd', color:'#0d47a1',  label:'Sent' },
  signed: { bg:'#eaf3de', color:'#3B6D11',  label:'Signed' },
  voided: { bg:'#fcebeb', color:'#c0392b',  label:'Voided' },
}

export default function ContractsList() {
  var [contracts, setContracts] = useState([])
  var [loading,   setLoading]   = useState(true)
  var [search,    setSearch]    = useState('')

  useEffect(function() {
    try {
      var auth = JSON.parse(localStorage.getItem('sb_auth') || 'null')
      if (!auth || auth.role !== 'contractor') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login'; return }

    fetch('/api/contracts/list')
      .then(function(r){ return r.json() })
      .then(function(j){ setContracts(j.contracts || []); setLoading(false) })
      .catch(function(){ setLoading(false) })
  }, [])

  var filtered = contracts.filter(function(c) {
    var q = search.toLowerCase()
    if (!q) return true
    var proj = c.projects || {}
    return (proj.client_name||'').toLowerCase().includes(q)
      || (proj.project_number||'').toLowerCase().includes(q)
      || (c.project_type||'').toLowerCase().includes(q)
      || (c.status||'').toLowerCase().includes(q)
  })

  var counts = { draft:0, sent:0, signed:0, voided:0 }
  contracts.forEach(function(c){ if (counts[c.status] !== undefined) counts[c.status]++ })

  return (
    <Layout>
      <div style={{padding:'1.5rem', maxWidth:1400, margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem', flexWrap:'wrap', gap:10}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Contracts</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>All project contracts — draft, sent, and signed</div>
          </div>
          <a href="/contractor/contract-template" style={{background:'rgba(255,140,0,.15)',border:'1px solid rgba(255,140,0,.3)',color:'#FF8C00',padding:'8px 16px',fontSize:11,fontWeight:600,borderRadius:3,textDecoration:'none'}}>
            ◈ Manage Templates
          </a>
        </div>

        {/* Summary strip */}
        <div className="sb-grid-4" style={{marginBottom:'1.25rem'}}>
          {[
            ['Total', contracts.length, 'rgba(255,255,255,.6)'],
            ['Draft', counts.draft, 'rgba(255,255,255,.4)'],
            ['Sent',  counts.sent,  '#4a9eff'],
            ['Signed',counts.signed,'#81c784'],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{background:'#1a1f2e',border:'1px solid rgba(255,140,0,.15)',borderRadius:4,padding:'.75rem 1rem',borderTop:'3px solid #0a0a0a'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{item[0]}</div>
                <div style={{fontSize:22,fontWeight:600,color:item[2]}}>{item[1]}</div>
              </div>
            )
          })}
        </div>

        {/* Search */}
        <div style={{marginBottom:'1rem'}}>
          <input value={search} onChange={function(e){setSearch(e.target.value)}}
            placeholder="Search client, project ID, type, or status…"
            style={{width:'100%',maxWidth:400,padding:'8px 12px',background:'#1a1f2e',border:'1px solid rgba(255,255,255,.1)',borderRadius:3,color:'rgba(255,255,255,.8)',fontSize:12,outline:'none',fontFamily:'inherit'}}/>
        </div>

        {/* Table */}
        <div className="sb-table-wrap" style={{background:'#1a1f2e',border:'1px solid rgba(255,140,0,.2)',borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'130px 1fr 110px 120px 110px 120px 1fr',gap:8,padding:'8px 1rem',background:'#111',fontSize:10,fontWeight:600,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.04em',minWidth:800}}>
            <span>Project ID</span>
            <span>Client</span>
            <span>Project Type</span>
            <span>Contract Type</span>
            <span>Status</span>
            <span>Sent / Signed</span>
            <span>Actions</span>
          </div>

          {loading && (
            <div style={{padding:'2rem',textAlign:'center',color:'rgba(255,255,255,.3)',fontSize:12}}>Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{padding:'2rem',textAlign:'center',color:'rgba(255,255,255,.3)',fontSize:12}}>
              {contracts.length === 0 ? 'No contracts yet. Generate one from a project page.' : 'No matches.'}
            </div>
          )}

          {filtered.map(function(c, i) {
            var proj = c.projects || {}
            var ss   = STATUS_STYLE[c.status] || STATUS_STYLE.draft
            return (
              <div key={c.id} style={{display:'grid',gridTemplateColumns:'130px 1fr 110px 120px 110px 120px 1fr',gap:8,padding:'10px 1rem',alignItems:'center',fontSize:12,borderTop:i===0?'none':'1px solid rgba(255,255,255,.06)',minWidth:800}}>
                <span style={{fontWeight:600,color:'rgba(255,255,255,.7)',fontSize:11}}>{proj.project_number || c.project_id?.slice(0,8)}</span>
                <span style={{color:'rgba(255,255,255,.8)'}}>{proj.client_name || '—'}</span>
                <span style={{color:'rgba(255,255,255,.4)'}}>{proj.project_type || '—'}</span>
                <span style={{color:'rgba(255,255,255,.4)'}}>{c.project_type || '—'}</span>
                <span><span style={{background:ss.bg,color:ss.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3}}>{ss.label}</span></span>
                <span style={{color:'rgba(255,255,255,.35)',fontSize:11}}>
                  {c.status === 'signed' && c.signed_at ? new Date(c.signed_at).toLocaleDateString() : ''}
                  {c.status === 'sent'   && c.sent_at   ? new Date(c.sent_at).toLocaleDateString()   : ''}
                  {c.status === 'draft'  ? 'Not sent' : ''}
                </span>
                <span style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <a href={'/contractor/projects/' + c.project_id}
                    style={{fontSize:10,color:'#FF8C00',textDecoration:'none',border:'1px solid rgba(255,140,0,.4)',padding:'3px 8px',borderRadius:3,fontWeight:600,whiteSpace:'nowrap'}}>
                    Open Project
                  </a>
                  {c.pdf_url && (
                    <a href={c.pdf_url} target="_blank" rel="noreferrer"
                      style={{fontSize:10,color:'rgba(255,255,255,.6)',textDecoration:'none',border:'1px solid rgba(255,255,255,.12)',padding:'3px 8px',borderRadius:3,whiteSpace:'nowrap'}}>
                      PDF
                    </a>
                  )}
                  {c.status === 'signed' && c.signer_1_name && (
                    <span style={{fontSize:10,color:'#81c784',padding:'3px 0'}}>✓ {c.signer_1_name}</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
