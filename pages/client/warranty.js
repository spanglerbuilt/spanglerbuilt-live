import { useState } from 'react'

export default function WarrantyPage() {
  const [form,      setForm]      = useState({ area:'', desc:'', date:'', notes:'' })
  const [submitted, setSubmitted] = useState(false)

  function setF(k,v) { setForm(f=>({...f,[k]:v})) }

  function submit() {
    if (!form.area.trim() || !form.desc.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>
        <div style={{background:'#0a0a0a',padding:'1rem 2rem',borderBottom:'3px solid #D06830'}}>
          <div style={{fontFamily:'Poppins,sans-serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#D06830',fontWeight:400}}> · WARRANTY</span></div>
        </div>
        <div style={{maxWidth:600,margin:'3rem auto',padding:'0 1.5rem',textAlign:'center'}}>
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'3rem',borderTop:'4px solid #D06830'}}>
            <div style={{fontSize:36,marginBottom:'1rem',color:'#3B6D11'}}>✓</div>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:22,color:'#0a0a0a',marginBottom:8}}>Warranty request submitted</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.35)',marginBottom:'2rem',lineHeight:1.7}}>Michael will review your request and contact you within 2 business days to schedule a time to assess and resolve the issue.</div>
            <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'1rem',textAlign:'left',marginBottom:'2rem',fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.7}}>
              <strong style={{color:'#0a0a0a'}}>Item:</strong> {form.area}<br/>
              <strong style={{color:'#0a0a0a'}}>Description:</strong> {form.desc}
            </div>
            <a href="/client/dashboard" style={{display:'inline-block',background:'#0a0a0a',color:'#fff',padding:'10px 28px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none',borderRadius:3}}>← Back to portal</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{fontFamily:'Poppins,sans-serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#D06830',fontWeight:400}}> · WARRANTY REQUEST</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>

      <div style={{maxWidth:680,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'1rem 1.25rem',marginBottom:'1.5rem',fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.7}}>
          <strong style={{color:'#0a0a0a'}}>SpanglerBuilt 1-Year Workmanship Warranty</strong><br/>
          Your project is covered for 1 year from the completion date (Apr 22, 2026 — Apr 22, 2027). Use this form to submit any warranty-related issues. We'll respond within 2 business days.
        </div>

        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem'}}>
          <div style={{fontSize:14,fontWeight:500,color:'#0a0a0a',marginBottom:'1.25rem',fontFamily:'Poppins,sans-serif'}}>Submit a warranty request</div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Item or area *</div>
            <input value={form.area} onChange={e=>setF('area',e.target.value)}
              placeholder="e.g. Shower tile grout, LVP flooring, Cabinet door..."
              style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Description of issue *</div>
            <textarea value={form.desc} onChange={e=>setF('desc',e.target.value)}
              placeholder="Describe the issue in detail — what you're seeing, where it is, how long it's been happening..."
              style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',minHeight:100,resize:'vertical',background:'rgba(208,104,48,.1)'}}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Date first noticed</div>
              <input type="date" value={form.date} onChange={e=>setF('date',e.target.value)}
                style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
            </div>
            <div>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Photo upload</div>
              <div style={{padding:'9px 11px',border:'1px dashed #e8e6e0',borderRadius:3,fontSize:12,color:'rgba(255,255,255,.35)',textAlign:'center',background:'#1a1a1a',cursor:'pointer'}}>
                Tap to upload photos (coming soon)
              </div>
            </div>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Additional notes</div>
            <textarea value={form.notes} onChange={e=>setF('notes',e.target.value)}
              placeholder="Any other details that might help..."
              style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',minHeight:60,resize:'vertical',background:'rgba(208,104,48,.1)'}}/>
          </div>

          <button onClick={submit} disabled={!form.area.trim()||!form.desc.trim()} style={{
            background:'#D06830',color:'#fff',border:'none',padding:'12px 28px',
            fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',
            cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',
            opacity:!form.area.trim()||!form.desc.trim()?.5:1,
          }}>Submit warranty request →</button>
        </div>

        <div style={{marginTop:'1rem',fontSize:11,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · Warranty: Apr 22, 2026 – Apr 22, 2027 · (404) 492-7650
        </div>
      </div>
    </div>
  )
}
