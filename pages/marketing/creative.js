import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var C = {
  acc:    '#FF8C00',
  card:   '#1a1f2e',
  border: 'rgba(255,140,0,0.2)',
  dimBorder: 'rgba(255,255,255,0.07)',
}

var SIGN_OFF = `Michael Spangler
SpanglerBuilt Inc.
Design/Build Contractor · GC & Home Builder
44 Milton Ave, Alpharetta GA 30009
(404) 492-7650 · app.spanglerbuilt.com
We Build More Than Projects — We Build Lifestyles.`

var IMG_PRESETS = [
  'Luxury basement renovation Alpharetta Georgia, modern design, high-end finishes, professional photography',
  'Beautiful kitchen remodel North Georgia, white shaker cabinets, quartz countertops, natural light',
  'Stunning bathroom renovation, spa-like, modern fixtures, tile work, North Georgia home',
  'Room addition exterior, craftsman style, seamless match, North Georgia neighborhood',
  'Elegant open-concept living room renovation, coffered ceilings, hardwood floors, Atlanta luxury home',
]

var COPY_ACTIONS = [
  { id:'google_ad',     label:'Google Ad'        },
  { id:'meta_ad',       label:'Meta / Instagram' },
  { id:'social_post',   label:'Social Post'      },
  { id:'email_blast',   label:'Email Campaign'   },
  { id:'review_reply',  label:'Review Reply'     },
  { id:'nextdoor_post', label:'Nextdoor Post'    },
]

var EMAIL_TEMPLATES = [
  { id:'new_lead',      label:'New Lead Follow-Up'            },
  { id:'estimate_sent', label:'Estimate Sent'                 },
  { id:'contract_ready',label:'Contract Ready to Sign'        },
  { id:'project_start', label:'Project Start Confirmation'    },
  { id:'payment_due',   label:'Milestone Payment Due'         },
  { id:'completion',    label:'Project Completion / Thank You'},
  { id:'review_request',label:'Review Request'               },
]

var PLAT_HASHTAGS = {
  Instagram: '#SpanglerBuilt #NorthGeorgia #DesignBuild #HomeRenovation #AtlantaContractor',
  TikTok:    '#HomeReno #DesignBuild #ContractorLife #NorthGeorgia #BeforeAndAfter',
  YouTube:   'SpanglerBuilt North Georgia Design Build Contractor Renovation',
  LinkedIn:  '#Construction #DesignBuild #GeneralContractor #NorthGeorgia',
}

function callClaude(systemPrompt, userContent) {
  return fetch('/api/claude', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ action:'proposal', data:{ prompt: userContent } }),
  }).then(function(r){ return r.json() }).then(function(j){
    if (j.error) throw new Error(j.error)
    return j.result || ''
  })
}

var ta = { width:'100%', fontFamily:'inherit', fontSize:12, border:'1px solid rgba(255,255,255,.09)', borderRadius:3, padding:'10px', outline:'none', resize:'vertical', background:'#0d0d0d', color:'rgba(255,255,255,.75)', boxSizing:'border-box', lineHeight:1.6 }
var btn = function(extra) { return Object.assign({ background:C.acc, color:'#fff', border:'none', padding:'10px 22px', fontSize:12, fontWeight:700, cursor:'pointer', borderRadius:3, fontFamily:'inherit' }, extra || {}) }
var ghostBtn = function(extra) { return Object.assign({ background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.4)', padding:'6px 12px', fontSize:11, borderRadius:3, cursor:'pointer', fontFamily:'inherit' }, extra || {}) }

function OutputPanel({ result, label }) {
  var [copied, setCopied] = useState(false)
  if (!result) return null
  return (
    <div style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, overflow:'hidden', marginTop:12}}>
      <div style={{background:'rgba(0,0,0,.3)', padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid ' + C.dimBorder}}>
        <span style={{color:C.acc, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em'}}>{label || 'Output'}</span>
        <button onClick={function(){navigator.clipboard.writeText(result).then(function(){setCopied(true);setTimeout(function(){setCopied(false)},2000)})}}
          style={Object.assign({},ghostBtn(),{fontSize:10,padding:'3px 10px'})}>
          {copied ? 'Copied ✓' : 'Copy All'}
        </button>
      </div>
      <div style={{padding:'1.25rem', fontSize:13, lineHeight:1.85, whiteSpace:'pre-wrap', color:'rgba(255,255,255,.75)', overflowY:'auto', maxHeight:520}}>
        {result}
      </div>
    </div>
  )
}

// ── Tab 1: Ad Images ──────────────────────────────────────────────────────────
function ImageTool() {
  var [prompt,  setPrompt]  = useState('')
  var [images,  setImages]  = useState([])
  var [loading, setLoading] = useState(false)
  var [error,   setError]   = useState('')

  function generate(customPrompt) {
    var p = (customPrompt || prompt).trim()
    if (!p) return
    setLoading(true); setError('')
    fetch('/api/generate-image', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ prompt: p }),
    }).then(function(r){return r.json()}).then(function(j){
      setLoading(false)
      if (j.error) { setError(j.error); return }
      setImages(function(prev){ return [{ url:j.url, prompt:p, id:Date.now() }, ...prev] })
    }).catch(function(e){ setLoading(false); setError(e.message) })
  }

  function download(url, idx) {
    fetch(url).then(function(r){return r.blob()}).then(function(blob){
      var a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'spanglerbuilt-ad-' + idx + '.png'
      a.click()
    }).catch(function(){ window.open(url,'_blank') })
  }

  return (
    <div>
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Quick Presets — click to generate</div>
        <div style={{display:'flex', flexDirection:'column', gap:6}}>
          {IMG_PRESETS.map(function(p,i){
            return (
              <button key={i} onClick={function(){setPrompt(p);generate(p)}} disabled={loading}
                style={{textAlign:'left', padding:'9px 14px', background:C.card, border:'1px solid rgba(255,255,255,.07)', borderLeft:'3px solid ' + C.acc, borderRadius:3, color:'rgba(255,255,255,.6)', fontSize:12, cursor:'pointer', fontFamily:'inherit', lineHeight:1.5, opacity:loading?.5:1}}
                onMouseEnter={function(e){e.currentTarget.style.background='rgba(255,255,255,.04)'}}
                onMouseLeave={function(e){e.currentTarget.style.background=C.card}}>
                {p}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.25rem', marginBottom:'1.25rem'}}>
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Custom Prompt</div>
        <textarea value={prompt} onChange={function(e){setPrompt(e.target.value)}}
          onKeyDown={function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate()}}}
          placeholder="Describe the scene — e.g. Open-concept living room, coffered ceilings, hardwood floors, Atlanta luxury home"
          rows={3} style={Object.assign({},ta,{marginBottom:12})}/>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button onClick={function(){generate()}} disabled={loading||!prompt.trim()} style={btn({opacity:loading||!prompt.trim()?.5:1})}>
            {loading ? 'Generating…' : 'Generate Image'}
          </button>
          <span style={{fontSize:11, color:'rgba(255,255,255,.2)'}}>DALL-E 3 HD · 1792×1024</span>
        </div>
        {error && <div style={{marginTop:10,fontSize:12,color:'#e57373',background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.25)',padding:'8px 12px',borderRadius:3}}>{error}</div>}
      </div>

      {loading && (
        <div style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, padding:'2.5rem', textAlign:'center', marginBottom:'1.25rem'}}>
          <div style={{fontSize:13, color:'rgba(255,255,255,.4)', marginBottom:6}}>Generating image…</div>
          <div style={{fontSize:11, color:'rgba(255,255,255,.2)'}}>DALL-E 3 HD takes 10–20 seconds</div>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10}}>Generated ({images.length})</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(400px,1fr))', gap:12}}>
            {images.map(function(img,i){
              return (
                <div key={img.id} style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, overflow:'hidden'}}>
                  <img src={img.url} alt={img.prompt} style={{width:'100%', display:'block', aspectRatio:'16/9', objectFit:'cover'}}/>
                  <div style={{padding:'10px 12px'}}>
                    <div style={{fontSize:11, color:'rgba(255,255,255,.4)', lineHeight:1.5, marginBottom:8}}>{img.prompt}</div>
                    <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                      <button onClick={function(){download(img.url,images.length-i)}} style={btn({padding:'6px 14px',fontSize:11})}>Download</button>
                      <button onClick={function(){setPrompt(img.prompt)}} style={ghostBtn()}>Re-use prompt</button>
                      <button onClick={function(){generate(img.prompt)}} disabled={loading} style={ghostBtn({opacity:loading?.5:1})}>Regenerate</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tab 2: Ad Copy ────────────────────────────────────────────────────────────
function CopyTool() {
  var [action,  setAction]  = useState('google_ad')
  var [projType,setProjType]= useState('Basement Renovation')
  var [area,    setArea]    = useState('North Georgia')
  var [tone,    setTone]    = useState('Professional')
  var [result,  setResult]  = useState('')
  var [loading, setLoading] = useState(false)

  var TONES = ['Professional','Friendly','Urgent','Luxury']
  var PROJ_TYPES = ['Basement Renovation','Kitchen Remodel','Bathroom Remodel','Home Addition','Full Renovation','New Build']

  var PROMPTS = {
    google_ad:     function(){ return 'Write 3 Google Search Ad variants for SpanglerBuilt Inc. — ' + projType + ' in ' + area + '. Tone: ' + tone + '. Each variant: Headline 1 (30 chars max), Headline 2 (30 chars max), Headline 3 (30 chars max), Description 1 (90 chars max), Description 2 (90 chars max). Label each clearly.' },
    meta_ad:       function(){ return 'Write 2 Meta (FB/IG) ad variants for SpanglerBuilt Inc. — ' + projType + ' in ' + area + '. Tone: ' + tone + '. Each: primary text (125 chars), headline (27 chars), description (27 chars), CTA suggestion.' },
    social_post:   function(){ return 'Write 3 social media post variants for SpanglerBuilt Inc. — ' + projType + ' in ' + area + '. Tone: ' + tone + '. One short (<100 chars), one medium (150–200 chars), one story format. Add Metro Atlanta contractor hashtags.' },
    email_blast:   function(){ return 'Write a marketing email for SpanglerBuilt Inc. — ' + projType + ' in ' + area + '. Tone: ' + tone + '. Include subject line, preview text, body (<200 words), and clear CTA.' },
    review_reply:  function(){ return 'Write a professional response to a Google review for SpanglerBuilt Inc. — ' + projType + '. Tone: ' + tone + '. Under 75 words. Warm, reinforce quality, invite referrals.' },
    nextdoor_post: function(){ return 'Write a Nextdoor neighborhood post for SpanglerBuilt Inc. — ' + projType + ' in ' + area + '. Sound like a real neighbor, not an ad. Under 150 words. Include (404) 492-7650.' },
  }

  function generate() {
    setLoading(true); setResult('')
    var prompt = PROMPTS[action]()
    fetch('/api/claude', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'proposal', data:{ prompt } }),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || '')
      setLoading(false)
    }).catch(function(e){ setResult('Error: '+e.message); setLoading(false) })
  }

  return (
    <div>
      <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.25rem'}}>
        {COPY_ACTIONS.map(function(a){
          var active = action===a.id
          return (
            <button key={a.id} onClick={function(){setAction(a.id);setResult('')}}
              style={{padding:'6px 14px', fontSize:11, fontWeight:active?700:500, border:'1px solid '+(active?C.border:'rgba(255,255,255,.1)'), background:active?'rgba(255,140,0,.12)':'transparent', color:active?C.acc:'rgba(255,255,255,.45)', borderRadius:3, cursor:'pointer', fontFamily:'inherit'}}>
              {a.label}
            </button>
          )
        })}
      </div>

      <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.25rem', marginBottom:'1rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12}}>
          <div>
            <label style={{display:'block', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4}}>Project Type</label>
            <select value={projType} onChange={function(e){setProjType(e.target.value)}} style={Object.assign({},ta,{minHeight:'auto',padding:'8px 10px',resize:'none'})}>
              {PROJ_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option> })}
            </select>
          </div>
          <div>
            <label style={{display:'block', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4}}>Target Area</label>
            <input value={area} onChange={function(e){setArea(e.target.value)}} placeholder="North Georgia" style={Object.assign({},ta,{padding:'8px 10px'})}/>
          </div>
          <div>
            <label style={{display:'block', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4}}>Tone</label>
            <select value={tone} onChange={function(e){setTone(e.target.value)}} style={Object.assign({},ta,{minHeight:'auto',padding:'8px 10px',resize:'none'})}>
              {TONES.map(function(t){ return <option key={t} value={t}>{t}</option> })}
            </select>
          </div>
        </div>
        <button onClick={generate} disabled={loading} style={btn({opacity:loading?.5:1})}>
          {loading ? 'Writing…' : 'Generate Copy'}
        </button>
      </div>

      <OutputPanel result={result} label="Generated Copy" />
    </div>
  )
}

// ── Tab 3: Email Templates ────────────────────────────────────────────────────
function EmailTool() {
  var [template, setTemplate] = useState('new_lead')
  var [details,  setDetails]  = useState('')
  var [result,   setResult]   = useState('')
  var [loading,  setLoading]  = useState(false)

  var PROMPTS = {
    new_lead:      'Write a warm, professional follow-up email for a new lead inquiry. Details: ',
    estimate_sent: 'Write an email notifying a client their construction estimate has been sent and is ready to review. Details: ',
    contract_ready:'Write an email telling a client their contract is ready to sign and walk them through the next steps. Details: ',
    project_start: 'Write an email confirming project start date, crew arrival time, what the homeowner should expect on day one. Details: ',
    payment_due:   'Write a professional, friendly email notifying a client a milestone payment is due per the contract schedule. Details: ',
    completion:    'Write a warm project completion / thank you email. Express gratitude, summarize the project outcome, request a Google review. Details: ',
    review_request:'Write a genuine review request email asking the client to leave a Google review. Keep it brief and personal. Details: ',
  }

  function generate() {
    if (!details.trim()) return
    setLoading(true); setResult('')
    var prompt = PROMPTS[template] + details + '\n\nSign off with:\n' + SIGN_OFF
    fetch('/api/claude', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'email', data:{ prompt } }),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || '')
      setLoading(false)
    }).catch(function(e){ setResult('Error: '+e.message); setLoading(false) })
  }

  return (
    <div>
      <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Template</div>
      <div style={{display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1.25rem'}}>
        {EMAIL_TEMPLATES.map(function(t){
          var active = template===t.id
          return (
            <button key={t.id} onClick={function(){setTemplate(t.id);setResult('')}}
              style={{padding:'6px 14px', fontSize:11, fontWeight:active?700:500, border:'1px solid '+(active?C.border:'rgba(255,255,255,.1)'), background:active?'rgba(255,140,0,.12)':'transparent', color:active?C.acc:'rgba(255,255,255,.45)', borderRadius:3, cursor:'pointer', fontFamily:'inherit'}}>
              {t.label}
            </button>
          )
        })}
      </div>

      <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.25rem', marginBottom:'1rem'}}>
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Project / Client Details</div>
        <textarea value={details} onChange={function(e){setDetails(e.target.value)}}
          placeholder="Client name, project type, address, key details, any special notes…"
          rows={4} style={Object.assign({},ta,{marginBottom:12})}/>
        <div style={{background:'rgba(255,140,0,.07)', border:'1px solid ' + C.border, borderRadius:3, padding:'8px 12px', marginBottom:12, fontSize:11, color:'rgba(255,255,255,.45)', lineHeight:1.6}}>
          <strong style={{color:C.acc}}>Auto sign-off:</strong> Michael Spangler · SpanglerBuilt Inc. · Design/Build Contractor · GC &amp; Home Builder · (404) 492-7650
        </div>
        <button onClick={generate} disabled={loading||!details.trim()} style={btn({opacity:loading||!details.trim()?.5:1})}>
          {loading ? 'Generating…' : 'Generate Email Template'}
        </button>
      </div>

      <OutputPanel result={result} label={'Email: ' + (EMAIL_TEMPLATES.find(function(t){return t.id===template})?.label || '')} />
    </div>
  )
}

// ── Tab 4: Social Captions ────────────────────────────────────────────────────
function CaptionTool() {
  var [projType,  setProjType]  = useState('Basement')
  var [milestone, setMilestone] = useState('Reveal')
  var [tone,      setTone]      = useState('Friendly')
  var [result,    setResult]    = useState('')
  var [loading,   setLoading]   = useState(false)

  var PROJ_TYPES  = ['Basement','Kitchen','Bathroom','Addition','Full Renovation','New Build']
  var MILESTONES  = ['Before','During','After','Reveal']
  var TONES       = ['Friendly','Professional','Luxury','Excited']
  var PLATFORMS   = ['Instagram','TikTok','YouTube','LinkedIn']

  function generate() {
    setLoading(true); setResult('')
    var hashtags = PLATFORMS.map(function(p){ return p + ': ' + PLAT_HASHTAGS[p] }).join('\n')
    var prompt = 'Write 5 social media caption variations for a SpanglerBuilt ' + projType + ' renovation video. Stage: ' + milestone + '. Tone: ' + tone + '. For each platform (Instagram, TikTok, Facebook, LinkedIn) write a platform-optimized caption. Include the correct hashtag set for each:\n' + hashtags + '\nEnd Instagram and TikTok captions with: We Build More Than Projects — We Build Lifestyles. #SpanglerBuilt'
    fetch('/api/claude', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ action:'proposal', data:{ prompt } }),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || '')
      setLoading(false)
    }).catch(function(e){ setResult('Error: '+e.message); setLoading(false) })
  }

  return (
    <div>
      <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.5rem', marginBottom:'1rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:'1.25rem'}}>
          {[
            {label:'Project Type', val:projType, set:setProjType, opts:PROJ_TYPES},
            {label:'Milestone',    val:milestone, set:setMilestone, opts:MILESTONES},
            {label:'Tone',         val:tone,      set:setTone,      opts:TONES},
          ].map(function(f){
            return (
              <div key={f.label}>
                <label style={{display:'block', fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4}}>{f.label}</label>
                <select value={f.val} onChange={function(e){f.set(e.target.value)}} style={Object.assign({},ta,{minHeight:'auto',padding:'8px 10px',resize:'none'})}>
                  {f.opts.map(function(o){ return <option key={o} value={o}>{o}</option> })}
                </select>
              </div>
            )
          })}
        </div>

        {/* Platform hashtag reference */}
        <div style={{background:'rgba(0,0,0,.2)', borderRadius:3, padding:'10px 12px', marginBottom:'1rem'}}>
          <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,.25)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8}}>Platform Hashtag Sets</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8}}>
            {PLATFORMS.map(function(p){
              return (
                <div key={p} style={{display:'flex', alignItems:'flex-start', gap:6}}>
                  <span style={{fontSize:10, fontWeight:700, color:C.acc, minWidth:72, flexShrink:0}}>{p}</span>
                  <span style={{fontSize:10, color:'rgba(255,255,255,.35)', lineHeight:1.5}}>{PLAT_HASHTAGS[p]}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={generate} disabled={loading} style={btn({opacity:loading?.5:1})}>
          {loading ? 'Generating…' : 'Generate 5 Caption Variations'}
        </button>
      </div>

      <OutputPanel result={result} label={'Captions — ' + projType + ' ' + milestone} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MarketingCreative() {
  var [tab, setTab] = useState('images')

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
  }, [])

  var tabs = [
    { id:'images',   label:'Ad Images'       },
    { id:'copy',     label:'Ad Copy'         },
    { id:'email',    label:'Email Templates' },
    { id:'captions', label:'Social Captions' },
  ]

  return (
    <Layout>
      <div style={{maxWidth:1800, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>AI Creative Studio</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:3}}>Images, ad copy, email templates, and social captions — all AI-generated.</div>
        </div>

        {/* Tab switcher */}
        <div style={{display:'flex', gap:4, marginBottom:'1.5rem', background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, padding:4, width:'fit-content'}}>
          {tabs.map(function(t){
            var active = tab===t.id
            return (
              <button key={t.id} onClick={function(){setTab(t.id)}} style={{
                padding:'8px 20px', fontSize:12, fontWeight:active?700:500,
                background: active ? C.acc : 'transparent',
                color: active ? '#fff' : 'rgba(255,255,255,.4)',
                border:'none', borderRadius:3, cursor:'pointer', fontFamily:'inherit', transition:'all .15s', whiteSpace:'nowrap',
              }}>{t.label}</button>
            )
          })}
        </div>

        {tab==='images'   && <ImageTool   />}
        {tab==='copy'     && <CopyTool    />}
        {tab==='email'    && <EmailTool   />}
        {tab==='captions' && <CaptionTool />}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
