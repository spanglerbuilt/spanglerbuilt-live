import { useState } from 'react'

var CONTRACTOR_EMAIL = 'michael@spanglerbuilt.com'
// Set NEXT_PUBLIC_CONTRACTOR_PASS in your Vercel / .env.local to require a password.
// If the variable is not set, email alone is enough to access the contractor dashboard.
var CONTRACTOR_PASS  = process.env.NEXT_PUBLIC_CONTRACTOR_PASS || ''

export default function Login() {
  var [email,    setEmail]    = useState('')
  var [password, setPassword] = useState('')
  var [error,    setError]    = useState('')
  var [loading,  setLoading]  = useState(false)

  var isContractor   = email.trim().toLowerCase() === CONTRACTOR_EMAIL.toLowerCase()
  var needsPassword  = isContractor && CONTRACTOR_PASS !== ''

  function handleLogin(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    var clean = email.trim().toLowerCase()

    if (clean === CONTRACTOR_EMAIL.toLowerCase()) {
      if (needsPassword && password !== CONTRACTOR_PASS) {
        setError('Incorrect password.')
        setLoading(false)
        return
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb_auth', JSON.stringify({ role:'contractor', email: clean, ts: Date.now() }))
      }
      window.location.href = '/dashboard'
    } else if (clean.includes('@') && clean.includes('.')) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb_auth', JSON.stringify({ role:'client', email: clean, ts: Date.now() }))
      }
      window.location.href = '/client/dashboard'
    } else {
      setError('Please enter a valid email address.')
      setLoading(false)
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
        <p style={{fontSize:13,color:'#5f5e5a',textAlign:'center',marginBottom:'1.5rem',lineHeight:1.7}}>
          Enter your email address to access your portal.
        </p>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={function(e){setEmail(e.target.value); setError('')}}
              placeholder="you@email.com"
              required
              style={{width:'100%',padding:'10px 12px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB',boxSizing:'border-box'}}
            />
          </div>

          {needsPassword && (
            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Password</label>
              <input
                type="password"
                value={password}
                onChange={function(e){setPassword(e.target.value); setError('')}}
                placeholder="Enter password"
                required
                autoFocus
                style={{width:'100%',padding:'10px 12px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB',boxSizing:'border-box'}}
              />
            </div>
          )}

          {error && <div style={{fontSize:12,color:'#c0392b',marginBottom:10,background:'#fdecea',padding:'8px 10px',borderRadius:3,border:'1px solid #f5c6cb'}}>{error}</div>}

          <button type="submit"
            disabled={loading || !email.trim() || (needsPassword && !password)}
            style={{width:'100%',background:'#FF8C00',color:'#fff',border:'none',padding:'12px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',opacity:(loading || !email.trim() || (isContractor && !password)) ? 0.5 : 1}}>
            {loading ? 'Loading...' : 'Access my portal →'}
          </button>
        </form>

        <p style={{fontSize:10,color:'#9a9690',textAlign:'center',lineHeight:1.9,margin:'1.5rem 0 0'}}>
          <strong style={{color:'#002147'}}>Clients:</strong> enter the email address on your project agreement.<br/>
          <strong style={{color:'#002147'}}>SpanglerBuilt team:</strong> use michael@spanglerbuilt.com<br/>
          <a href="tel:4044927650" style={{color:'#FF8C00',textDecoration:'none'}}>Need help? (404) 492-7650</a>
        </p>
      </div>
      <div style={{marginTop:'1.5rem',textAlign:'center'}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,.25)',letterSpacing:'.1em'}}>WE BUILD MORE THAN PROJECTS — WE BUILD LIFESTYLES</div>
      </div>
    </div>
  )
}
export async function getServerSideProps() { return { props: {} } }
