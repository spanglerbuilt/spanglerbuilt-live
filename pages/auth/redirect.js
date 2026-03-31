export default function Redirect() {
  return (
    <div style={{minHeight:'100vh',background:'#002147',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{width:120,height:'auto',marginBottom:'1rem'}}/>
        <div style={{color:'#FF8C00',fontSize:13}}>Loading your portal...</div>
      </div>
    </div>
  )
}
export async function getServerSideProps() {
  return { redirect: { destination: '/dashboard', permanent: false } }
}
