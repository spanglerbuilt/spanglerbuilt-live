import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

export default function MarketingChannels() {
  var [hubspotKey, setHubspotKey] = useState('')
  var [saving,     setSaving]     = useState(false)
  var [saved,      setSaved]      = useState(false)
  var [connected,  setConnected]  = useState(false)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }

    // Check if HubSpot is already configured
    fetch('/api/marketing/hubspot-status')
      .then(function(r) { return r.json() })
      .then(function(d) { setConnected(!!d.connected) })
      .catch(function(){})
  }, [])

  function saveHubspot(e) {
    e.preventDefault()
    setSaving(true)
    fetch('/api/marketing/hubspot-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: hubspotKey }),
    })
      .then(function(r) { return r.json() })
      .then(function(d) {
        setSaving(false)
        if (d.ok) { setSaved(true); setConnected(true); setHubspotKey('') }
      })
      .catch(function() { setSaving(false) })
  }

  var inp = { width:'100%', padding:'10px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box' }

  var socials = [
    { name: 'Instagram',  color: '#E1306C', url: 'https://instagram.com/spanglerbuilt',  note: 'Update handle in brandEmail.js' },
    { name: 'Facebook',   color: '#1877F2', url: 'https://facebook.com/spanglerbuilt',   note: 'Update handle in brandEmail.js' },
    { name: 'Google Business', color: '#4285F4', url: 'https://business.google.com', note: 'Manage reviews & posts' },
  ]

  return (
    <Layout>
      <div style={{maxWidth:1800, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Channels & integrations</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.5rem'}}>Connect your marketing platforms.</div>

        {/* HubSpot */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>HubSpot CRM</div>
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1.5rem', marginBottom:'1.5rem'}}>
          {connected ? (
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{fontSize:18}}>✓</span>
              <div>
                <div style={{fontSize:13, fontWeight:700, color:'#22c55e'}}>HubSpot connected</div>
                <div style={{fontSize:12, color:'rgba(255,255,255,.4)'}}>Leads are syncing automatically as contacts and deals.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveHubspot}>
              <div style={{fontSize:13, color:'rgba(255,255,255,.6)', marginBottom:12, lineHeight:1.7}}>
                Paste your HubSpot Private App token below. In HubSpot: <strong style={{color:'rgba(255,255,255,.7)'}}>Settings → Integrations → Private Apps</strong> → create an app with <code style={{background:'#0a0a0a', padding:'1px 5px', borderRadius:3, fontSize:12}}>crm.objects.contacts.write</code> and <code style={{background:'#0a0a0a', padding:'1px 5px', borderRadius:3, fontSize:12}}>crm.objects.deals.write</code> scopes.
              </div>
              <div style={{display:'flex', gap:10, alignItems:'flex-end'}}>
                <div style={{flex:1}}>
                  <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Private App Token</label>
                  <input type="password" value={hubspotKey} onChange={function(e){setHubspotKey(e.target.value)}} placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required style={inp}/>
                </div>
                <button type="submit" disabled={saving || !hubspotKey} style={{background:'#D06830', color:'#fff', border:'none', padding:'10px 20px', fontSize:13, fontWeight:700, borderRadius:4, cursor:'pointer', whiteSpace:'nowrap', opacity:saving||!hubspotKey?.5:1}}>
                  {saving ? 'Connecting…' : 'Connect HubSpot'}
                </button>
              </div>
              {saved && <div style={{marginTop:10, fontSize:12, color:'#22c55e'}}>Connected! New leads will now sync to HubSpot automatically.</div>}
            </form>
          )}
        </div>

        {/* Social channels */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Social channels</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.5rem'}}>
          {socials.map(function(s) {
            return (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" style={{
                display:'block', padding:'1rem 1.25rem',
                background:'#161616', border:'1px solid rgba(255,255,255,.08)',
                borderLeft:'4px solid ' + s.color, borderRadius:4, textDecoration:'none',
              }}>
                <div style={{fontSize:13, fontWeight:700, color:'#fff', marginBottom:3}}>{s.name}</div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{s.note}</div>
              </a>
            )
          })}
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
