import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var PRESETS = [
  'Professional kitchen remodel, modern design, high-end finishes, Atlanta home',
  'Luxury bathroom renovation, marble tile, custom vanity',
  'Finished basement with wet bar, home theater, LVP flooring',
  'Beautiful deck and outdoor living space, Atlanta Georgia',
  'Home addition, seamless exterior match, professional construction',
]

var COPY_ACTIONS = [
  { id:'google_ad',     label:'Google Ad',         placeholder:'Basement renovation, Metro Atlanta, $50K–$150K budget, targeting homeowners 35–60' },
  { id:'meta_ad',       label:'Meta / Instagram',  placeholder:'Before & after kitchen remodel, modern design, Cherokee County homeowners' },
  { id:'social_post',   label:'Social post',       placeholder:'Completed deck build in Woodstock GA, cedar decking, outdoor kitchen, firepit area' },
  { id:'email_blast',   label:'Email campaign',    placeholder:'Spring promotion — 10% off basement finishes booked before June 1st' },
  { id:'review_reply',  label:'Review reply',      placeholder:'5-star review: "Michael and his team were incredible. Our basement is stunning."' },
  { id:'nextdoor_post', label:'Nextdoor post',     placeholder:'Introducing SpanglerBuilt to the Woodstock neighborhood — licensed GC, 10+ years Metro Atlanta' },
]

var COPY_PROMPTS = {
  google_ad:     function(d){ return 'Write 3 Google Search Ad variants for SpanglerBuilt Inc.: ' + d + '. Each variant needs: Headline 1 (30 chars max), Headline 2 (30 chars max), Headline 3 (30 chars max), Description 1 (90 chars max), Description 2 (90 chars max). Label each variant clearly.' },
  meta_ad:       function(d){ return 'Write 2 Meta (Facebook/Instagram) ad variants for SpanglerBuilt Inc.: ' + d + '. Each needs: primary text (125 chars), headline (27 chars), description (27 chars), and a CTA suggestion. Make them scroll-stopping and local.' },
  social_post:   function(d){ return 'Write 3 social media post variants for SpanglerBuilt Inc.: ' + d + '. Include relevant hashtags for Metro Atlanta contractors. One short (under 100 chars), one medium (150–200 chars), one longer story format.' },
  email_blast:   function(d){ return 'Write a marketing email for SpanglerBuilt Inc.: ' + d + '. Include subject line, preview text, body (under 200 words), and a clear CTA. Warm but professional tone.' },
  review_reply:  function(d){ return 'Write a professional, warm response to this Google review for SpanglerBuilt Inc.: ' + d + '. Under 75 words. Thank them by name if mentioned, reinforce the quality, invite referrals.' },
  nextdoor_post: function(d){ return 'Write a Nextdoor neighborhood post for SpanglerBuilt Inc.: ' + d + '. Sound like a real neighbor, not an ad. Under 150 words. Include phone number (404) 492-7650 and website spanglerbuilt.com.' },
}

// ── Image generator ───────────────────────────────────────────────────────────
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
      body:JSON.stringify({prompt:p}),
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
      a.download = 'spanglerbuilt-' + idx + '.png'
      a.click()
    }).catch(function(){ window.open(url,'_blank') })
  }

  var ta = {width:'100%',fontFamily:'inherit',fontSize:13,border:'1px solid rgba(255,255,255,.09)',borderRadius:3,padding:'10px',outline:'none',resize:'vertical',background:'#0d0d0d',color:'rgba(255,255,255,.75)',boxSizing:'border-box',lineHeight:1.6}

  return (
    <div>
      {/* Presets */}
      <div style={{marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Quick presets — click to generate</div>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {PRESETS.map(function(p,i){
            return (
              <button key={i} onClick={function(){setPrompt(p);generate(p)}} disabled={loading}
                style={{textAlign:'left',padding:'9px 14px',background:'#1a1a1a',border:'1px solid rgba(255,255,255,.07)',borderLeft:'3px solid #D06830',borderRadius:3,color:'rgba(255,255,255,.6)',fontSize:12,cursor:'pointer',fontFamily:'inherit',lineHeight:1.5,opacity:loading?.5:1}}
                onMouseEnter={function(e){e.currentTarget.style.background='#222'}}
                onMouseLeave={function(e){e.currentTarget.style.background='#1a1a1a'}}
              >{p}</button>
            )
          })}
        </div>
      </div>

      {/* Custom prompt */}
      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.25rem',marginBottom:'1.25rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Custom prompt</div>
        <textarea value={prompt} onChange={function(e){setPrompt(e.target.value)}}
          onKeyDown={function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate()}}}
          placeholder="Describe the scene — e.g. Open-concept living room, coffered ceilings, hardwood floors, Atlanta luxury home"
          rows={3} style={Object.assign({},ta,{marginBottom:12})}/>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={function(){generate()}} disabled={loading||!prompt.trim()} style={{background:'#D06830',color:'#fff',border:'none',padding:'10px 22px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'inherit',opacity:loading||!prompt.trim()?.5:1}}>
            {loading ? 'Generating…' : 'Generate image'}
          </button>
          <span style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>DALL-E 3 HD · 1792×1024 · ~15 sec</span>
        </div>
        {error && <div style={{marginTop:10,fontSize:12,color:'#e57373',background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.25)',padding:'8px 12px',borderRadius:3}}>{error}</div>}
      </div>

      {loading && (
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.07)',borderRadius:4,padding:'2.5rem',textAlign:'center',marginBottom:'1.25rem'}}>
          <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:6}}>Generating your image…</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>DALL-E 3 HD takes 10–20 seconds</div>
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:10}}>Generated ({images.length})</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(420px,1fr))',gap:12}}>
            {images.map(function(img,i){
              return (
                <div key={img.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
                  <img src={img.url} alt={img.prompt} style={{width:'100%',display:'block',aspectRatio:'16/9',objectFit:'cover'}}/>
                  <div style={{padding:'10px 12px'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)',lineHeight:1.5,marginBottom:8}}>{img.prompt}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      <button onClick={function(){download(img.url,images.length-i)}} style={{background:'#D06830',color:'#fff',border:'none',padding:'6px 14px',fontSize:11,fontWeight:700,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>Download</button>
                      <button onClick={function(){setPrompt(img.prompt)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.4)',padding:'6px 12px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>Re-use prompt</button>
                      <button onClick={function(){generate(img.prompt)}} disabled={loading} style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.4)',padding:'6px 12px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit',opacity:loading?.5:1}}>Regenerate</button>
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

// ── Copy generator ────────────────────────────────────────────────────────────
function CopyTool() {
  var [action,  setAction]  = useState('google_ad')
  var [brief,   setBrief]   = useState('')
  var [result,  setResult]  = useState('')
  var [loading, setLoading] = useState(false)

  var current = COPY_ACTIONS.find(function(a){return a.id===action}) || COPY_ACTIONS[0]

  function generate() {
    if (!brief.trim()) return
    setLoading(true); setResult('')
    fetch('/api/claude', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ action:'proposal', data:{ prompt: COPY_PROMPTS[action](brief) } }),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || 'No response')
      setLoading(false)
    }).catch(function(e){ setResult('Error: '+e.message); setLoading(false) })
  }

  var ta = {width:'100%',fontFamily:'inherit',fontSize:13,border:'1px solid rgba(255,255,255,.09)',borderRadius:3,padding:'10px',outline:'none',resize:'vertical',background:'#0d0d0d',color:'rgba(255,255,255,.75)',boxSizing:'border-box',lineHeight:1.6}

  return (
    <div>
      {/* Format selector */}
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
        {COPY_ACTIONS.map(function(a){
          var active = action===a.id
          return (
            <button key={a.id} onClick={function(){setAction(a.id);setResult('')}} style={{
              padding:'6px 14px',fontSize:11,fontWeight:active?700:500,border:'1px solid',fontFamily:'inherit',
              cursor:'pointer',borderRadius:3,
              borderColor:active?'#D06830':'rgba(255,255,255,.1)',
              background:active?'rgba(208,104,48,.15)':'#1a1a1a',
              color:active?'#D06830':'rgba(255,255,255,.45)',
            }}>{a.label}</button>
          )
        })}
      </div>

      <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.25rem',marginBottom:'1rem'}}>
        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Campaign brief</div>
        <textarea value={brief} onChange={function(e){setBrief(e.target.value)}}
          onKeyDown={function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate()}}}
          placeholder={current.placeholder}
          rows={3} style={Object.assign({},ta,{marginBottom:12})}/>
        <button onClick={generate} disabled={loading||!brief.trim()} style={{background:'#D06830',color:'#fff',border:'none',padding:'10px 22px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'inherit',opacity:loading||!brief.trim()?.5:1}}>
          {loading ? 'Writing…' : 'Generate copy'}
        </button>
      </div>

      {result && (
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
          <div style={{background:'#0a0a0a',padding:'8px 1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{color:'#D06830',fontSize:12,fontWeight:500}}>Generated copy</span>
            <button onClick={function(){navigator.clipboard.writeText(result)}} style={{background:'transparent',border:'1px solid #333',color:'rgba(255,255,255,.35)',fontSize:10,padding:'2px 8px',cursor:'pointer',borderRadius:3,fontFamily:'inherit'}}>Copy all</button>
          </div>
          <div style={{padding:'1.25rem',fontSize:13,lineHeight:1.9,whiteSpace:'pre-wrap',color:'rgba(255,255,255,.65)',overflowY:'auto'}}>{result}</div>
        </div>
      )}
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
    { id:'images', label:'Image generator' },
    { id:'copy',   label:'Ad copy'         },
  ]

  return (
    <Layout>
      <div style={{maxWidth:1800,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>AI Creative Studio</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:3}}>Generate ad images and copy for every platform.</div>
        </div>

        {/* Tab switcher */}
        <div style={{display:'flex',gap:4,marginBottom:'1.5rem',background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:4,width:'fit-content'}}>
          {tabs.map(function(t){
            var active = tab===t.id
            return (
              <button key={t.id} onClick={function(){setTab(t.id)}} style={{
                padding:'8px 20px',fontSize:12,fontWeight:active?700:500,
                background:active?'#D06830':'transparent',
                color:active?'#fff':'rgba(255,255,255,.4)',
                border:'none',borderRadius:3,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',
              }}>{t.label}</button>
            )
          })}
        </div>

        {tab==='images' && <ImageTool />}
        {tab==='copy'   && <CopyTool  />}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
