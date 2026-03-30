import { getSession } from 'next-auth/react'

export default function Redirect() {
  return (
    <div style={{minHeight:'100vh',background:'#002147',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{width:120,height:'auto',marginBottom:'1rem'}}/>
        <div style={{color:'#FF8C00',fontSize:13,letterSpacing:'.1em'}}>Loading your portal...</div>
      </div>
    </div>
  )
}

export async function getServerSideProps(context) {
  var session = await getSession(context)

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  // Route based on role
  var destination = session.user.email === 'michael@spanglerbuilt.com'
    ? '/dashboard'
    : '/client/dashboard'

  return { redirect: { destination, permanent: false } }
}
