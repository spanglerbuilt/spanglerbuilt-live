import { useEffect, useState } from 'react'
import MarketingNav from './_nav'

export default function MarketingCampaigns() {
  var [auth, setAuth] = useState(null)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
      setAuth(a)
    } catch(e) { window.location.href = '/login' }
  }, [])

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      <MarketingNav />
      <div style={{maxWidth:960, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Email campaigns</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.5rem'}}>Compose and send branded emails to your lead list.</div>

        {/* HubSpot connect banner */}
        <div style={{background:'rgba(255,122,0,.06)', border:'1px solid rgba(255,122,0,.2)', borderRadius:4, padding:'1.25rem 1.5rem', marginBottom:'1.5rem'}}>
          <div style={{fontSize:13, fontWeight:700, color:'rgba(255,165,0,.85)', marginBottom:6}}>Connect HubSpot to unlock campaigns</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.7, marginBottom:12}}>
            Once connected, you can send email blasts, set up drip sequences, and track opens & clicks — all synced with your SpanglerBuilt lead pipeline.
          </div>
          <a href="/marketing/channels" style={{display:'inline-block', background:'#D06830', color:'#fff', fontSize:12, fontWeight:700, padding:'8px 18px', borderRadius:3, textDecoration:'none'}}>
            Connect HubSpot →
          </a>
        </div>

        {/* Compose with Resend */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Send a one-off branded email</div>
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1.5rem'}}>
          <ComposeBranded />
        </div>

      </div>
    </div>
  )
}

function ComposeBranded() {
  var [to,      setTo]      = useState('')
  var [subject, setSubject] = useState('')
  var [body,    setBody]    = useState('')
  var [status,  setStatus]  = useState('')
  var [loading, setLoading] = useState(false)

  var inp = { width:'100%', padding:'10px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box' }

  function handleSend(e) {
    e.preventDefault()
    setLoading(true); setStatus('')
    fetch('/api/marketing/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    })
      .then(function(r) { return r.json() })
      .then(function(d) {
        setLoading(false)
        if (d.ok) { setStatus('Sent!'); setTo(''); setSubject(''); setBody('') }
        else setStatus('Error: ' + (d.error || 'Unknown'))
      })
      .catch(function() { setLoading(false); setStatus('Failed to send.') })
  }

  return (
    <form onSubmit={handleSend}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
        <div>
          <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>To</label>
          <input type="email" value={to} onChange={function(e){setTo(e.target.value)}} placeholder="client@example.com" required style={inp}/>
        </div>
        <div>
          <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Subject</label>
          <input type="text" value={subject} onChange={function(e){setSubject(e.target.value)}} placeholder="Subject line" required style={inp}/>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Message</label>
        <textarea value={body} onChange={function(e){setBody(e.target.value)}} placeholder="Write your message here. It will be sent using the SpanglerBuilt branded email template." required rows={6} style={Object.assign({},inp,{resize:'vertical',lineHeight:1.7})}/>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button type="submit" disabled={loading} style={{background:'#D06830', color:'#fff', border:'none', padding:'10px 24px', fontSize:13, fontWeight:700, borderRadius:4, cursor:'pointer', opacity:loading?.6:1}}>
          {loading ? 'Sending…' : 'Send branded email'}
        </button>
        {status && <span style={{fontSize:12, color: status.startsWith('Error') ? '#e57373' : '#22c55e'}}>{status}</span>}
      </div>
    </form>
  )
}

export async function getServerSideProps() { return { props: {} } }
