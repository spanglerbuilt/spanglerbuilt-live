export default function Login() {
  return (
    <div style={{minHeight:"100vh",background:"#002147",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:"sans-serif"}}>
      <div style={{background:"#fff",border:"3px solid #FF8C00",maxWidth:420,width:"100%",padding:"2.5rem",borderRadius:4}}>
        <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{width:190,height:"auto",marginBottom:".75rem"}}/>
          <div style={{fontSize:11,color:"#002147",letterSpacing:".14em",textTransform:"uppercase",fontWeight:500}}>Client and Project Portal</div>
        </div>
        <div style={{height:1,background:"#e8e6e0",marginBottom:"1.5rem"}}/>
        <p style={{fontSize:13,color:"#5f5e5a",textAlign:"center",marginBottom:"1.5rem",lineHeight:1.7}}>Sign in with your Google account to access your SpanglerBuilt project portal.</p>
        <a href="/api/auth/signin/google" style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:"#002147",color:"#fff",padding:"14px 16px",fontSize:13,fontWeight:600,textDecoration:"none",borderRadius:3,marginBottom:"1rem"}}>Continue with Google</a>
        <div style={{margin:"1rem 0",display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:1,background:"#e8e6e0"}}/>
          <span style={{fontSize:11,color:"#9a9690"}}>or quick access</span>
          <div style={{flex:1,height:1,background:"#e8e6e0"}}/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:"1.5rem"}}>
          <a href="/dashboard" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#002147",color:"#FF8C00",padding:"10px",fontSize:11,fontWeight:700,textDecoration:"none",borderRadius:3,letterSpacing:".06em",textTransform:"uppercase"}}>Contractor</a>
          <a href="/client/dashboard" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f4f1",color:"#002147",padding:"10px",fontSize:11,fontWeight:700,textDecoration:"none",borderRadius:3,letterSpacing:".06em",textTransform:"uppercase",border:"1px solid #e8e6e0"}}>Client</a>
        </div>
        <p style={{fontSize:10,color:"#9a9690",textAlign:"center",lineHeight:1.8,margin:0}}>Contractors: michael@spanglerbuilt.com | Clients: use your project email</p>
      </div>
    </div>
  )
}
export async function getServerSideProps() { return { props: {} } }
