import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var STATUS_OPTIONS = ['new_lead','contacted','proposal_sent','in_progress','closed_won','closed_lost']

export default function MarketingLeads() {
  var [leads,  setLeads]  = useState([])
  var [filter, setFilter] = useState('all')
  var [search, setSearch] = useState('')

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }

    fetch('/api/leads/list')
      .then(function(r) { return r.json() })
      .then(function(d) { setLeads(d.projects || []) })
      .catch(function(){})
  }, [])

  var filtered = leads.filter(function(p) {
    var matchStatus = filter === 'all' || p.status === filter
    var q = search.toLowerCase()
    var matchSearch = !q || (p.client_name||'').toLowerCase().includes(q) || (p.client_email||'').toLowerCase().includes(q) || (p.project_type||'').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  var STATUS_COLOR = {
    new_lead:'#D06830', contacted:'#4a9eff', proposal_sent:'#a78bfa',
    in_progress:'#22c55e', closed_won:'#16a34a', closed_lost:'rgba(255,255,255,.25)',
  }

  var inp = { padding:'8px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:12, outline:'none' }

  return (
    <Layout>
      <div style={{maxWidth:1800, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:10}}>
          <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>Lead pipeline</div>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <input value={search} onChange={function(e){setSearch(e.target.value)}} placeholder="Search name, email, type…" style={Object.assign({},inp,{width:220})}/>
            <select value={filter} onChange={function(e){setFilter(e.target.value)}} style={inp}>
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map(function(s){ return <option key={s} value={s}>{s.replace(/_/g,' ')}</option> })}
            </select>
          </div>
        </div>

        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, overflow:'hidden'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 120px 100px 80px', padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,.07)'}}>
            {['Contact','Project','Type','Status','Date'].map(function(h){
              return <div key={h} style={{fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.06em'}}>{h}</div>
            })}
          </div>
          {filtered.length === 0 ? (
            <div style={{padding:'2rem', textAlign:'center', fontSize:13, color:'rgba(255,255,255,.3)'}}>No leads match your filter.</div>
          ) : filtered.map(function(p, i) {
            var status = p.status || 'new_lead'
            return (
              <div key={p.id} style={{display:'grid', gridTemplateColumns:'1fr 1fr 120px 100px 80px', padding:'12px 16px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,.05)':'none', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)'}}>{p.client_name}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>{p.client_email}</div>
                </div>
                <div style={{fontSize:12, color:'rgba(255,255,255,.5)'}}>{p.project_number}</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,.5)'}}>{p.project_type}</div>
                <div>
                  <span style={{fontSize:10, fontWeight:700, color: STATUS_COLOR[status]||'#fff', background:'rgba(255,255,255,.05)', padding:'2px 7px', borderRadius:3, textTransform:'uppercase', letterSpacing:'.05em'}}>
                    {status.replace(/_/g,' ')}
                  </span>
                </div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>
                  {new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{marginTop:'1rem', fontSize:11, color:'rgba(255,255,255,.25)'}}>
          Showing {filtered.length} of {leads.length} leads
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
