import { useState } from 'react'

const STATUSES = ['New lead','Contacted','Estimate','Approved','Started','Completed','Lost']
const STATUS_COLORS = {
  'New lead':  { bg:'#fff3e0', color:'#e65100' },
  'Contacted': { bg:'#e3f2fd', color:'#0d47a1' },
  'Estimate':  { bg:'#eeedfe', color:'#534AB7' },
  'Approved':  { bg:'#eaf3de', color:'#3B6D11' },
  'Started':   { bg:'#e8f5e9', color:'#1b5e20' },
  'Completed': { bg:'#f5f4f1', color:'#5f5e5a' },
  'Lost':      { bg:'#fcebeb', color:'#c0392b' },
}

const SAMPLE_LEADS = [
  { id:1, pn:'SB-2026-001', name:'Ryan & Dori Mendel',  type:'Basement', value:55394, status:'Estimate',  date:'Mar 15' },
  { id:2, pn:'SB-2026-002', name:'John & Susan Park',   type:'Kitchen',  value:78200, status:'Approved',  date:'Mar 18' },
  { id:3, pn:'SB-2026-003', name:'Tom & Wendy Harris',  type:'Addition', value:148000,status:'Started',   date:'Feb 9'  },
  { id:4, pn:'SB-2026-004', name:'Amy Chen',            type:'Bath',     value:24500, status:'New lead',  date:'Mar 27' },
  { id:5, pn:'SB-2026-005', name:'Mark & Lisa Rivera',  type:'Basement', value:62000, status:'Contacted', date:'Mar 22' },
]

const S = {
  page:   { minHeight:'100vh', background:'#f5f4f1', fontFamily:'sans-serif' },
  topbar: { background:'#0a0a0a', padding:'1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' },
  brand:  { fontFamily:'Georgia,serif', fontSize:16, color:'#fff', fontWeight:700, letterSpacing:'.08em' },
  wrap:   { padding:'1.5rem', maxWidth:1100, margin:'0 auto' },
  card:   { background:'#fff', border:'1px solid #e8e6e0', borderRadius:4, overflow:'hidden' },
  th:     { padding:'7px 12px', background:'#f5f4f1', fontSize:10, fontWeight:500, color:'#9a9690', textTransform:'uppercase', letterSpacing:'.04em', textAlign:'left', borderBottom:'1px solid #e8e6e0' },
  td:     { padding:'9px 12px', borderBottom:'1px solid #f5f4f1', fontSize:12, color:'#3d3b37' },
}

export default function LeadsPage() {
  const [filter, setFilter] = useState('All')
  const leads = filter === 'All' ? SAMPLE_LEADS : SAMPLE_LEADS.filter(l => l.status === filter)

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <div style={S.brand}>SPANGLERBUILT <span style={{ fontSize:11, color:'#c9a96e', fontWeight:400 }}> · LEADS</span></div>
        <a href="/dashboard" style={{ fontSize:11, color:'#9a9690', textDecoration:'none' }}>← Dashboard</a>
      </div>
      <div style={S.wrap}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem', flexWrap:'wrap', gap:8 }}>
          <div style={{ fontFamily:'Georgia,serif', fontSize:18, fontWeight:500 }}>Lead pipeline</div>
          <button onClick={() => window.location.href='/leads/new'} style={{ background:'#0a0a0a', color:'#c9a96e', border:'none', padding:'7px 18px', fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', cursor:'pointer', borderRadius:3, fontFamily:'inherit' }}>+ New lead</button>
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1rem' }}>
          {['All',...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:'4px 12px', fontSize:11, border:'1px solid', fontFamily:'inherit',
              borderColor: filter===s ? '#0a0a0a' : '#e8e6e0',
              background: filter===s ? '#0a0a0a' : '#fff',
              color: filter===s ? '#fff' : '#9a9690',
              borderRadius:3, cursor:'pointer',
            }}>{s}</button>
          ))}
        </div>

        <div style={S.card}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Project ID','Client','Type','Value','Status','Date',''].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => {
                const sc = STATUS_COLORS[lead.status] || STATUS_COLORS['New lead']
                return (
                  <tr key={lead.id} style={{ cursor:'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background='#fafaf8'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <td style={{ ...S.td, color:'#185FA5', fontWeight:500, fontSize:11 }}>{lead.pn}</td>
                    <td style={S.td}>{lead.name}</td>
                    <td style={S.td}>{lead.type}</td>
                    <td style={{ ...S.td, fontWeight:500 }}>${lead.value.toLocaleString()}</td>
                    <td style={S.td}><span style={{ background:sc.bg, color:sc.color, fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:3 }}>{lead.status}</span></td>
                    <td style={{ ...S.td, color:'#9a9690' }}>{lead.date}</td>
                    <td style={{ ...S.td, color:'#FF8C00', fontWeight:500 }}>View →</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
