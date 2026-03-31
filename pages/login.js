export default function Login() {
  function go(e) {
    e.preventDefault()
    var email = document.getElementById('sb-email').value.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      document.getElementById('sb-err').innerText = 'Please enter a valid email.'
      return
    }
    if (email === 'michael@spanglerbuilt.com') {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/client/dashboard'
    }
  }
  return (
    <div style={{minHeight:'100vh',background:'#002147',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1rem',fontFamily:'sans-serif'}}>
      <div style={{background:'#fff',border:'3px solid #FF8C00',maxWidth:420,width:'100%',padding:'2.5rem',borderRadius:4}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{width:190,height:'auto',marginBottom:'.75rem'}}/>
          <div style={{fontSize:11,color:'#002147',letterSpacing:'.14em',textTransform:'uppercase',fontWeight:500}}>Client and Project Portal</div>
        </div>
        <div style={{height:1,background:'#e8e6e0',marginBottom:'1.5rem'}}/>
        <p style={{fontSize:13,color:'#5f5e5a',textAlign:'center',marginBottom:'1.5rem',lineHeight:1.7}}>Enter your email to access your portal.</p>
        <form onSubmit={go}>
          <label style={{display:'block',fontSize:10,fontWeight:500,color:'#002147',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Email address</label>
          <input id="sb-email" type="email" placeholder="you@email.com" required style={{width:'100%',padding:'12px',border:'2px solid #002147',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB',boxSizing:'border-box',marginBottom:8,color:'#002147'}}/>
          <div id="sb-err" style={{fontSize:11,color:'#c0392b',marginBottom:8}}></div>
          <button type="submit" style={{width:'100%',background:'#FF8C00',color:'#fff',border:'none',padding:'13px',fontSize:13,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',marginBottom:'1rem'}}>Access my portal →</button>
        </form>
        <div style={{margin:'1rem 0',display:'flex',alignItems:'center',gap:10}}>
          <div style={{flex:1,height:1,background:'#e8e6e0'}}/>
          <span style={{fontSize:11,color:'#9a9690'}}>or quick access</span>
          <div style={{flex:1,height:1,background:'#e8e6e0'}}/>
        </div>
        <div style={{display:'flex',gap:8,marginBottom:'1.25rem'}}>
          <a href="/dashboard" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'#002147',color:'#FF8C00',padding:'10px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase'}}>Contractor</a>
          <a href="/client/dashboard" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f4f1',color:'#002147',padding:'10px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase',border:'1px solid #e8e6e0'}}>Client</a>
        </div>
        <p style={{fontSize:10,color:'#9a9690',textAlign:'center',lineHeight:1.8,margin:0}}>
          Contractors: michael@spanglerbuilt.com<br/>
          Clients: use your project email<br/>
          <a href="tel:4044927650" style={{color:'#FF8C00',textDecoration:'none'}}>Questions? (404) 492-7650</a>
        </p>
      </div>
      <div style={{marginTop:'1.5rem',textAlign:'center'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',letterSpacing:'.1em'}}>WE BUILD MORE THAN PROJECTS — WE BUILD LIFESTYLES</div>
      </div>
    </div>
  )
}
export async function getServerSideProps() { return { props: {} } }
