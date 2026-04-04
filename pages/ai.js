import { useState, useEffect } from 'react'

var ACTIONS = [
  {id:'estimate',    label:'Generate estimate'},
  {id:'proposal',    label:'Write proposal'},
  {id:'email',       label:'Draft email'},
  {id:'selections',  label:'Recommend materials'},
  {id:'contract',    label:'Generate contract'},
  {id:'changeOrder', label:'Change order'},
  {id:'clientChat',  label:'Client Q&A'},
  {id:'review',      label:'Review reply'},
  {id:'taskPlan',    label:'Task plan'},
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
  var [action,   setAction]   = useState('estimate')
  var [prompt,   setPrompt]   = useState('')
  var [result,   setResult]   = useState('')
  var [loading,  setLoading]  = useState(false)
  var [projects, setProjects] = useState([])
  var [selProj,  setSelProj]  = useState('')

  useEffect(function() {
    fetch('/api/leads/list')
      .then(function(r){ return r.json() })
      .then(function(j){
        var active = (j.leads || []).filter(function(l){
          return l.status !== 'Lost' && l.status !== 'Completed'
        })
        setProjects(active)
      })
      .catch(function(){})
  }, [])

  function onProjectSelect(e) {
    var pn = e.target.value
    setSelProj(pn)
    if (!pn) return
    var proj = projects.find(function(p){ return p.pn === pn })
    if (!proj) return
    var details = [
      'Project: ' + proj.pn,
      'Client: ' + proj.name,
      'Type: ' + proj.type,
      proj.address ? 'Address: ' + proj.address : '',
      proj.value  ? 'Budget: $' + Number(proj.value).toLocaleString() : '',
      proj.note   ? 'Notes: ' + proj.note : '',
    ].filter(Boolean).join('\n')
    setPrompt(details)
  }

  function run() {
    if (!prompt.trim()) return
    setLoading(true); setResult('')
    fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action, data:{prompt}}),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || 'No response')
      setLoading(false)
    }).catch(function(e){ setResult('Error: '+e.message); setLoading(false) })
  }

  function onKey(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run()} }

  return (
    <div>
      {/* Project selector */}
      {projects.length > 0 && (
        <div style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'12px 16px',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <span style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',whiteSpace:'nowrap'}}>Load project</span>
          <select value={selProj} onChange={onProjectSelect} style={{
            flex:1,minWidth:200,padding:'7px 10px',background:'#111',border:'1px solid rgba(255,255,255,.12)',
            borderRadius:3,color:'rgba(255,255,255,.75)',fontSize:12,fontFamily:'inherit',outline:'none',cursor:'pointer',
          }}>
            <option value=''>— Select a project to auto-fill —</option>
            {projects.map(function(p){
              return <option key={p.pn} value={p.pn}>{p.pn} · {p.name} · {p.type}</option>
            })}
          </select>
          {selProj && (
            <button onClick={function(){ setSelProj(''); setPrompt('') }}
              style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.35)',fontSize:11,padding:'5px 10px',borderRadius:3,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>
              Clear ✕
            </button>
          )}
        </div>
      )}

      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {ACTIONS.map(function(a){
          return (
            <button key={a.id} onClick={function(){setAction(a.id)}} style={{
              padding:'6px 14px',fontSize:11,border:'1px solid',fontFamily:'inherit',fontWeight:500,
              cursor:'pointer',borderRadius:3,
              borderColor:action===a.id?'#D06830':'rgba(255,255,255,.12)',
              background:action===a.id?'rgba(208,104,48,.15)':'#1a1a1a',
              color:action===a.id?'#D06830':'rgba(255,255,255,.5)',
            }}>{a.label}</button>
          )
        })}
      </div>

      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem',marginBottom:'1rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Describe your project</div>
        <textarea value={prompt} onChange={function(e){setPrompt(e.target.value)}} onKeyDown={onKey}
          placeholder="e.g. Basement renovation for SB-2026-001, 665 sf, full bathroom, custom bar, LVP flooring, Dunwoody GA, budget $50K–$100K."
          style={{width:'100%',fontFamily:'inherit',fontSize:13,border:'1px solid rgba(255,255,255,.09)',borderRadius:3,padding:'10px',minHeight:100,outline:'none',resize:'vertical',marginBottom:12,background:'#0d0d0d',color:'rgba(255,255,255,.75)',boxSizing:'border-box'}}/>
        <button onClick={run} disabled={loading||!prompt.trim()} style={{background:'#D06830',color:'#fff',border:'none',padding:'10px 24px',fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'inherit',opacity:loading||!prompt.trim()?0.5:1}}>
          {loading ? 'Claude is writing…' : 'Generate with Claude'}
        </button>
      </div>

      {result && (
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
          <div style={{background:'#0a0a0a',padding:'8px 1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{color:'#D06830',fontSize:12,fontWeight:500}}>Claude AI Output</span>
            <button onClick={function(){navigator.clipboard.writeText(result)}} style={{background:'transparent',border:'1px solid #333',color:'rgba(255,255,255,.35)',fontSize:10,padding:'2px 8px',cursor:'pointer',borderRadius:3,fontFamily:'inherit'}}>Copy</button>
          </div>
          <div style={{padding:'1.25rem',fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',color:'rgba(255,255,255,.65)',overflowY:'auto'}}>{result}</div>
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

      <div style={{padding:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
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
