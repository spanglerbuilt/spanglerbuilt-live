import { signIn, getSession } from 'next-auth/react'

export default function Login() {
  function handleGoogle() {
    signIn('google', { callbackUrl: '/auth/redirect' })
  }

  return (
    <div style={{minHeight:'100vh',background:'#002147',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(-45deg,transparent,transparent 60px,rgba(255,140,0,0.03) 60px,rgba(255,140,0,0.03) 61px)',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,background:'#fff',border:'3px solid #FF8C00',maxWidth:440,width:'100%',padding:'2.5rem',borderRadius:4}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1.75rem'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{width:200,height:'auto',marginBottom:'.75rem'}}/>
          <div style={{fontSize:11,color:'#002147',letterSpacing:'.14em',textTransform:'uppercase',fontWeight:500}}>Client and Project Portal</div>
        </div>

        <div style={{height:1,background:'#e8e6e0',marginBottom:'1.5rem'}}/>

        <p style={{fontSize:13,color:'#5f5e5a',textAlign:'center',marginBottom:'1.5rem',lineHeight:1.7}}>
          Sign in with your Google account to access your SpanglerBuilt project portal.
        </p>

        {/* Google Sign In - now real */}
        <button onClick={handleGoogle} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,background:'#002147',color:'#fff',padding:'14px 16px',fontSize:13,fontWeight:600,border:'none',borderRadius:3,cursor:'pointer',fontFamily:'sans-serif',letterSpacing:'.02em',marginBottom:'1rem'}}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{margin:'1rem 0',display:'flex',alignItems:'center',gap:10}}>
          <div style={{flex:1,height:1,background:'#e8e6e0'}}/>
          <span style={{fontSize:11,color:'#9a9690'}}>or quick access</span>
          <div style={{flex:1,height:1,background:'#e8e6e0'}}/>
        </div>

        {/* Quick access buttons */}
        <div style={{display:'flex',gap:8,marginBottom:'1.25rem'}}>
          <a href="/dashboard" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#002147',color:'#FF8C00',padding:'10px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase',border:'none'}}>
            Contractor
          </a>
          <a href="/client/dashboard" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,background:'#f5f4f1',color:'#002147',padding:'10px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase',border:'1px solid #e8e6e0'}}>
            Client
          </a>
        </div>

        <div style={{textAlign:'center'}}>
          <p style={{fontSize:10,color:'#9a9690',lineHeight:1.6}}>
            Contractors sign in with michael@spanglerbuilt.com<br/>
            Clients use the email on your project agreement<br/>
            <a href="tel:4044927650" style={{color:'#FF8C00',textDecoration:'none'}}>Questions? Call (404) 492-7650</a>
          </p>
        </div>
      </div>

      {/* Watermark */}
      <div style={{position:'relative',zIndex:1,marginTop:'1.5rem',textAlign:'center'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{width:70,height:'auto',opacity:.15,filter:'brightness(10)'}}/>
        <div style={{fontSize:10,color:'rgba(255,255,255,.3)',marginTop:4,letterSpacing:'.1em'}}>WE BUILD MORE THAN PROJECTS — WE BUILD LIFESTYLES</div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  var session = await getSession(context)
  if (session) {
    var dest = session.user.role === 'contractor' ? '/dashboard' : '/client/dashboard'
    return { redirect: { destination: dest, permanent: false } }
  }
  return { props: {} }
}
