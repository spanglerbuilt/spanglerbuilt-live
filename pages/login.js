import { useState } from 'react'

var CONTRACTOR_EMAIL = 'michael@spanglerbuilt.com'
var CONTRACTOR_PASS  = process.env.NEXT_PUBLIC_CONTRACTOR_PASS || ''

export default function Login() {
  var [email,    setEmail]    = useState('')
  var [password, setPassword] = useState('')
  var [error,    setError]    = useState('')
  var [loading,  setLoading]  = useState(false)

  var isContractor  = email.trim().toLowerCase() === CONTRACTOR_EMAIL.toLowerCase()
  var needsPassword = isContractor && CONTRACTOR_PASS !== ''

  function handleLogin(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    var clean = email.trim().toLowerCase()

    if (clean === CONTRACTOR_EMAIL.toLowerCase()) {
      if (needsPassword && password !== CONTRACTOR_PASS) {
        setError('Incorrect password.'); setLoading(false); return
      }
      if (typeof window !== 'undefined') localStorage.setItem('sb_auth', JSON.stringify({ role:'contractor', email:clean, ts:Date.now() }))
      window.location.href = '/dashboard'
    } else if (clean.includes('@') && clean.includes('.')) {
      fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: clean }),
      })
        .then(function(r) { return r.json().then(function(d) { return { ok: r.ok, data: d } }) })
        .then(function(res) {
          if (!res.ok) {
            setError('No project found for this email. Contact michael@spanglerbuilt.com or call (404) 492-7650.')
            setLoading(false)
            return
          }
          if (typeof window !== 'undefined') {
            localStorage.setItem('sb_auth', JSON.stringify({ role:'client', email:clean, project:res.data.project, ts:Date.now() }))
          }
          window.location.href = '/client/dashboard'
        })
        .catch(function() {
          setError('Unable to connect. Please try again.')
          setLoading(false)
        })
    } else {
      setError('Please enter a valid email address.'); setLoading(false)
    }
  }

  var inp = {
    width:'100%', padding:'11px 14px',
    border:'1px solid rgba(255,255,255,.12)', borderRadius:4,
    fontSize:14, background:'#1a1a1a', color:'rgba(255,255,255,.85)',
    outline:'none', boxSizing:'border-box',
  }

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1rem'}}>
      <div style={{
        background:'#161616', border:'1px solid rgba(255,255,255,.1)',
        borderTop:'3px solid #D06830', maxWidth:400, width:'100%',
        padding:'2.5rem', borderRadius:6,
      }}>
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{width:180, height:'auto', marginBottom:'1rem'}}/>
          <div style={{fontSize:11, color:'rgba(255,255,255,.4)', letterSpacing:'.14em', textTransform:'uppercase'}}>Client &amp; Project Portal</div>
          <p style={{fontSize:13, color:'rgba(255,255,255,.7)', fontWeight:500, marginTop:10, lineHeight:1.5}}>We don't just build projects — we build lifestyles.</p>
          <p style={{fontSize:11, color:'rgba(255,255,255,.35)', fontStyle:'italic', marginTop:4}}>Delivering precision, quality, and lasting value.</p>
        </div>

        <div style={{height:1, background:'rgba(255,255,255,.07)', marginBottom:'1.75rem'}}/>

        <p style={{fontSize:13, color:'rgba(255,255,255,.45)', textAlign:'center', marginBottom:'1.5rem', lineHeight:1.7}}>
          Enter the email address on your project agreement to access your portal.
        </p>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:12}}>
            <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>Email address</label>
            <input type="email" value={email} onChange={function(e){setEmail(e.target.value);setError('')}} placeholder="you@email.com" required style={inp}/>
          </div>

          {needsPassword && (
            <div style={{marginBottom:12}}>
              <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6}}>Password</label>
              <input type="password" value={password} onChange={function(e){setPassword(e.target.value);setError('')}} placeholder="Enter password" required autoFocus style={inp}/>
            </div>
          )}

          {error && (
            <div style={{fontSize:12, color:'#e57373', background:'rgba(192,57,43,.15)', border:'1px solid rgba(192,57,43,.3)', padding:'8px 12px', borderRadius:4, marginBottom:12}}>
              {error}
            </div>
          )}

          <button type="submit"
            disabled={loading || !email.trim() || (needsPassword && !password)}
            style={{
              width:'100%', background:'#D06830', color:'#fff', border:'none',
              padding:'13px', fontSize:13, fontWeight:700, letterSpacing:'.08em',
              textTransform:'uppercase', cursor:'pointer', borderRadius:4,
              opacity:(loading || !email.trim()) ? 0.5 : 1,
            }}>
            {loading ? 'Loading…' : 'Access My Portal →'}
          </button>
        </form>

        <p style={{fontSize:11, color:'rgba(255,255,255,.3)', textAlign:'center', lineHeight:2, marginTop:'1.5rem'}}>
          <strong style={{color:'rgba(255,255,255,.5)'}}>Clients:</strong> use the email on your project agreement.<br/>
          <strong style={{color:'rgba(255,255,255,.5)'}}>SpanglerBuilt team:</strong> michael@spanglerbuilt.com<br/>
          44 Milton Ave, Alpharetta GA 30009<br/>
          <a href="tel:4044927650" style={{color:'#D06830'}}>Need help? (404) 492-7650</a>
        </p>
      </div>

      <div style={{marginTop:'1.5rem', fontSize:10, color:'rgba(255,255,255,.15)', letterSpacing:'.1em', textAlign:'center'}}>
        WE BUILD MORE THAN PROJECTS — WE BUILD LIFESTYLES
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
