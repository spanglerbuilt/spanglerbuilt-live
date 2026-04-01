export default function PhotosPage() {
  const photos = [
    { id:1, phase:'Framing',       caption:'Perimeter walls framed — main living area',  date:'Mar 25',  src:null },
    { id:2, phase:'Framing',       caption:'Bathroom rough framing complete',             date:'Mar 25',  src:null },
    { id:3, phase:'Framing',       caption:'Bar area framing — cabinet backing installed',date:'Mar 24',  src:null },
    { id:4, phase:'Demo',          caption:'Demo complete — slab prepped and ground',     date:'Mar 18',  src:null },
    { id:5, phase:'Demo',          caption:'Moisture barrier installed — east wall',      date:'Mar 17',  src:null },
    { id:6, phase:'Pre-construction',caption:'Pre-demo conditions documented',           date:'Mar 10',  src:null },
  ]
  const phases = [...new Set(photos.map(p=>p.phase))]
  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}> · PROGRESS PHOTOS</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>
      <div style={{maxWidth:900,margin:'0 auto',padding:'1.5rem'}}>
        <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'#3d3b37'}}>
          <strong style={{color:'#002147'}}>6 photos</strong> · Michael uploads new photos after each phase milestone. You'll be notified by message when new photos are added.
        </div>
        {phases.map(phase=>(
          <div key={phase} style={{marginBottom:'1.5rem'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.75rem',display:'flex',alignItems:'center',gap:8}}>
              <span style={{background:'#002147',color:'#FF8C00',padding:'2px 10px',borderRadius:3}}>{phase}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>
              {photos.filter(p=>p.phase===phase).map(photo=>(
                <div key={photo.id} style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',cursor:'pointer'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#FF8C00'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8e6e0'}}>
                  <div style={{height:140,background:'#f5f4f1',display:'flex',alignItems:'center',justifyContent:'center',borderBottom:'1px solid #e8e6e0'}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontSize:24,color:'#002147',marginBottom:4}}>◉</div>
                      <div style={{fontSize:10,color:'#9a9690'}}>Photo {photo.id}</div>
                    </div>
                  </div>
                  <div style={{padding:'8px 10px'}}>
                    <div style={{fontSize:11,fontWeight:500,color:'#002147',marginBottom:2}}>{photo.caption}</div>
                    <div style={{fontSize:10,color:'#9a9690'}}>{photo.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{marginTop:'1rem',fontSize:11,color:'#9a9690',textAlign:'center'}}>
          Photos are added by SpanglerBuilt after each project milestone · (404) 492-7650
        </div>
      </div>
    </div>
  )
}
