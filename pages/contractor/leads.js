import { useState, useEffect } from 'react'

const STATUSES = ['New lead','Contacted','Estimate','Approved','Started','Completed','Lost']
const STATUS_COLORS = {
  'New lead':  { bg:'#fff3e0', color:'#e65100' },
  'Contacted': { bg:'#e3f2fd', color:'#0d47a1' },
  'Estimate':  { bg:'#eeedfe', color:'#534AB7' },
  'Approved':  { bg:'#eaf3de', color:'#3B6D11' },
  'Started':   { bg:'#e8f5e9', color:'#1b5e20' },
  'Completed': { bg:'#f5f4f1', color:'rgba(255,255,255,.5)' },
  'Lost':      { bg:'#fcebeb', color:'#c0392b' },
}

const INIT_LEADS = [
  { id:1, pn:'SB-2026-001', name:'Ryan & Dori Mendel',  type:'Basement', value:55394, status:'Estimate',  date:'Mar 15', address:'4995 Shadow Glen Ct, Dunwoody GA 30338', phone:'(404) 555-0101', email:'ryan.mendel@email.com',  note:'Wants full finish with bath and bar. Better tier selected.' },
  { id:2, pn:'SB-2026-002', name:'John & Susan Park',   type:'Kitchen',  value:78200, status:'Approved',  date:'Mar 18', address:'112 Towne Lake Pkwy, Woodstock GA 30189', phone:'(770) 555-0202', email:'john.park@email.com',    note:'Open floor plan, quartz counters, KraftMaid cabinets.' },
  { id:3, pn:'SB-2026-003', name:'Tom & Wendy Harris',  type:'Addition', value:148000,status:'Started',   date:'Feb 9',  address:'88 Hickory Ridge, Canton GA 30115',       phone:'(678) 555-0303', email:'wendy.harris@email.com', note:'Bonus room over garage. Permit issued Feb 6.' },
  { id:4, pn:'SB-2026-004', name:'Amy Chen',            type:'Bath',     value:24500, status:'New lead',  date:'Mar 27', address:'23 Mill Run Dr, Alpharetta GA 30022',      phone:'(404) 555-0404', email:'amy.chen@email.com',     note:'Primary bath gut. Interested in frameless shower.' },
  { id:5, pn:'SB-2026-005', name:'Mark & Lisa Rivera',  type:'Basement', value:62000, status:'Contacted', date:'Mar 22', address:'56 Brookstone Way, Acworth GA 30101',       phone:'(770) 555-0505', email:'mark.rivera@email.com',  note:'Called back Mar 23. Estimate scheduled Apr 2.' },
]

const BLANK_FORM = { name:'', type:'Basement', address:'', phone:'', email:'', value:'', status:'New lead', note:'' }

const S = {
  page:   { minHeight:'100vh', background:'#1a1a1a', fontFamily:'Poppins,sans-serif' },
  topbar: { background:'#0a0a0a', padding:'1rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'3px solid #D06830' },
  wrap:   { padding:'1.5rem', maxWidth:1100, margin:'0 auto' },
  card:   { background:'#fff', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden' },
  th:     { padding:'7px 12px', background:'#0a0a0a', fontSize:10, fontWeight:500, color:'#D06830', textTransform:'uppercase', letterSpacing:'.06em', textAlign:'left' },
  td:     { padding:'10px 12px', borderBottom:'1px solid #f5f4f1', fontSize:12, color:'rgba(255,255,255,.65)' },
  label:  { fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5, display:'block' },
  input:  { width:'100%', padding:'8px 10px', border:'1px solid rgba(255,255,255,.09)', borderRadius:3, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', background:'rgba(208,104,48,.1)', boxSizing:'border-box' },
  overlay:{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,33,71,.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' },
  modal:  { background:'#fff', borderRadius:4, width:'100%', overflow:'hidden', border:'3px solid #D06830' },
  mhead:  { background:'#0a0a0a', padding:'1rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #D06830' },
}

export default function LeadsPage() {
  const [filter,   setFilter]   = useState('All')
  const [leads,    setLeads]    = useState(INIT_LEADS)
  const [showNew,  setShowNew]  = useState(false)
  const [form,     setForm]     = useState(BLANK_FORM)
  const [viewing,  setViewing]  = useState(null)
  const [editNote, setEditNote] = useState('')
  const [webCount, setWebCount] = useState(0)

  // Fetch web-submitted leads from API and prepend to list
  useEffect(function() {
    fetch('/api/leads/list')
      .then(function(r){ return r.json() })
      .then(function(json) {
        if (!json.leads || json.leads.length === 0) return
        setWebCount(json.leads.length)
        setLeads(function(prev) {
          // Avoid duplicates: remove any existing entries that have fromWeb flag, then prepend fresh ones
          var local = prev.filter(function(l){ return !l.fromWeb })
          return json.leads.concat(local)
        })
      })
      .catch(function(){}) // silently fail if API unavailable
  }, [])

  useEffect(function() {
    if (typeof window === 'undefined') return
    var raw = sessionStorage.getItem('sb_template')
    if (!raw) return
    try {
      var parsed  = JSON.parse(raw)
      var tmpl    = parsed.template
      var client  = parsed.client
      var typeMap = { BSM:'Basement', KIT:'Kitchen', BTH:'Bathroom', ADD:'Addition', CHB:'Custom home' }
      setForm({
        name:   client.clientName  || '',
        type:   typeMap[tmpl.code] || 'Basement',
        address:client.address     || '',
        phone:  '',
        email:  client.clientEmail || '',
        value:  String(tmpl.tiers[client.tier] || tmpl.tiers.good || ''),
        status: 'New lead',
        note:   'From template: ' + tmpl.name + (client.sqft ? ' · ' + client.sqft + ' sf' : ''),
      })
      setShowNew(true)
      sessionStorage.removeItem('sb_template')
    } catch(e) {}
  }, [])

  const filtered = filter === 'All' ? leads : leads.filter(l => l.status === filter)

  function nextId() { return Math.max(...leads.map(l => l.id)) + 1 }
  function nextPn()  {
    const nums = leads.map(l => parseInt(l.pn.split('-')[2])).filter(Boolean)
    const next = Math.max(...nums) + 1
    return `SB-${new Date().getFullYear()}-${String(next).padStart(3,'0')}`
  }

  function addLead() {
    if (!form.name.trim()) return
    const id = nextId()
    setLeads([...leads, {
      id, pn: nextPn(), name: form.name, type: form.type,
      value: parseInt(form.value) || 0, status: form.status,
      date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'}),
      address: form.address, phone: form.phone, email: form.email, note: form.note,
    }])
    setForm(BLANK_FORM)
    setShowNew(false)
  }

  function updateStatus(id, status) {
    setLeads(leads.map(l => l.id === id ? {...l, status} : l))
    if (viewing && viewing.id === id) setViewing({...viewing, status})
  }

  function saveNote(id) {
    setLeads(leads.map(l => l.id === id ? {...l, note: editNote} : l))
    if (viewing && viewing.id === id) setViewing({...viewing, note: editNote})
  }

  function openLead(lead) {
    setViewing(lead)
    setEditNote(lead.note)
  }

  return (
    <div style={S.page}>

      {/* New lead modal */}
      {showNew && (
        <div style={S.overlay}>
          <div style={{...S.modal, maxWidth:560}}>
            <div style={S.mhead}>
              <span style={{color:'#D06830',fontSize:13,fontWeight:700}}>New lead</span>
              <button onClick={()=>{setShowNew(false);setForm(BLANK_FORM)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Client name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="First & Last" style={S.input}/>
                </div>
                <div>
                  <label style={S.label}>Project type</label>
                  <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{...S.input,background:'#fff'}}>
                    {['Basement','Kitchen','Bathroom','Addition','Custom home','Other'].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>Property address</label>
                <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Street, City, GA ZIP" style={S.input}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Phone</label>
                  <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="(404) 555-0000" style={S.input}/>
                </div>
                <div>
                  <label style={S.label}>Email</label>
                  <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="client@email.com" style={S.input}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Estimated value ($)</label>
                  <input type="number" value={form.value} onChange={e=>setForm({...form,value:e.target.value})} placeholder="55000" style={S.input}/>
                </div>
                <div>
                  <label style={S.label}>Initial status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{...S.input,background:'#fff'}}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:'1.25rem'}}>
                <label style={S.label}>Notes</label>
                <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} placeholder="Project details, source of lead, next steps..." rows={3} style={{...S.input,resize:'vertical'}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={addLead} disabled={!form.name.trim()} style={{flex:1,background:'#D06830',color:'#fff',border:'none',padding:'10px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',opacity:!form.name.trim()?.6:1}}>
                  Add lead →
                </button>
                <button onClick={()=>{setShowNew(false);setForm(BLANK_FORM)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'10px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lead detail modal */}
      {viewing && (
        <div style={S.overlay}>
          <div style={{...S.modal, maxWidth:600}}>
            <div style={S.mhead}>
              <div>
                <div style={{color:'#D06830',fontSize:13,fontWeight:700}}>{viewing.name}</div>
                <div style={{color:'rgba(255,255,255,.5)',fontSize:10,marginTop:2}}>{viewing.pn} · {viewing.type}</div>
              </div>
              <button onClick={()=>setViewing(null)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:'1.25rem'}}>
                {[
                  ['Project number', viewing.pn],
                  ['Type', viewing.type],
                  ['Value', '$' + (viewing.value||0).toLocaleString()],
                  ['Lead date', viewing.date],
                  ['Address', viewing.address || '—'],
                  ['Phone', viewing.phone || '—'],
                  ['Email', viewing.email || '—'],
                ].map(([l,v])=>(
                  <div key={l}>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:'#0a0a0a',fontWeight:l==='Value'?600:400}}>{v}</div>
                  </div>
                ))}
                <div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Status</div>
                  <select value={viewing.status} onChange={e=>updateStatus(viewing.id,e.target.value)} style={{width:'100%',padding:'6px 8px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:12,fontFamily:'Poppins,sans-serif',background:'#fff'}}>
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{marginBottom:'1.25rem'}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Notes</div>
                <textarea value={editNote} onChange={e=>setEditNote(e.target.value)} rows={3} style={{...S.input,resize:'vertical'}}/>
              </div>
              {/* Project action links — pass the Supabase project UUID via ?id= */}
              <div style={{background:'#1a1a1a',borderRadius:4,padding:'10px 14px',marginBottom:'1rem'}}>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Open in portal</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <a href={'/contractor/estimate?id=' + viewing.id}
                    style={{background:'#0a0a0a',color:'#D06830',padding:'7px 14px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',border:'1px solid #D06830'}}>
                    Estimate →
                  </a>
                  <a href={'/contractor/presentation?id=' + viewing.id}
                    style={{background:'#fff',color:'#0a0a0a',padding:'7px 14px',fontSize:11,fontWeight:600,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',border:'1px solid rgba(255,255,255,.09)'}}>
                    Presentation →
                  </a>
                  <a href={'/client/project-book?id=' + viewing.id}
                    style={{background:'#fff',color:'#0a0a0a',padding:'7px 14px',fontSize:11,fontWeight:600,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',border:'1px solid rgba(255,255,255,.09)'}}>
                    Project Book →
                  </a>
                  <a href={'/client/selections?id=' + viewing.id}
                    style={{background:'#fff',color:'#0a0a0a',padding:'7px 14px',fontSize:11,fontWeight:600,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',border:'1px solid rgba(255,255,255,.09)'}}>
                    Selections →
                  </a>
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{saveNote(viewing.id);setViewing(null)}} style={{flex:1,background:'#0a0a0a',color:'#D06830',border:'none',padding:'9px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                  Save changes
                </button>
                <a href={viewing.email?'mailto:'+viewing.email:'#'} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'#0a0a0a',padding:'9px 14px',fontSize:11,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',display:'flex',alignItems:'center'}}>
                  Email
                </a>
                <a href={viewing.phone?'tel:'+viewing.phone.replace(/\D/g,''):'#'} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'#0a0a0a',padding:'9px 14px',fontSize:11,textDecoration:'none',borderRadius:3,fontFamily:'Poppins,sans-serif',display:'flex',alignItems:'center'}}>
                  Call
                </a>
                <button onClick={()=>setViewing(null)} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'9px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={S.topbar}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#D06830',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>&nbsp;· Leads</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      <div style={S.wrap}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,fontWeight:500,color:'#0a0a0a'}}>Lead pipeline</div>
            {webCount > 0 && <div style={{fontSize:11,color:'#3B6D11',marginTop:2}}>✓ {webCount} lead{webCount!==1?'s':''} from website contact form</div>}
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.35)',background:'#1a1a1a',border:'1px solid rgba(255,255,255,.09)',padding:'5px 10px',borderRadius:3}}>
              Contact form: <span style={{color:'#0a0a0a',fontWeight:600}}>spanglerbuilt.com/contact</span>
            </div>
            <button onClick={()=>setShowNew(true)} style={{background:'#D06830',color:'#fff',border:'none',padding:'7px 18px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>+ New lead</button>
          </div>
        </div>

        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1rem'}}>
          {['All',...STATUSES].map(s => {
            const sc = STATUS_COLORS[s]
            const count = s === 'All' ? leads.length : leads.filter(l=>l.status===s).length
            return (
              <button key={s} onClick={()=>setFilter(s)} style={{
                padding:'4px 12px',fontSize:11,border:'1px solid',fontFamily:'Poppins,sans-serif',cursor:'pointer',borderRadius:3,
                borderColor: filter===s?'#0a0a0a':'#e8e6e0',
                background: filter===s?'#0a0a0a':'#fff',
                color: filter===s?'#D06830':'#9a9690',
              }}>{s} <span style={{opacity:.6}}>({count})</span></button>
            )
          })}
        </div>

        <div style={S.card}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Project ID','Client','Type','Value','Status','Date',''].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(lead => {
                const sc = STATUS_COLORS[lead.status] || STATUS_COLORS['New lead']
                return (
                  <tr key={lead.id} onClick={()=>openLead(lead)} style={{cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(208,104,48,.1)'}
                    onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                    <td style={{...S.td,color:'#185FA5',fontWeight:500,fontSize:11}}>
                      {lead.pn}
                      {lead.fromWeb && <span style={{marginLeft:5,background:'#e3f2fd',color:'#0d47a1',fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:2,textTransform:'uppercase'}}>Web</span>}
                    </td>
                    <td style={S.td}>{lead.name}</td>
                    <td style={S.td}>{lead.type}</td>
                    <td style={{...S.td,fontWeight:500}}>${(lead.value||0).toLocaleString()}</td>
                    <td style={S.td}><span style={{background:sc.bg,color:sc.color,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:3}}>{lead.status}</span></td>
                    <td style={{...S.td,color:'rgba(255,255,255,.35)'}}>{lead.date}</td>
                    <td style={{...S.td,color:'#D06830',fontWeight:500}}>View →</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'rgba(255,255,255,.35)',padding:'2rem'}}>No leads match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{marginTop:'1rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
