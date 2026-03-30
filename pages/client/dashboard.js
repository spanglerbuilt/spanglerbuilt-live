import { useSession, signOut } from 'next-auth/react'

var PHASES = ['Pre-construction','Demo & framing','Drywall & rough-ins','Paint & flooring','Closeout']
var NAV = [
  {href:'/client/estimate',   label:'Estimate',       icon:'$', desc:'View and select your tier',       alert:true,  alertMsg:'Action needed'},
  {href:'/client/scope',      label:'Scope of work',  icon:'◻', desc:'What is included phase by phase',  alert:false},
  {href:'/client/selections', label:'My selections',  icon:'✓', desc:'Choose your materials',            alert:true,  alertMsg:'10 pending'},
  {href:'/client/documents',  label:'Documents',      icon:'✦', desc:'Contract, proposals, sign',        alert:true,  alertMsg:'1 to sign'},
  {href:'/client/photos',     label:'Progress photos',icon:'◉', desc:'Latest site photos',               alert:false},
  {href:'/client/punch-list', label:'Punch list',     icon:'☑', desc:'Submit items and track status',    alert:false},
  {href:'/client/warranty',   label:'Warranty',       icon:'◈', desc:'Submit a warranty request',        alert:false},
  {href:'/client/messages',   label:'Messages',       icon:'✉', desc:'Chat with SpanglerBuilt',          alert:true,  alertMsg:'2 unread'},
]

export default function ClientDashboard() {
  var { data: session } = useSession()
  var phaseNum = 1
  var totalPhases = 5
  var phasePct = Math.round((phaseNum / totalPhases) * 100)

  var clientName = session ? session.user.name : 'Ryan and Dori Mendel'

  return (
    <div style={{minHeight:'100vh',background:'#f5f4f1',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:32,width:'auto'}}/>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>{clientName}</span>
          {session
            ? <button onClick={function(){signOut({callbackUrl:'/login'})}} style={{fontSize:11,color:'#FF8C00',background:'transparent',border:'1px solid #FF8C00',padding:'3px 10px',borderRadius:3,cursor:'pointer',fontFamily:'sans-serif'}}>Sign out</button>
            : <a href="/login" style={{fontSize:11,color:'#FF8C00',textDecoration:'none',border:'1px solid #FF8C00',padding:'3px 10px',borderRadius:3}}>Sign in</a>
          }
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.5rem'}}>
        <div style={{background:'#002147',borderRadius:4,padding:'1.25rem 1.5rem',marginBottom:'1.25rem',borderLeft:'4px solid #FF8C00'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8}}>
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:20,color:'#fff',marginBottom:4}}>Welcome, {clientName}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)',marginBottom:2}}>SB-2026-001 · Basement Renovation</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>4995 Shadow Glen Ct, Dunwoody GA 30338</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:9,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>Est. completion</div>
              <div style={{fontSize:13,color:'#FF8C00',fontWeight:500}}>Apr 22, 2026</div>
            </div>
          </div>
          <div style={{marginTop:'1rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em'}}>Project progress</div>
              <div style={{fontSize:10,color:'#FF8C00',fontWeight:500}}>{phasePct}%</div>
            </div>
            <div style={{height:6,background:'rgba(255,255,255,.1)',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:6,width:phasePct+'%',background:'#FF8C00',borderRadius:3}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
              {PHASES.map(function(ph,i){return (
                <div key={ph} style={{fontSize:9,color:i<=phaseNum?'rgba(255,255,255,.8)':'rgba(255,255,255,.3)',fontWeight:i===phaseNum?700:400,textAlign:'center',flex:1}}>
                  {i<phaseNum?'✓ ':i===phaseNum?'● ':''}{ph}
                </div>
              )})}
            </div>
          </div>
        </div>

        <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'1rem 1.25rem',marginBottom:'1.25rem'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#002147',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Action required</div>
          <div style={{fontSize:13,color:'#3d3b37',lineHeight:1.9}}>
            · <a href="/client/estimate" style={{color:'#FF8C00',fontWeight:500}}>Select your project tier</a> — Good, Better, Best, or Luxury.<br/>
            · <a href="/client/selections" style={{color:'#FF8C00',fontWeight:500}}>10 material selections</a> are waiting for your input.<br/>
            · <a href="/client/documents" style={{color:'#FF8C00',fontWeight:500}}>1 document</a> ready for your review and signature.
          </div>
        </div>

        <div style={{fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.75rem'}}>Your project portal</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10,marginBottom:'1.5rem'}}>
          {NAV.map(function(item){return (
            <a key={item.href} href={item.href} style={{display:'flex',gap:12,alignItems:'center',padding:'1rem 1.25rem',background:'#fff',border:item.alert?'1px solid #FF8C00':'1px solid #e8e6e0',borderRadius:4,textDecoration:'none',borderLeft:'4px solid '+(item.alert?'#FF8C00':'#002147')}}>
              <div style={{width:36,height:36,background:'#002147',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'#FF8C00',flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:500,color:'#002147',marginBottom:2}}>{item.label}</div>
                <div style={{fontSize:11,color:'#9a9690'}}>{item.desc}</div>
              </div>
              {item.alert && <span style={{background:'#FF8C00',color:'#fff',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,flexShrink:0,whiteSpace:'nowrap'}}>{item.alertMsg}</span>}
            </a>
          )})}
        </div>

        <div style={{background:'#002147',borderRadius:4,padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.6)',marginBottom:2}}>Questions? Contact Michael directly</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>SpanglerBuilt Inc. · app.spanglerbuilt.com</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <a href="tel:4044927650" style={{background:'#FF8C00',color:'#fff',padding:'8px 16px',fontSize:12,fontWeight:700,textDecoration:'none',borderRadius:3}}>(404) 492-7650</a>
            <a href="mailto:michael@spanglerbuilt.com" style={{background:'transparent',border:'1px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.7)',padding:'8px 16px',fontSize:12,textDecoration:'none',borderRadius:3}}>Email</a>
          </div>
        </div>
      </div>
    </div>
  )
}
