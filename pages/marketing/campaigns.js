import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var C = {
  bg:     '#0d1117',
  card:   '#1a1f2e',
  acc:    '#FF8C00',
  border: 'rgba(255,140,0,0.2)',
  dimBorder: 'rgba(255,255,255,0.07)',
}

var inp = {
  padding:'9px 11px', background:'#0d1117', border:'1px solid rgba(255,255,255,.1)',
  borderRadius:4, color:'rgba(255,255,255,.85)', fontSize:12, outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', width:'100%',
}

var COPY_FIELDS = [
  { key:'google_headline',   label:'Google Headline',        maxLen:30  },
  { key:'google_description',label:'Google Description',     maxLen:90  },
  { key:'facebook_caption',  label:'Facebook/Instagram Caption', maxLen:125 },
  { key:'tiktok_caption',    label:'TikTok Caption',         maxLen:150 },
  { key:'youtube_title',     label:'YouTube Video Title',    maxLen:70  },
  { key:'email_subject',     label:'Email Subject Line',     maxLen:50  },
  { key:'email_preview',     label:'Email Preview Text',     maxLen:90  },
]

var AREAS = ['Cherokee County','Fulton County','Cobb County','DeKalb County','Forsyth County','North Georgia']
var PROJ_TYPES = ['Basement','Kitchen','Bathroom','Addition','Full Renovation','New Build']
var STATUS_COLORS = { draft:'rgba(255,255,255,.3)', active:'#22c55e', paused:'#f59e0b', completed:'#3b82f6' }

// ── Campaign Builder ───────────────────────────────────────────────────────────
function CampaignBuilder({ onSaved }) {
  var [name,         setName]         = useState('')
  var [areas,        setAreas]        = useState([])
  var [customZip,    setCustomZip]    = useState('')
  var [homeowner,    setHomeowner]    = useState('Homeowner')
  var [ageRange,     setAgeRange]     = useState('35-44')
  var [homeValue,    setHomeValue]    = useState('$500K-750K')
  var [income,       setIncome]       = useState('$100K-150K')
  var [projTypes,    setProjTypes]    = useState([])
  var [campaignType, setCampaignType] = useState('All Digital')
  var [budget,       setBudget]       = useState('')
  var [budgetPeriod, setBudgetPeriod] = useState('monthly')
  var [genLoading,   setGenLoading]   = useState(false)
  var [copy,         setCopy]         = useState(null)
  var [copyErr,      setCopyErr]      = useState('')
  var [saving,       setSaving]       = useState(false)
  var [savMsg,       setSavMsg]       = useState('')

  function toggleArea(a) {
    setAreas(function(prev){ return prev.includes(a) ? prev.filter(function(x){return x!==a}) : [...prev,a] })
  }
  function toggleProj(p) {
    setProjTypes(function(prev){ return prev.includes(p) ? prev.filter(function(x){return x!==p}) : [...prev,p] })
  }

  function buildBrief() {
    var z = customZip ? (' Custom zips: ' + customZip + '.') : ''
    return [
      'Campaign: ' + (name || 'SpanglerBuilt Campaign'),
      'Areas: ' + (areas.length ? areas.join(', ') : 'Metro Atlanta') + z,
      'Homeowners: ' + homeowner + ', Age ' + ageRange + ', Home value ' + homeValue + ', Income ' + income,
      'Project types: ' + (projTypes.length ? projTypes.join(', ') : 'General renovation'),
      'Campaign type: ' + campaignType,
      budget ? 'Budget: $' + budget + ' / ' + budgetPeriod : '',
    ].filter(Boolean).join('\n')
  }

  function generateCopy() {
    setGenLoading(true); setCopy(null); setCopyErr('')
    fetch('/api/marketing/generate-copy', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ brief: buildBrief() }),
    }).then(function(r){ return r.json() }).then(function(j) {
      setGenLoading(false)
      if (j.error) { setCopyErr(j.error); return }
      setCopy(j.copy || null)
    }).catch(function(e){ setGenLoading(false); setCopyErr(e.message) })
  }

  function saveCampaign() {
    setSaving(true); setSavMsg('')
    var auth = {}
    try { auth = JSON.parse(localStorage.getItem('sb_auth')||'{}') } catch(e){}
    fetch('/api/marketing/campaigns', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        name, target_areas: areas,
        target_zip_codes: customZip ? customZip.split(',').map(function(z){return z.trim()}).filter(Boolean) : [],
        demographic: { homeowner, age_range:ageRange, home_value:homeValue, income },
        project_types: projTypes, campaign_type: campaignType,
        budget: budget || null, budget_period: budgetPeriod,
        status:'draft', ai_copy: copy, created_by: auth.email || null,
      }),
    }).then(function(r){ return r.json() }).then(function(j) {
      setSaving(false)
      if (j.ok) { setSavMsg('Campaign saved!'); onSaved && onSaved() }
      else setSavMsg('Error: ' + (j.error || 'Unknown'))
    }).catch(function(e){ setSaving(false); setSavMsg('Error: ' + e.message) })
  }

  var lbl = { display:'block', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }
  var sec = { marginBottom:'1.25rem' }

  return (
    <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.5rem', marginBottom:'1.5rem'}}>
      <div style={{fontSize:13, fontWeight:700, color:'#fff', marginBottom:'1.25rem'}}>New Campaign</div>

      {/* Name */}
      <div style={sec}>
        <label style={lbl}>Campaign Name</label>
        <input value={name} onChange={function(e){setName(e.target.value)}} placeholder="Spring 2026 Basement Push" style={inp}/>
      </div>

      {/* Target areas */}
      <div style={sec}>
        <label style={lbl}>Target Areas</label>
        <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:8}}>
          {AREAS.map(function(a) {
            var on = areas.includes(a)
            return (
              <button key={a} onClick={function(){toggleArea(a)}}
                style={{padding:'5px 12px', fontSize:11, fontWeight:600, border:'1px solid ' + (on?C.border:'rgba(255,255,255,.1)'), background: on?'rgba(255,140,0,.12)':'transparent', color: on?C.acc:'rgba(255,255,255,.45)', borderRadius:20, cursor:'pointer', fontFamily:'inherit'}}>
                {a}
              </button>
            )
          })}
        </div>
        <input value={customZip} onChange={function(e){setCustomZip(e.target.value)}} placeholder="Custom zip codes: 30188, 30004, 30062" style={inp}/>
      </div>

      {/* Demographics */}
      <div style={sec}>
        <label style={lbl}>Target Demographic</label>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:8}}>
          {[
            { label:'Homeowner Status', val:homeowner, set:setHomeowner, opts:['Homeowner','Renter','Both'] },
            { label:'Age Range', val:ageRange, set:setAgeRange, opts:['25-34','35-44','45-54','55-64','65+'] },
            { label:'Est. Home Value', val:homeValue, set:setHomeValue, opts:['$300K-500K','$500K-750K','$750K-1M','$1M+'] },
            { label:'Household Income', val:income, set:setIncome, opts:['$75K-100K','$100K-150K','$150K-200K','$200K+'] },
          ].map(function(f) {
            return (
              <div key={f.label}>
                <div style={lbl}>{f.label}</div>
                <select value={f.val} onChange={function(e){f.set(e.target.value)}} style={inp}>
                  {f.opts.map(function(o){ return <option key={o} value={o}>{o}</option> })}
                </select>
              </div>
            )
          })}
        </div>
      </div>

      {/* Project type */}
      <div style={sec}>
        <label style={lbl}>Project Type</label>
        <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
          {PROJ_TYPES.map(function(p) {
            var on = projTypes.includes(p)
            return (
              <button key={p} onClick={function(){toggleProj(p)}}
                style={{padding:'5px 12px', fontSize:11, fontWeight:600, border:'1px solid '+(on?C.border:'rgba(255,255,255,.1)'), background:on?'rgba(255,140,0,.12)':'transparent', color:on?C.acc:'rgba(255,255,255,.45)', borderRadius:20, cursor:'pointer', fontFamily:'inherit'}}>
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Campaign type + budget */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1.25rem'}}>
        <div>
          <label style={lbl}>Campaign Type</label>
          <select value={campaignType} onChange={function(e){setCampaignType(e.target.value)}} style={inp}>
            {['Google Ads','Meta FB+IG','LSA','Email Drip','Direct Mail','All Digital'].map(function(t){ return <option key={t} value={t}>{t}</option> })}
          </select>
        </div>
        <div>
          <label style={lbl}>Budget</label>
          <div style={{display:'flex', gap:6}}>
            <input type="number" value={budget} onChange={function(e){setBudget(e.target.value)}} placeholder="2500" style={Object.assign({},inp,{flex:1})}/>
            <select value={budgetPeriod} onChange={function(e){setBudgetPeriod(e.target.value)}} style={Object.assign({},inp,{width:'auto'})}>
              <option value="monthly">/ Month</option>
              <option value="total">Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Copy Generator */}
      <div style={{borderTop:'1px solid ' + C.dimBorder, paddingTop:'1.25rem', marginBottom:'1.25rem'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:12, fontWeight:700, color:'#fff'}}>AI Copy Generator</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2}}>Generate ad copy for all platforms based on your campaign details</div>
          </div>
          <button onClick={generateCopy} disabled={genLoading}
            style={{background:C.acc, color:'#fff', border:'none', padding:'10px 20px', fontSize:12, fontWeight:700, borderRadius:4, cursor:'pointer', fontFamily:'inherit', opacity:genLoading?.6:1, whiteSpace:'nowrap'}}>
            {genLoading ? 'Generating…' : '✦ Generate Ad Copy'}
          </button>
        </div>

        {copyErr && <div style={{fontSize:12, color:'#e57373', marginBottom:10}}>{copyErr}</div>}

        {copy && (
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {COPY_FIELDS.map(function(f) {
              var val = copy[f.key] || ''
              return (
                <div key={f.key} style={{background:'rgba(0,0,0,.25)', border:'1px solid rgba(255,255,255,.07)', borderRadius:4, padding:'10px 12px', display:'flex', alignItems:'flex-start', gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4}}>{f.label} <span style={{color:'rgba(255,255,255,.15)'}}>({f.maxLen} chars)</span></div>
                    <div style={{fontSize:12, color:'rgba(255,255,255,.8)', lineHeight:1.5}}>{val}</div>
                  </div>
                  <button onClick={function(){navigator.clipboard.writeText(val)}}
                    style={{background:'rgba(255,140,0,.15)', border:'1px solid ' + C.border, color:C.acc, fontSize:10, padding:'4px 10px', borderRadius:3, cursor:'pointer', fontFamily:'inherit', flexShrink:0, whiteSpace:'nowrap'}}>
                    Copy
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Save Campaign */}
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button onClick={saveCampaign} disabled={saving || !name.trim()}
          style={{background: name.trim() ? C.acc : 'rgba(255,140,0,.3)', color:'#fff', border:'none', padding:'10px 24px', fontSize:12, fontWeight:700, borderRadius:4, cursor: name.trim() ? 'pointer' : 'not-allowed', fontFamily:'inherit', opacity:saving?.6:1}}>
          {saving ? 'Saving…' : 'Save Campaign'}
        </button>
        {savMsg && <span style={{fontSize:12, color: savMsg.startsWith('Error') ? '#e57373' : '#22c55e'}}>{savMsg}</span>}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MarketingCampaigns() {
  var [campaigns, setCampaigns] = useState([])
  var [loading,   setLoading]   = useState(true)

  function loadCampaigns() {
    fetch('/api/marketing/campaigns')
      .then(function(r){ return r.json() })
      .then(function(j){ setCampaigns(j.campaigns || []); setLoading(false) })
      .catch(function(){ setLoading(false) })
  }

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
    loadCampaigns()
  }, [])

  var inp2 = { width:'100%', padding:'10px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box' }

  return (
    <Layout>
      <div style={{maxWidth:1800, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Campaign Builder</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.5rem'}}>Build targeted campaigns with AI-generated ad copy.</div>

        <CampaignBuilder onSaved={loadCampaigns} />

        {/* Saved campaigns */}
        {campaigns.length > 0 && (
          <div>
            <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Saved Campaigns</div>
            <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:'2rem'}}>
              {campaigns.map(function(c) {
                var sc = STATUS_COLORS[c.status] || 'rgba(255,255,255,.3)'
                return (
                  <div key={c.id} style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
                    <div style={{flex:1, minWidth:150}}>
                      <div style={{fontSize:13, fontWeight:700, color:'#fff'}}>{c.name}</div>
                      <div style={{fontSize:11, color:'rgba(255,255,255,.35)', marginTop:2}}>
                        {c.campaign_type} · {(c.target_areas||[]).join(', ') || 'All areas'} · {(c.project_types||[]).join(', ') || 'All types'}
                      </div>
                    </div>
                    {c.budget && (
                      <div style={{fontSize:12, color:'rgba(255,255,255,.5)', whiteSpace:'nowrap'}}>${Number(c.budget).toLocaleString()} / {c.budget_period}</div>
                    )}
                    <div style={{fontSize:11, color:'rgba(255,255,255,.3)', whiteSpace:'nowrap'}}>
                      {new Date(c.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                    </div>
                    <span style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', padding:'3px 10px', borderRadius:10, background: sc + '22', color:sc, border:'1px solid '+ sc + '44'}}>
                      {c.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Existing email compose */}
        <div style={{borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:'1.5rem'}}>
          <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Send One-Off Branded Email</div>
          <div style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, padding:'1.5rem'}}>
            <ComposeBranded />
          </div>
        </div>

      </div>
    </Layout>
  )
}

function ComposeBranded() {
  var [to,      setTo]      = useState('')
  var [subject, setSubject] = useState('')
  var [body,    setBody]    = useState('')
  var [status,  setStatus]  = useState('')
  var [loading, setLoading] = useState(false)

  var inp2 = { width:'100%', padding:'10px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box' }

  function handleSend(e) {
    e.preventDefault()
    setLoading(true); setStatus('')
    fetch('/api/marketing/send-email', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ to, subject, body }),
    }).then(function(r){return r.json()}).then(function(d){
      setLoading(false)
      if (d.ok) { setStatus('Sent!'); setTo(''); setSubject(''); setBody('') }
      else setStatus('Error: ' + (d.error || 'Unknown'))
    }).catch(function(){ setLoading(false); setStatus('Failed to send.') })
  }

  return (
    <form onSubmit={handleSend}>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
        <div>
          <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>To</label>
          <input type="email" value={to} onChange={function(e){setTo(e.target.value)}} placeholder="client@example.com" required style={inp2}/>
        </div>
        <div>
          <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Subject</label>
          <input value={subject} onChange={function(e){setSubject(e.target.value)}} placeholder="Subject line" required style={inp2}/>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Message</label>
        <textarea value={body} onChange={function(e){setBody(e.target.value)}} placeholder="Write your message here…" required rows={6} style={Object.assign({},inp2,{resize:'vertical',lineHeight:1.7})}/>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:12}}>
        <button type="submit" disabled={loading} style={{background:'#FF8C00', color:'#fff', border:'none', padding:'10px 24px', fontSize:13, fontWeight:700, borderRadius:4, cursor:'pointer', opacity:loading?.6:1}}>
          {loading ? 'Sending…' : 'Send branded email'}
        </button>
        {status && <span style={{fontSize:12, color: status.startsWith('Error') ? '#e57373' : '#22c55e'}}>{status}</span>}
      </div>
    </form>
  )
}

export async function getServerSideProps() { return { props: {} } }
