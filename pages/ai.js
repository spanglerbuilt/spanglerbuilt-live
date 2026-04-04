import { useState, useEffect } from 'react'

var ACTIONS = [
  {id:'proposal',    label:'Write Proposal'},
  {id:'email',       label:'Draft Email'},
  {id:'estimate',    label:'Generate Estimate'},
  {id:'selections',  label:'Recommend Materials'},
  {id:'contract',    label:'Generate Contract'},
  {id:'changeOrder', label:'Change Order'},
  {id:'clientChat',  label:'Client Q&A'},
  {id:'review',      label:'Review Reply'},
  {id:'taskPlan',    label:'Task Plan'},
]

var PRESETS = [
  'Professional kitchen remodel, modern design, high-end finishes, Atlanta home',
  'Luxury bathroom renovation, marble tile, custom vanity',
  'Finished basement with wet bar, home theater, LVP flooring',
  'Beautiful deck and outdoor living space, Atlanta Georgia',
  'Home addition, seamless exterior match, professional construction',
]

// ── Claude text tool ──────────────────────────────────────────────────────────
function ClaudeTool() {
  var [action,   setAction]   = useState('proposal')
  var [prompt,   setPrompt]   = useState('')
  var [result,   setResult]   = useState('')
  var [loading,  setLoading]  = useState(false)
  var [copied,   setCopied]   = useState(false)
  var [projects, setProjects] = useState([])
  var [selId,    setSelId]    = useState('')

  useEffect(function() {
    fetch('/api/projects/list')
      .then(function(r){ return r.json() })
      .then(function(j){ setProjects(j.projects || []) })
      .catch(function(){})
  }, [])

  function statusLabel(s) {
    var map = { new_lead:'New Lead', contacted:'Contacted', estimate:'Estimate', approved:'Approved', started:'Started' }
    return map[s] || s || ''
  }

  function onProjectSelect(e) {
    var id = e.target.value
    setSelId(id)
    if (!id) { setPrompt(''); return }
    var p = projects.find(function(x){ return x.id === id })
    if (!p) return
    var contractVal = p.estimate_total
      ? '$' + Number(p.estimate_total).toLocaleString()
      : (p.budget_range || 'TBD')
    var lines = [
      'Project: '        + (p.project_number || 'N/A'),
      'Client: '         + (p.client_name    || 'N/A'),
      'Type: '           + (p.project_type   || 'N/A'),
      'Address: '        + (p.address        || 'N/A'),
      'Tier: '           + (p.selected_tier  || 'N/A'),
      'Contract Value: ' + contractVal,
      'Status: '         + statusLabel(p.status),
    ]
    if (p.description) lines.push('Notes: ' + p.description)
    setPrompt(lines.join('\n'))
  }

  function run() {
    if (!prompt.trim() || loading) return
    setLoading(true); setResult(''); setCopied(false)
    fetch('/api/claude', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({ action, data: { prompt } }),
    })
      .then(function(r){ return r.json() })
      .then(function(j){
        setResult(j.result || j.error || 'No response')
        setLoading(false)
      })
      .catch(function(e){ setResult('Error: ' + e.message); setLoading(false) })
  }

  function copyResult() {
    navigator.clipboard.writeText(result).then(function(){
      setCopied(true)
      setTimeout(function(){ setCopied(false) }, 2000)
    })
  }

  return (
    <div>
      {/* Project selector */}
      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'14px 16px',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <span style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',whiteSpace:'nowrap'}}>Load Project</span>
        <select value={selId} onChange={onProjectSelect} style={{
          flex:1,minWidth:220,padding:'8px 10px',background:'#0d0d0d',border:'1px solid rgba(255,255,255,.12)',
          borderRadius:3,color:'rgba(255,255,255,.8)',fontSize:12,fontFamily:'inherit',outline:'none',cursor:'pointer',
        }}>
          <option value=''>— Select a project to auto-fill context —</option>
          {projects.map(function(p){
            var tier  = p.selected_tier ? ' — ' + p.selected_tier : ''
            var label = (p.project_number || p.id.slice(0,8)) + ' — ' + (p.client_name || 'Unknown') + tier
            return <option key={p.id} value={p.id}>{label}</option>
          })}
        </select>
        {selId && (
          <button onClick={function(){ setSelId(''); setPrompt('') }}
            style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.3)',fontSize:11,padding:'6px 10px',borderRadius:3,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {ACTIONS.map(function(a){
          var active = action === a.id
          return (
            <button key={a.id} onClick={function(){ setAction(a.id) }} style={{
              padding:'7px 15px',fontSize:11,fontFamily:'inherit',fontWeight:600,
              cursor:'pointer',borderRadius:3,border:'1px solid',letterSpacing:'.04em',
              borderColor: active ? '#D06830' : 'rgba(255,255,255,.1)',
              background:  active ? 'rgba(208,104,48,.18)' : '#161616',
              color:       active ? '#D06830' : 'rgba(255,255,255,.45)',
              transition:  'all .12s',
            }}>{a.label}</button>
          )
        })}
      </div>

      {/* Prompt textarea + generate */}
      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem',marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>
          Project Context &amp; Instructions
        </div>
        <textarea
          value={prompt}
          onChange={function(e){ setPrompt(e.target.value) }}
          placeholder={'Project: SB-2026-001\nClient: John Smith\nType: Basement Renovation\nAddress: 123 Main St, Woodstock GA 30188\nTier: Best\nContract Value: $85,000\nStatus: Approved\nNotes: Full basement finish with wet bar and full bathroom, LVP flooring throughout, ~665 sf.'}
          style={{
            width:'100%',fontFamily:'inherit',fontSize:13,lineHeight:1.7,
            border:'1px solid rgba(255,255,255,.09)',borderRadius:3,padding:'10px 12px',
            minHeight:130,outline:'none',resize:'vertical',marginBottom:14,
            background:'#0d0d0d',color:'rgba(255,255,255,.8)',boxSizing:'border-box',
          }}
        />
        <button
          onClick={run}
          disabled={loading || !prompt.trim()}
          style={{
            background: loading || !prompt.trim() ? 'rgba(208,104,48,.4)' : '#D06830',
            color:'#fff',border:'none',padding:'10px 28px',fontSize:11,fontWeight:700,
            letterSpacing:'.1em',textTransform:'uppercase',cursor: loading||!prompt.trim() ? 'not-allowed' : 'pointer',
            borderRadius:3,fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:8,
          }}>
          {loading ? (
            <>
              <span style={{
                display:'inline-block',width:12,height:12,border:'2px solid rgba(255,255,255,.3)',
                borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',
              }}/>
              Claude is writing…
            </>
          ) : 'Generate with Claude →'}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* Output panel */}
      {(loading || result) && (
        <div style={{background:'#1a1f2e',border:'1px solid rgba(255,255,255,.1)',borderRadius:4,overflow:'hidden'}}>
          <div style={{background:'#141926',padding:'9px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
            <span style={{color:'#D06830',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase'}}>
              Claude Output — {ACTIONS.find(function(a){ return a.id===action })?.label || action}
            </span>
            <div style={{display:'flex',gap:8}}>
              <button
                onClick={copyResult}
                disabled={!result}
                style={{
                  background: copied ? 'rgba(208,104,48,.25)' : '#D06830',
                  color:'#fff',border:'none',padding:'5px 14px',fontSize:10,fontWeight:700,
                  letterSpacing:'.07em',textTransform:'uppercase',borderRadius:3,cursor: result ? 'pointer' : 'not-allowed',
                  fontFamily:'inherit',opacity: result ? 1 : 0.4,
                }}>
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
              <button
                onClick={function(){ setResult(''); setCopied(false) }}
                style={{background:'transparent',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.4)',fontSize:10,padding:'5px 12px',borderRadius:3,cursor:'pointer',fontFamily:'inherit',letterSpacing:'.05em',textTransform:'uppercase'}}>
                Clear
              </button>
            </div>
          </div>
          {loading && !result && (
            <div style={{padding:'2.5rem',textAlign:'center'}}>
              <div style={{
                display:'inline-block',width:24,height:24,border:'3px solid rgba(208,104,48,.25)',
                borderTopColor:'#D06830',borderRadius:'50%',animation:'spin .7s linear infinite',marginBottom:12,
              }}/>
              <div style={{fontSize:12,color:'rgba(255,255,255,.35)'}}>Generating response…</div>
            </div>
          )}
          {result && (
            <div style={{padding:'1.5rem',fontSize:14,lineHeight:1.85,whiteSpace:'pre-wrap',color:'rgba(255,255,255,.85)',overflowY:'auto',maxHeight:600}}>
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── DALL-E image generator ────────────────────────────────────────────────────
function ImageTool() {
  var [prompt,   setPrompt]   = useState('')
  var [images,   setImages]   = useState([])   // [{ url, prompt, revisedPrompt, id }]
  var [loading,  setLoading]  = useState(false)
  var [error,    setError]    = useState('')

  function generate(customPrompt) {
    var p = (customPrompt || prompt).trim()
    if (!p) return
    setLoading(true); setError('')
    fetch('/api/generate-image', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({prompt:p}),
    }).then(function(r){return r.json()}).then(function(j){
      setLoading(false)
      if (j.error) { setError(j.error); return }
      setImages(function(prev){
        return [{ url:j.url, prompt:p, revisedPrompt:j.revisedPrompt, id:Date.now() }, ...prev]
      })
    }).catch(function(e){ setLoading(false); setError(e.message) })
  }

  function download(url, idx) {
    fetch(url)
      .then(function(r){ return r.blob() })
      .then(function(blob){
        var a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'spanglerbuilt-ad-' + idx + '.png'
        a.click()
      })
      .catch(function(){
        // Fallback: open in new tab if CORS blocks blob download
        window.open(url, '_blank')
      })
  }

  return (
    <div>
      {/* Preset prompts */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Quick presets</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {PRESETS.map(function(p,i){
            return (
              <button key={i} onClick={function(){ setPrompt(p); generate(p) }}
                disabled={loading}
                style={{
                  textAlign:'left',padding:'10px 14px',background:'#1a1a1a',
                  border:'1px solid rgba(255,255,255,.08)',borderLeft:'3px solid #D06830',
                  borderRadius:3,color:'rgba(255,255,255,.65)',fontSize:12,cursor:'pointer',
                  fontFamily:'inherit',lineHeight:1.5,opacity:loading?0.5:1,
                  transition:'background .15s',
                }}
                onMouseEnter={function(e){e.currentTarget.style.background='#222'}}
                onMouseLeave={function(e){e.currentTarget.style.background='#1a1a1a'}}
              >
                {p}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom prompt */}
      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem',marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Custom prompt</div>
        <textarea
          value={prompt}
          onChange={function(e){setPrompt(e.target.value)}}
          onKeyDown={function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate()}}}
          placeholder="Describe the image you want — e.g. Open-concept living room with coffered ceilings, hardwood floors, Atlanta luxury home"
          rows={3}
          style={{width:'100%',fontFamily:'inherit',fontSize:13,border:'1px solid rgba(255,255,255,.09)',borderRadius:3,padding:'10px',outline:'none',resize:'vertical',marginBottom:12,background:'#0d0d0d',color:'rgba(255,255,255,.75)',boxSizing:'border-box',lineHeight:1.6}}
        />
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={function(){generate()}} disabled={loading||!prompt.trim()} style={{background:'#D06830',color:'#fff',border:'none',padding:'10px 24px',fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'inherit',opacity:loading||!prompt.trim()?0.5:1}}>
            {loading ? 'Generating…' : 'Generate image'}
          </button>
          <span style={{fontSize:11,color:'rgba(255,255,255,.25)'}}>DALL-E 3 HD · 1792×1024</span>
        </div>
        {error && <div style={{marginTop:10,fontSize:12,color:'#e57373',background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.25)',padding:'8px 12px',borderRadius:3}}>{error}</div>}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'3rem',textAlign:'center',marginBottom:'1.25rem'}}>
          <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:8}}>Generating your image…</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>DALL-E 3 HD takes 10–20 seconds</div>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div>
          <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>
            Generated images ({images.length})
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(440px,1fr))',gap:14}}>
            {images.map(function(img, i){
              return (
                <div key={img.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
                  <img
                    src={img.url}
                    alt={img.prompt}
                    style={{width:'100%',display:'block',aspectRatio:'16/9',objectFit:'cover'}}
                  />
                  <div style={{padding:'12px 14px'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.45)',lineHeight:1.5,marginBottom:10}}>
                      {img.prompt}
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <button
                        onClick={function(){ download(img.url, images.length - i) }}
                        style={{background:'#D06830',color:'#fff',border:'none',padding:'7px 16px',fontSize:11,fontWeight:700,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}
                      >
                        Download
                      </button>
                      <button
                        onClick={function(){ setPrompt(img.prompt) }}
                        style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.4)',padding:'7px 14px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}
                      >
                        Re-use prompt
                      </button>
                      <button
                        onClick={function(){ generate(img.prompt) }}
                        disabled={loading}
                        style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.4)',padding:'7px 14px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit',opacity:loading?0.5:1}}
                      >
                        Regenerate
                      </button>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AIPage() {
  var [tab, setTab] = useState('claude')

  var tabs = [
    { id:'claude', label:'Claude — Documents & estimates' },
    { id:'images', label:'DALL-E 3 — Marketing images'   },
  ]

  return (
    <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>
          SPANGLERBUILT <span style={{fontSize:11,color:'#D06830',fontWeight:400}}>AI TOOLS</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>Back to dashboard</a>
      </div>

      <div style={{padding:'1.5rem',maxWidth:1600,margin:'0 auto'}}>
        {/* Tab switcher */}
        <div style={{display:'flex',gap:4,marginBottom:'1.5rem',background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:4,width:'fit-content'}}>
          {tabs.map(function(t){
            var active = tab === t.id
            return (
              <button key={t.id} onClick={function(){setTab(t.id)}} style={{
                padding:'8px 18px',fontSize:12,fontWeight:active?700:500,
                background:active?'#D06830':'transparent',
                color:active?'#fff':'rgba(255,255,255,.4)',
                border:'none',borderRadius:3,cursor:'pointer',fontFamily:'inherit',
                transition:'all .15s',whiteSpace:'nowrap',
              }}>{t.label}</button>
            )
          })}
        </div>

        {tab === 'claude' && <ClaudeTool />}
        {tab === 'images' && <ImageTool />}
      </div>
    </div>
  )
}
