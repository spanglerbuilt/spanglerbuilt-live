import { useState } from 'react'

const INIT_DOCS = [
  { id:1, type:'Contract',      title:'Basement Renovation Contract — Mendel', status:'pending', date:'Mar 15, 2026', size:'2 pages', action:'Sign now',
    content:'This construction contract is entered into between SpanglerBuilt Inc. ("Contractor") and Ryan & Dori Mendel ("Client") for the renovation of 4995 Shadow Glen Ct, Dunwoody GA 30338.\n\nScope: Full basement renovation per the attached scope of work.\nContract amount: $55,394 (Better tier)\nStart date: April 28, 2026\nCompletion: June 20, 2026\n\nPayment schedule: 5-milestone plan as detailed in the attached exhibit.\n\nChanges to scope require a written change order signed by both parties.\n\nSpanglerBuilt Inc. warrants all workmanship for one (1) year from project completion.\n\nBy signing below, Client confirms acceptance of all terms.' },
  { id:2, type:'Proposal',      title:'Good / Better / Best / Luxury Estimate', status:'ready', date:'Mar 14, 2026', size:'4 pages', action:'View',
    content:'PROJECT: Mendel Basement Renovation · SB-2026-001\nADDRESS: 4995 Shadow Glen Ct, Dunwoody GA 30338\n\nGOOD TIER — $53,000\nLVP flooring, ceramic tile bath, stock cabinets, brushed nickel fixtures.\n\nBETTER TIER — $62,500 ✓ SELECTED\nCOREtec LVP, porcelain tile, KraftMaid semi-custom, Delta matte black fixtures.\n\nBEST TIER — $73,000\nEngineered hardwood, large-format porcelain, Dura Supreme inset, Brizo fixtures.\n\nLUXURY TIER — $87,500\nEuropean oak, natural marble, full-custom cabinets, Waterworks fixtures.\n\nAll tiers include: permits, demo, framing, MEP rough-ins, drywall, paint, and cleanup.' },
  { id:3, type:'Scope of Work', title:'Project Scope — SB-2026-001',       status:'ready',   date:'Mar 14, 2026', size:'3 pages', action:'View',
    content:'PROJECT SCOPE — SB-2026-001 · MENDEL BASEMENT\n\nPHASE 1 — PRE-CONSTRUCTION (Apr 14–28)\n✓ Site visit and final measurements\n✓ Permit application submitted\n✓ Material selections finalized\n✓ Subcontractor schedule confirmed\n\nPHASE 2 — DEMO AND FRAMING (Apr 28 – May 12)\n• Existing finishes demolished and removed\n• Concrete floor prepped and leveled\n• Moisture barrier installed\n• Perimeter and interior walls framed\n\nPHASE 3 — ROUGH MECHANICALS (May 12–28)\n• Bathroom DWV rough-in\n• Electrical — 20 LED recessed lights\n• HVAC extension — 2 registers\n\nPHASE 4 — DRYWALL AND FINISHES (May 28 – Jun 10)\n• Drywall level 4 finish\n• COREtec LVP flooring\n• Porcelain tile — bath\n\nPHASE 5 — CLOSEOUT (Jun 10–20)\n• All fixtures and trim\n• Final walkthrough and punch list' },
  { id:4, type:'Change Order',  title:'CO-001 — Egress window upgrade',    status:'pending', date:'Mar 20, 2026', size:'1 page',  action:'Review',
    content:'CHANGE ORDER #001\nProject: SB-2026-001 · Mendel Basement\nDate: March 20, 2026\n\nDescription of change:\nUpgrade standard window opening to code-compliant egress window (min. 5.7 sf net clear opening) per DeKalb County building requirements.\n\nReason: Permit review identified egress requirement for habitable basement space with planned sleeping area.\n\nOriginal contract: $55,394\nThis change order: +$2,850\nRevised contract total: $58,244\n\nScope of change:\n• Concrete cutting and removal for larger opening\n• Buck framing and waterproofing\n• Egress window unit (Anderson 400 series)\n• Interior and exterior finish\n\nThis change order must be signed before work begins.' },
]

const STATUS = {
  pending: {bg:'#fff3e0', color:'#e65100', label:'Action needed'},
  ready:   {bg:'#eaf3de', color:'#3B6D11', label:'Ready to view'},
  signed:  {bg:'#e6f1fb', color:'#185FA5', label:'Signed'},
  approved:{bg:'#eaf3de', color:'#3B6D11', label:'Approved'},
}

export default function DocumentsPage() {
  const [docs,      setDocs]      = useState(INIT_DOCS)
  const [viewing,   setViewing]   = useState(null)
  const [signing,   setSigning]   = useState(false)
  const [signed,    setSigned]    = useState(false)

  function openDoc(doc) {
    setViewing(doc)
    setSigning(false)
    setSigned(false)
  }

  function confirmSign() {
    setSigned(true)
    setDocs(docs.map(d => d.id === viewing.id ? {...d, status:'signed', action:'View'} : d))
    setTimeout(function(){
      setSigning(false)
      setSigned(false)
      setViewing(null)
    }, 1800)
  }

  function approveChangeOrder() {
    setDocs(docs.map(d => d.id === viewing.id ? {...d, status:'approved', action:'View'} : d))
    setViewing(null)
  }

  const pendingCount = docs.filter(d => d.status === 'pending').length

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>

      {/* Document viewer modal */}
      {viewing && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,33,71,.85)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:'#fff',borderRadius:4,maxWidth:580,width:'100%',border:'3px solid #FF8C00',overflow:'hidden',display:'flex',flexDirection:'column',maxHeight:'90vh'}}>
            <div style={{background:'#002147',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #FF8C00',flexShrink:0}}>
              <div>
                <div style={{color:'#FF8C00',fontSize:13,fontWeight:700}}>{viewing.title}</div>
                <div style={{color:'rgba(255,255,255,.4)',fontSize:10,marginTop:2}}>{viewing.type} · {viewing.date}</div>
              </div>
              <button onClick={()=>setViewing(null)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer',flexShrink:0}}>✕</button>
            </div>
            <div style={{padding:'1.5rem',overflowY:'auto',flex:1}}>
              <pre style={{fontFamily:'sans-serif',fontSize:12,lineHeight:1.8,color:'#3d3b37',whiteSpace:'pre-wrap',margin:0}}>
                {viewing.content}
              </pre>
            </div>
            <div style={{padding:'1rem 1.5rem',borderTop:'1px solid #e8e6e0',flexShrink:0}}>
              {viewing.action === 'Sign now' && !signing && (
                <button onClick={()=>setSigning(true)} style={{width:'100%',background:'#FF8C00',color:'#fff',border:'none',padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.08em',textTransform:'uppercase'}}>
                  Sign this document →
                </button>
              )}
              {viewing.action === 'Sign now' && signing && !signed && (
                <div>
                  <div style={{fontSize:11,color:'#5f5e5a',marginBottom:10,lineHeight:1.6}}>
                    By clicking below you confirm your electronic signature and agreement to all terms in this document.
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button onClick={confirmSign} style={{flex:1,background:'#002147',color:'#FF8C00',border:'none',padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                      ✓ Confirm and sign
                    </button>
                    <button onClick={()=>setSigning(false)} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'10px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {signed && (
                <div style={{background:'#eaf3de',borderRadius:3,padding:'10px 14px',textAlign:'center',fontSize:12,color:'#3B6D11',fontWeight:500}}>
                  ✓ Document signed successfully
                </div>
              )}
              {viewing.action === 'Review' && viewing.status === 'pending' && (
                <div style={{display:'flex',gap:8}}>
                  <button onClick={approveChangeOrder} style={{flex:1,background:'#3B6D11',color:'#fff',border:'none',padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                    ✓ Approve change order
                  </button>
                  <button onClick={()=>setViewing(null)} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'10px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                    Close
                  </button>
                </div>
              )}
              {(viewing.action === 'View' || viewing.status === 'signed' || viewing.status === 'approved') && viewing.action !== 'Sign now' && viewing.action !== 'Review' && (
                <button onClick={()=>setViewing(null)} style={{width:'100%',background:'#f5f4f1',color:'#002147',border:'1px solid #e8e6e0',padding:'10px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}> · DOCUMENTS</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'1.5rem'}}>
        {pendingCount > 0 && (
          <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'#3d3b37'}}>
            <strong style={{color:'#002147'}}>{pendingCount} document{pendingCount>1?'s':''} need your attention</strong> — review and sign to keep your project moving.
          </div>
        )}
        <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden'}}>
          <div style={{background:'#002147',padding:'8px 1rem',display:'grid',gridTemplateColumns:'80px 1fr 100px 80px 90px',gap:10,fontSize:10,fontWeight:500,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.06em'}}>
            <span>Type</span><span>Document</span><span>Status</span><span>Date</span><span></span>
          </div>
          {docs.map((doc,i)=>{
            const sc = STATUS[doc.status] || STATUS.ready
            const action = doc.status === 'signed' ? 'View' : doc.status === 'approved' ? 'View' : doc.action
            return (
              <div key={doc.id} style={{display:'grid',gridTemplateColumns:'80px 1fr 100px 80px 90px',gap:10,padding:'12px 1rem',borderTop:i===0?'none':'1px solid #f5f4f1',alignItems:'center',fontSize:12,cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.background='#FFFCEB'}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <span style={{fontSize:9,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.06em',background:'#e6f1fb',padding:'2px 6px',borderRadius:3,textAlign:'center'}}>{doc.type}</span>
                <div onClick={()=>openDoc(doc)}>
                  <div style={{fontWeight:500,color:'#002147',marginBottom:2}}>{doc.title}</div>
                  <div style={{fontSize:10,color:'#9a9690'}}>{doc.size}</div>
                </div>
                <span><span style={{background:sc.bg,color:sc.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3}}>{sc.label}</span></span>
                <span style={{color:'#9a9690',fontSize:11}}>{doc.date}</span>
                <button onClick={()=>openDoc(doc)} style={{background:doc.status==='pending'?'#FF8C00':'#002147',color:'#fff',border:'none',padding:'5px 12px',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                  {action}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{marginTop:'1rem',fontSize:11,color:'#9a9690',textAlign:'center'}}>
          Questions about any document? Call Michael at (404) 492-7650
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
