export default function DocumentsPage() {
  const docs = [
    { id:1, type:'Contract',         title:'Basement Renovation Contract — Mendel', status:'pending', date:'Mar 15, 2026', size:'2 pages', action:'Sign now' },
    { id:2, type:'Proposal',         title:'Good/Better/Best/Luxury Estimate', status:'ready',   date:'Mar 14, 2026', size:'4 pages', action:'View' },
    { id:3, type:'Scope of Work',    title:'Project Scope — SB-2026-001',  status:'ready',   date:'Mar 14, 2026', size:'3 pages', action:'View' },
    { id:4, type:'Change Order',     title:'CO-001 — Egress window upgrade',   status:'pending', date:'Mar 20, 2026', size:'1 page',  action:'Review' },
  ]
  const STATUS = {
    pending: {bg:'#fff3e0',color:'#e65100',label:'Action needed'},
    ready:   {bg:'#eaf3de',color:'#3B6D11',label:'Ready to view'},
    signed:  {bg:'#e6f1fb',color:'#185FA5',label:'Signed'},
  }
  return (
    <div style={{minHeight:'100vh',background:'#f5f4f1',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}> · DOCUMENTS</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>
      <div style={{maxWidth:800,margin:'0 auto',padding:'1.5rem'}}>
        <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'#3d3b37'}}>
          <strong style={{color:'#002147'}}>2 documents need your attention</strong> — your contract is ready for signature and a change order is pending your review.
        </div>
        <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden'}}>
          <div style={{background:'#002147',padding:'8px 1rem',display:'grid',gridTemplateColumns:'80px 1fr 100px 80px 90px',gap:10,fontSize:10,fontWeight:500,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.06em'}}>
            <span>Type</span><span>Document</span><span>Status</span><span>Date</span><span></span>
          </div>
          {docs.map((doc,i)=>{
            const sc = STATUS[doc.status]
            return (
              <div key={doc.id} style={{display:'grid',gridTemplateColumns:'80px 1fr 100px 80px 90px',gap:10,padding:'12px 1rem',borderTop:i===0?'none':'1px solid #f5f4f1',alignItems:'center',fontSize:12}}
                onMouseEnter={e=>e.currentTarget.style.background='#FFFCEB'}
                onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                <span style={{fontSize:9,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.06em',background:'#e6f1fb',padding:'2px 6px',borderRadius:3,textAlign:'center'}}>{doc.type}</span>
                <div>
                  <div style={{fontWeight:500,color:'#002147',marginBottom:2}}>{doc.title}</div>
                  <div style={{fontSize:10,color:'#9a9690'}}>{doc.size}</div>
                </div>
                <span><span style={{background:sc.bg,color:sc.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3}}>{sc.label}</span></span>
                <span style={{color:'#9a9690',fontSize:11}}>{doc.date}</span>
                <button style={{background:doc.status==='pending'?'#FF8C00':'#002147',color:'#fff',border:'none',padding:'5px 12px',fontSize:10,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                  {doc.action}
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
