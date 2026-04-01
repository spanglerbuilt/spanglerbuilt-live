import { useState } from 'react'

const PRIORITIES = { high:'#c0392b', medium:'#FF8C00', low:'#3B6D11' }
const STATUSES   = ['open','in progress','complete']

const INIT_ITEMS = [
  { id:1, desc:'Touch-up paint needed — NE corner ceiling', location:'Main area', priority:'low',    status:'open',        photos:[], notes:'' },
  { id:2, desc:'Bar cabinet door alignment — left door not flush', location:'Bar area', priority:'medium', status:'in progress', photos:[], notes:'Michael reviewing' },
  { id:3, desc:'Shower threshold caulk gap', location:'Bathroom', priority:'high',   status:'open',        photos:[], notes:'' },
]

export default function PunchListPage() {
  const [items,    setItems]    = useState(INIT_ITEMS)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ desc:'', location:'', priority:'medium', notes:'' })

  function addItem() {
    if (!form.desc.trim()) return
    setItems(i => [...i, { id:i.length+1, ...form, status:'open', photos:[] }])
    setForm({ desc:'', location:'', priority:'medium', notes:'' })
    setShowForm(false)
  }

  const open   = items.filter(i=>i.status==='open').length
  const inProg = items.filter(i=>i.status==='in progress').length
  const done   = items.filter(i=>i.status==='complete').length

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}> · PUNCH LIST</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:'1.25rem'}}>
          {[['Open',open,'#fcebeb','#c0392b'],['In progress',inProg,'#fff3e0','#FF8C00'],['Complete',done,'#eaf3de','#3B6D11']].map(([l,v,bg,c])=>(
            <div key={l} style={{background:'#fff',border:`1px solid #e8e6e0`,borderRadius:4,padding:'.75rem 1rem',borderTop:`3px solid ${c}`}}>
              <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{l}</div>
              <div style={{fontSize:22,fontWeight:500,color:c}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
          <div style={{fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em'}}>Punch list items</div>
          <button onClick={()=>setShowForm(!showForm)} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'6px 16px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
            + Add item
          </button>
        </div>

        {showForm && (
          <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'1rem',marginBottom:'1rem'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>New punch list item</div>
            <div style={{marginBottom:10}}>
              <div style={{fontSize:10,color:'#9a9690',marginBottom:4,textTransform:'uppercase',letterSpacing:'.08em'}}>Description *</div>
              <input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}
                placeholder="Describe the issue..."
                style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div>
                <div style={{fontSize:10,color:'#9a9690',marginBottom:4,textTransform:'uppercase',letterSpacing:'.08em'}}>Location</div>
                <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
                  placeholder="e.g. Bathroom, Bar area..."
                  style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none'}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:'#9a9690',marginBottom:4,textTransform:'uppercase',letterSpacing:'.08em'}}>Priority</div>
                <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}
                  style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#fff'}}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:'#9a9690',marginBottom:4,textTransform:'uppercase',letterSpacing:'.08em'}}>Notes</div>
              <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                placeholder="Any additional notes..."
                style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',minHeight:60,resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={addItem} style={{background:'#002147',color:'#fff',border:'none',padding:'8px 20px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Submit item</button>
              <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'8px 20px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden'}}>
          {items.map((item,i)=>(
            <div key={item.id} style={{padding:'1rem',borderTop:i===0?'none':'1px solid #f5f4f1',background:item.status==='complete'?'#fafaf8':'#fff'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8,marginBottom:4}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:item.status==='complete'?'#9a9690':'#002147',textDecoration:item.status==='complete'?'line-through':'none',marginBottom:3}}>{item.desc}</div>
                  {item.location && <div style={{fontSize:11,color:'#9a9690',marginBottom:3}}>Location: {item.location}</div>}
                  {item.notes && <div style={{fontSize:11,color:'#5f5e5a',fontStyle:'italic'}}>{item.notes}</div>}
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
                  <span style={{background:PRIORITIES[item.priority]+'22',color:PRIORITIES[item.priority],fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase'}}>{item.priority}</span>
                  <span style={{background:item.status==='complete'?'#eaf3de':item.status==='in progress'?'#fff3e0':'#fcebeb',color:item.status==='complete'?'#3B6D11':item.status==='in progress'?'#FF8C00':'#c0392b',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase'}}>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{marginTop:'1rem',fontSize:11,color:'#9a9690',textAlign:'center'}}>
          Photo upload coming soon · Call (404) 492-7650 for urgent issues
        </div>
      </div>
    </div>
  )
}
