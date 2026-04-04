import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

// ── Theme ─────────────────────────────────────────────────────────────────────
var C = {
  bg:     '#0d1117',
  card:   '#1a1f2e',
  acc:    '#FF8C00',
  border: 'rgba(255,140,0,0.2)',
  dimBorder: 'rgba(255,255,255,0.07)',
  text:   '#fff',
  muted:  'rgba(255,255,255,.45)',
  dim:    'rgba(255,255,255,.25)',
  inp:    '#0d1117',
}

var inp = {
  padding:'9px 11px', background:C.inp, border:'1px solid rgba(255,255,255,.1)',
  borderRadius:4, color:'rgba(255,255,255,.85)', fontSize:12, outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', width:'100%',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ls(key) {
  try { return localStorage.getItem(key) || '' } catch(e) { return '' }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, val) } catch(e) {}
}

function Badge({ ok }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      fontSize:10, fontWeight:700, letterSpacing:'.05em', textTransform:'uppercase',
      padding:'2px 8px', borderRadius:10,
      background: ok ? 'rgba(34,197,94,.1)' : 'rgba(255,255,255,.05)',
      color: ok ? '#22c55e' : 'rgba(255,255,255,.3)',
      border: '1px solid ' + (ok ? 'rgba(34,197,94,.25)' : 'rgba(255,255,255,.08)'),
    }}>
      {ok ? '✓ Saved' : 'Not set'}
    </span>
  )
}

// ── Social Channel Card ───────────────────────────────────────────────────────
function SocialCard({ color, platform, settingKey, placeholder, manageUrl, manageLabel, credentials, settings, onSave, onClear }) {
  var stored  = (settings && settings[settingKey]) || ''
  var [val,    setVal]    = useState(ls(settingKey) || stored)
  var [saving, setSaving] = useState(false)
  var [saved,  setSaved]  = useState(false)
  var [open,   setOpen]   = useState(false)   // advanced credentials section
  var [creds,  setCreds]  = useState({})
  var [savingCreds, setSavingCreds] = useState(false)

  // Sync from Supabase once loaded
  useEffect(function() {
    if (stored) { setVal(stored); lsSet(settingKey, stored) }
  }, [stored])

  // Init cred fields from settings
  useEffect(function() {
    if (!credentials || !settings) return
    var c = {}
    credentials.forEach(function(cr) { c[cr.key] = settings[cr.key] || ls(cr.key) || '' })
    setCreds(c)
  }, [settings])

  function handleSave() {
    if (!val.trim()) return
    setSaving(true)
    lsSet(settingKey, val.trim())
    fetch('/api/marketing/brand-settings', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ key: settingKey, value: val.trim() }),
    }).then(function(r){ return r.json() }).then(function(){
      setSaving(false); setSaved(true)
      onSave && onSave(settingKey, val.trim())
      setTimeout(function(){ setSaved(false) }, 2500)
    }).catch(function(){ setSaving(false) })
  }

  function handleClear() {
    lsSet(settingKey, '')
    setVal('')
    fetch('/api/marketing/brand-settings', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ key: settingKey, value: '' }),
    }).then(function(){ onClear && onClear(settingKey) }).catch(function(){})
  }

  function handleSaveCreds() {
    if (!credentials) return
    setSavingCreds(true)
    var promises = credentials.map(function(cr) {
      lsSet(cr.key, creds[cr.key] || '')
      return fetch('/api/marketing/brand-settings', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ key: cr.key, value: creds[cr.key] || '' }),
      })
    })
    Promise.all(promises).then(function(){
      setSavingCreds(false)
    }).catch(function(){ setSavingCreds(false) })
  }

  var isSaved = saved || (!!stored && stored === val)

  return (
    <div style={{ background:C.card, border:'1px solid ' + C.border, borderLeft:'4px solid ' + color, borderRadius:4, overflow:'hidden' }}>
      <div style={{padding:'14px 16px'}}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
          <div style={{fontSize:13, fontWeight:700, color:C.text}}>{platform}</div>
          <Badge ok={!!stored} />
        </div>

        {/* Input + Save */}
        <div style={{display:'flex', gap:6, marginBottom:6}}>
          <input
            value={val}
            onChange={function(e){ setVal(e.target.value) }}
            onKeyDown={function(e){ if(e.key==='Enter') handleSave() }}
            placeholder={placeholder}
            style={Object.assign({}, inp, {flex:1})}
          />
          <button onClick={handleSave} disabled={saving || !val.trim()}
            style={{background:C.acc, color:'#fff', border:'none', padding:'9px 14px', fontSize:11, fontWeight:700, borderRadius:4, cursor: val.trim() ? 'pointer' : 'not-allowed', whiteSpace:'nowrap', fontFamily:'inherit', opacity: val.trim() ? 1 : 0.5}}>
            {saving ? '…' : saved ? 'Saved ✓' : 'Save'}
          </button>
          {stored && (
            <button onClick={handleClear}
              style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', padding:'9px 12px', fontSize:11, borderRadius:4, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap'}}>
              Clear
            </button>
          )}
        </div>

        {/* Manage / open link */}
        {manageUrl && stored && (
          <a href={manageUrl} target="_blank" rel="noopener noreferrer"
            style={{fontSize:11, color:C.acc, textDecoration:'none'}}>
            {manageLabel || 'Open →'}
          </a>
        )}
      </div>

      {/* Advanced credentials */}
      {credentials && credentials.length > 0 && (
        <div style={{borderTop:'1px solid ' + C.dimBorder}}>
          <button onClick={function(){ setOpen(function(v){return !v}) }}
            style={{width:'100%', background:'transparent', border:'none', padding:'9px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontFamily:'inherit'}}>
            <span style={{fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em'}}>API Credentials</span>
            <span style={{fontSize:11, color:'rgba(255,255,255,.25)'}}>{open ? '▲' : '▼'}</span>
          </button>
          {open && (
            <div style={{padding:'10px 16px 14px', background:'rgba(0,0,0,.2)'}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,.3)', marginBottom:10, lineHeight:1.6}}>
                API credentials provided by Cari — required to enable direct publishing.
                {credentials[0].devLink && (
                  <> <a href={credentials[0].devLink} target="_blank" rel="noopener noreferrer" style={{color:C.acc}}>{credentials[0].devLink.replace('https://','')}</a></>
                )}
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {credentials.map(function(cr) {
                  return (
                    <div key={cr.key}>
                      <div style={{fontSize:9, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:3}}>{cr.label}</div>
                      <input
                        type={cr.secret ? 'password' : 'text'}
                        value={creds[cr.key] || ''}
                        onChange={function(e){ setCreds(function(prev){ var n=Object.assign({},prev); n[cr.key]=e.target.value; return n }) }}
                        placeholder={cr.placeholder || ''}
                        style={Object.assign({}, inp)}
                      />
                    </div>
                  )
                })}
              </div>
              <button onClick={handleSaveCreds} disabled={savingCreds}
                style={{marginTop:10, background:'rgba(255,140,0,.15)', border:'1px solid ' + C.border, color:C.acc, padding:'7px 14px', fontSize:11, fontWeight:700, borderRadius:3, cursor:'pointer', fontFamily:'inherit', opacity:savingCreds?.6:1}}>
                {savingCreds ? 'Saving…' : 'Save Credentials'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Video Publishing section ──────────────────────────────────────────────────
function VideoPublishing({ settings }) {
  var [dragging,  setDragging]  = useState(false)
  var [file,      setFile]      = useState(null)
  var [progress,  setProgress]  = useState(0)
  var [uploading, setUploading] = useState(false)
  var [videoUrl,  setVideoUrl]  = useState('')
  var [projType,  setProjType]  = useState('Basement')
  var [genLoading,setGenLoading]= useState(false)
  var [title,     setTitle]     = useState('')
  var [caption,   setCaption]   = useState('')
  var [desc,      setDesc]      = useState('')
  var [platforms, setPlatforms] = useState([])
  var [schedMode, setSchedMode] = useState('now')
  var [schedDate, setSchedDate] = useState('')
  var [schedTime, setSchedTime] = useState('09:00')
  var [publishing,setPublishing]= useState(false)
  var [posts,     setPosts]     = useState([])
  var [loadingPosts,setLoadingPosts] = useState(false)

  var PROJ_TYPES = ['Basement','Kitchen','Bathroom','Addition','Full Renovation','New Build','Other']

  var PLAT_LIST = [
    { id:'instagram', label:'Instagram Reels', handleKey:'instagram_handle' },
    { id:'tiktok',    label:'TikTok',          handleKey:'tiktok_handle'    },
    { id:'youtube',   label:'YouTube Shorts',  handleKey:'youtube_channel'  },
    { id:'facebook',  label:'Facebook Reels',  handleKey:'facebook_page'    },
  ]

  var BEST_TIMES = {
    instagram: 'Tue–Fri 9–11am or 7–9pm EST',
    tiktok:    'Tue–Thu 6–10pm EST',
    youtube:   'Fri–Sat 2–4pm EST',
    facebook:  'Tue–Thu 9am–12pm EST',
  }

  useEffect(function() {
    setLoadingPosts(true)
    fetch('/api/marketing/social-posts')
      .then(function(r){ return r.json() })
      .then(function(j){ setPosts(j.posts || []); setLoadingPosts(false) })
      .catch(function(){ setLoadingPosts(false) })
  }, [])

  function onDrop(e) {
    e.preventDefault(); setDragging(false)
    var f = e.dataTransfer?.files?.[0] || null
    if (f) setFile(f)
  }

  function onFileInput(e) {
    var f = e.target.files?.[0] || null
    if (f) setFile(f)
  }

  function uploadVideo() {
    if (!file) return
    setUploading(true); setProgress(0)

    fetch('/api/marketing/video-upload-url', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ filename: file.name }),
    }).then(function(r){ return r.json() }).then(function(j) {
      if (j.error) { setUploading(false); alert('Upload failed: ' + j.error); return }

      var xhr = new XMLHttpRequest()
      xhr.open('PUT', j.signedUrl)
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')

      xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
      xhr.onload = function() {
        setUploading(false)
        if (xhr.status >= 200 && xhr.status < 300) {
          setVideoUrl(j.publicUrl)
          setProgress(100)
        } else {
          alert('Upload error: ' + xhr.status)
        }
      }
      xhr.onerror = function() { setUploading(false); alert('Upload failed.') }
      xhr.send(file)
    }).catch(function(err) { setUploading(false); alert('Error: ' + err.message) })
  }

  function generateCaption() {
    setGenLoading(true)
    fetch('/api/marketing/generate-caption', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ projectType: projType }),
    }).then(function(r){ return r.json() }).then(function(j) {
      setGenLoading(false)
      if (j.title)   setTitle(j.title)
      if (j.caption) setCaption(j.caption)
      if (j.description) setDesc(j.description)
    }).catch(function(){ setGenLoading(false) })
  }

  function togglePlatform(id) {
    setPlatforms(function(prev) {
      return prev.includes(id) ? prev.filter(function(p){return p!==id}) : [...prev, id]
    })
  }

  function publish() {
    if (!videoUrl || platforms.length === 0) return
    setPublishing(true)
    var scheduledAt = null
    if (schedMode === 'schedule' && schedDate) {
      scheduledAt = new Date(schedDate + 'T' + schedTime + ':00').toISOString()
    }
    fetch('/api/marketing/social-posts', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        video_url: videoUrl, title, caption, description: desc,
        platforms, scheduled_at: scheduledAt, status: schedMode === 'now' ? 'published' : 'scheduled',
      }),
    }).then(function(r){ return r.json() }).then(function(j) {
      setPublishing(false)
      if (j.ok) {
        setPosts(function(prev){ return [{ id:j.id, video_url:videoUrl, title, caption, platforms, scheduled_at:scheduledAt, status: schedMode==='now'?'published':'scheduled', created_at:new Date().toISOString() }, ...prev] })
        // Reset
        setFile(null); setVideoUrl(''); setProgress(0); setTitle(''); setCaption(''); setDesc(''); setPlatforms([])
      }
    }).catch(function(){ setPublishing(false) })
  }

  var posted = posts
  var STATUS_COLORS = { scheduled:'#3b82f6', published:'#22c55e', failed:'#ef4444' }

  return (
    <div>
      <div style={{fontSize:10, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>
        Video Publishing
      </div>

      <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.5rem', marginBottom:'1rem'}}>

        {/* Upload */}
        <div style={{fontSize:11, fontWeight:700, color:C.acc, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10}}>1. Upload Video</div>

        {!videoUrl ? (
          <>
            <div
              onDragOver={function(e){e.preventDefault();setDragging(true)}}
              onDragLeave={function(){setDragging(false)}}
              onDrop={onDrop}
              onClick={function(){ document.getElementById('vid-input').click() }}
              style={{
                border:'2px dashed ' + (dragging ? C.acc : 'rgba(255,255,255,.12)'),
                borderRadius:4, padding:'2rem', textAlign:'center',
                cursor:'pointer', background: dragging ? 'rgba(255,140,0,.05)' : 'rgba(0,0,0,.2)',
                marginBottom:12, transition:'all .15s',
              }}>
              <div style={{fontSize:28, marginBottom:8}}>🎬</div>
              <div style={{fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:4}}>Drag & drop video or click to browse</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>MP4, MOV — up to 500MB</div>
              <input id="vid-input" type="file" accept=".mp4,.mov,video/mp4,video/quicktime" onChange={onFileInput} style={{display:'none'}}/>
            </div>

            {file && (
              <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
                <div style={{flex:1, fontSize:12, color:'rgba(255,255,255,.6)', background:'rgba(0,0,0,.3)', padding:'8px 12px', borderRadius:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                  {file.name} ({(file.size/1024/1024).toFixed(1)} MB)
                </div>
                <button onClick={uploadVideo} disabled={uploading}
                  style={{background:C.acc, color:'#fff', border:'none', padding:'9px 18px', fontSize:12, fontWeight:700, borderRadius:4, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', opacity:uploading?.6:1}}>
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            )}

            {uploading && (
              <div style={{marginBottom:12}}>
                <div style={{background:'rgba(0,0,0,.3)', borderRadius:4, height:8, overflow:'hidden'}}>
                  <div style={{height:'100%', background:C.acc, width:progress+'%', transition:'width .3s', borderRadius:4}}/>
                </div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.35)', marginTop:4, textAlign:'center'}}>{progress}%</div>
              </div>
            )}
          </>
        ) : (
          <div style={{display:'flex', alignItems:'center', gap:10, background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.2)', borderRadius:4, padding:'10px 14px', marginBottom:12}}>
            <span style={{fontSize:16}}>✓</span>
            <div style={{flex:1, fontSize:12, color:'#22c55e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{videoUrl.split('/').pop()}</div>
            <button onClick={function(){setVideoUrl('');setFile(null);setProgress(0)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.3)',fontSize:11,padding:'4px 10px',borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>Replace</button>
          </div>
        )}

        {/* Caption Generator */}
        <div style={{fontSize:11, fontWeight:700, color:C.acc, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10, marginTop:4}}>2. AI Caption Generator</div>
        <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:12, flexWrap:'wrap'}}>
          <select value={projType} onChange={function(e){setProjType(e.target.value)}}
            style={Object.assign({}, inp, {width:'auto', flex:1, minWidth:140, maxWidth:220})}>
            {PROJ_TYPES.map(function(t){ return <option key={t} value={t}>{t}</option> })}
          </select>
          <button onClick={generateCaption} disabled={genLoading}
            style={{background:'rgba(255,140,0,.15)', border:'1px solid ' + C.border, color:C.acc, padding:'9px 16px', fontSize:11, fontWeight:700, borderRadius:4, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', opacity:genLoading?.6:1}}>
            {genLoading ? 'Generating…' : '✦ Generate Caption'}
          </button>
        </div>
        {(title || caption || desc) && (
          <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:12}}>
            {[{label:'Title',val:title,set:setTitle},{label:'Caption',val:caption,set:setCaption},{label:'Description',val:desc,set:setDesc}].map(function(f){
              return (
                <div key={f.label}>
                  <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:3}}>{f.label}</div>
                  <textarea value={f.val} onChange={function(e){f.set(e.target.value)}} rows={f.label==='Description'?3:2}
                    style={Object.assign({},inp,{resize:'vertical',lineHeight:1.6})}/>
                </div>
              )
            })}
          </div>
        )}

        {/* Platform toggles */}
        <div style={{fontSize:11, fontWeight:700, color:C.acc, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10}}>3. Publish To</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:14}}>
          {PLAT_LIST.map(function(p) {
            var active  = platforms.includes(p.id)
            var handle  = settings && settings[p.handleKey]
            return (
              <div key={p.id} onClick={function(){togglePlatform(p.id)}}
                style={{
                  background: active ? 'rgba(255,140,0,.1)' : 'rgba(0,0,0,.2)',
                  border: '1px solid ' + (active ? C.border : 'rgba(255,255,255,.07)'),
                  borderRadius:4, padding:'10px 12px', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                }}>
                <div>
                  <div style={{fontSize:12, fontWeight:600, color: active ? C.acc : 'rgba(255,255,255,.6)'}}>{p.label}</div>
                  {handle && <div style={{fontSize:10, color:'rgba(255,255,255,.3)', marginTop:2}}>{handle}</div>}
                  {!handle && <div style={{fontSize:10, color:'rgba(255,255,255,.2)', marginTop:2}}>Not connected</div>}
                  {active && <div style={{fontSize:9, color:'rgba(255,255,255,.3)', marginTop:4}}>{BEST_TIMES[p.id]}</div>}
                </div>
                <div style={{width:20,height:20,borderRadius:'50%',border:'2px solid '+(active?C.acc:'rgba(255,255,255,.15)'),background:active?C.acc:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {active && <span style={{fontSize:11,color:'#fff',lineHeight:1}}>✓</span>}
                </div>
              </div>
            )
          })}
        </div>

        {/* Schedule */}
        <div style={{fontSize:11, fontWeight:700, color:C.acc, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:10}}>4. Schedule</div>
        <div style={{display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center'}}>
          {['now','schedule'].map(function(m){
            var active = schedMode===m
            return (
              <button key={m} onClick={function(){setSchedMode(m)}}
                style={{padding:'7px 16px',fontSize:11,fontWeight:600,border:'1px solid '+(active?C.border:'rgba(255,255,255,.1)'),background:active?'rgba(255,140,0,.1)':'transparent',color:active?C.acc:'rgba(255,255,255,.45)',borderRadius:4,cursor:'pointer',fontFamily:'inherit'}}>
                {m==='now' ? 'Post Now' : 'Schedule'}
              </button>
            )
          })}
          {schedMode==='schedule' && (
            <>
              <input type="date" value={schedDate} onChange={function(e){setSchedDate(e.target.value)}} style={Object.assign({},inp,{width:'auto'})}/>
              <input type="time" value={schedTime} onChange={function(e){setSchedTime(e.target.value)}} style={Object.assign({},inp,{width:'auto'})}/>
            </>
          )}
        </div>

        {/* Publish button */}
        <button onClick={publish} disabled={publishing || !videoUrl || platforms.length === 0}
          style={{background:videoUrl && platforms.length > 0 ? C.acc : 'rgba(255,140,0,.3)', color:'#fff', border:'none', padding:'11px 28px', fontSize:12, fontWeight:700, borderRadius:4, cursor: videoUrl && platforms.length > 0 ? 'pointer' : 'not-allowed', fontFamily:'inherit', opacity: publishing ? .6 : 1}}>
          {publishing ? 'Publishing…' : schedMode==='now' ? 'Publish Now' : 'Schedule Post'}
        </button>
        {(!videoUrl || platforms.length === 0) && (
          <div style={{fontSize:11, color:'rgba(255,255,255,.3)', marginTop:6}}>
            {!videoUrl ? 'Upload a video first.' : 'Select at least one platform.'}
          </div>
        )}
      </div>

      {/* Published posts log */}
      {posted.length > 0 && (
        <div style={{background:C.card, border:'1px solid ' + C.dimBorder, borderRadius:4, overflow:'hidden'}}>
          <div style={{padding:'10px 16px', borderBottom:'1px solid ' + C.dimBorder, fontSize:11, fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em'}}>
            Published Posts
          </div>
          {posted.map(function(post, i) {
            var statusColor = STATUS_COLORS[post.status] || '#666'
            return (
              <div key={post.id || i} style={{display:'grid', gridTemplateColumns:'48px 1fr auto auto', gap:12, padding:'10px 16px', borderBottom: i < posted.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none', alignItems:'center'}}>
                <div style={{width:48, height:36, background:'rgba(0,0,0,.4)', borderRadius:3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0}}>🎬</div>
                <div style={{overflow:'hidden'}}>
                  <div style={{fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{post.title || '(Untitled)'}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,.3)', marginTop:2, display:'flex', gap:6, flexWrap:'wrap'}}>
                    {(post.platforms||[]).map(function(p){
                      return <span key={p} style={{background:'rgba(255,255,255,.08)', padding:'1px 6px', borderRadius:10}}>{p}</span>
                    })}
                  </div>
                </div>
                <div style={{fontSize:11, color:'rgba(255,255,255,.3)', whiteSpace:'nowrap'}}>
                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'Now'}
                </div>
                <span style={{fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', padding:'3px 8px', borderRadius:10, background: statusColor + '22', color: statusColor, border:'1px solid ' + statusColor + '44', whiteSpace:'nowrap'}}>
                  {post.status}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MarketingChannels() {
  var [hubspotKey,  setHubspotKey]  = useState('')
  var [hubSaving,   setHubSaving]   = useState(false)
  var [hubSaved,    setHubSaved]    = useState(false)
  var [connected,   setConnected]   = useState(function(){ return ls('hubspot_connected') === 'true' })
  var [settings,    setSettings]    = useState({})
  var [loadingSet,  setLoadingSet]  = useState(true)
  var [userEmail,   setUserEmail]   = useState('')

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
      setUserEmail(a.email || '')
    } catch(e) { window.location.href = '/login' }

    // Load all brand_settings from Supabase
    fetch('/api/marketing/brand-settings')
      .then(function(r){ return r.json() })
      .then(function(d) {
        setLoadingSet(false)
        setSettings(d.settings || {})
        // HubSpot connected if token saved and non-empty
        var tok = (d.settings || {}).hubspot_token
        if (tok && tok.length > 10) { setConnected(true); lsSet('hubspot_connected', 'true') }
      })
      .catch(function(){ setLoadingSet(false) })

    // Also check HubSpot status endpoint
    fetch('/api/marketing/hubspot-status')
      .then(function(r){ return r.json() })
      .then(function(d){ if (d.connected) { setConnected(true); lsSet('hubspot_connected', 'true') } })
      .catch(function(){})
  }, [])

  function saveHubspot(e) {
    e.preventDefault()
    if (!hubspotKey.trim()) return
    setHubSaving(true)
    // Call existing hubspot-connect endpoint
    fetch('/api/marketing/hubspot-connect', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ apiKey: hubspotKey }),
    }).then(function(r){ return r.json() }).then(function(d) {
      setHubSaving(false)
      if (d.ok) {
        setHubSaved(true); setConnected(true)
        lsSet('hubspot_connected', 'true')
        // Also persist token to brand_settings
        fetch('/api/marketing/brand-settings', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ key:'hubspot_token', value: hubspotKey, updated_by: userEmail }),
        }).catch(function(){})
        setHubspotKey('')
      }
    }).catch(function(){ setHubSaving(false) })
  }

  function disconnectHubspot() {
    setConnected(false)
    lsSet('hubspot_connected', '')
    fetch('/api/marketing/brand-settings', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ key:'hubspot_token', value:'' }),
    }).catch(function(){})
  }

  function onSettingSave(key, val) {
    setSettings(function(prev){ var n=Object.assign({},prev); n[key]=val; return n })
  }
  function onSettingClear(key) {
    setSettings(function(prev){ var n=Object.assign({},prev); n[key]=''; return n })
  }

  var SOCIAL_CARDS = [
    {
      platform:'Instagram',
      color:'#E1306C',
      settingKey:'instagram_handle',
      placeholder:'@spanglerbuilt',
      credentials:[
        {key:'instagram_app_id',     label:'App ID',           secret:false, devLink:'https://developers.facebook.com'},
        {key:'instagram_app_secret', label:'App Secret',       secret:true  },
        {key:'instagram_page_token', label:'Page Access Token',secret:true  },
      ],
    },
    {
      platform:'Facebook',
      color:'#1877F2',
      settingKey:'facebook_page',
      placeholder:'SpanglerBuilt',
      credentials:[
        {key:'facebook_app_id',     label:'App ID',            secret:false, devLink:'https://developers.facebook.com'},
        {key:'facebook_app_secret', label:'App Secret',        secret:true  },
        {key:'facebook_page_token', label:'Page Access Token', secret:true  },
      ],
    },
    {
      platform:'Google Business',
      color:'#4285F4',
      settingKey:'google_business_url',
      placeholder:'https://business.google.com/...',
      manageUrl: settings.google_business_url || null,
      manageLabel:'Manage Reviews →',
      credentials:[
        {key:'google_client_id',     label:'Client ID (same as YouTube)',     secret:false, devLink:'https://console.cloud.google.com'},
        {key:'google_client_secret', label:'Client Secret (same as YouTube)', secret:true  },
      ],
    },
    {
      platform:'TikTok',
      color:'#010101',
      settingKey:'tiktok_handle',
      placeholder:'@spanglerbuilt',
      credentials:[
        {key:'tiktok_client_key',    label:'Client Key',    secret:false, devLink:'https://developers.tiktok.com'},
        {key:'tiktok_client_secret', label:'Client Secret', secret:true  },
      ],
    },
    {
      platform:'YouTube',
      color:'#FF0000',
      settingKey:'youtube_channel',
      placeholder:'https://youtube.com/@spanglerbuilt',
      credentials:[
        {key:'youtube_client_id',     label:'Client ID',     secret:false, devLink:'https://console.cloud.google.com'},
        {key:'youtube_client_secret', label:'Client Secret', secret:true  },
      ],
    },
  ]

  var inp2 = { width:'100%', padding:'10px 12px', background:'#1a1a1a', border:'1px solid rgba(255,255,255,.1)', borderRadius:4, color:'rgba(255,255,255,.8)', fontSize:13, outline:'none', boxSizing:'border-box' }

  return (
    <Layout>
      <div style={{maxWidth:1800, margin:'0 auto', padding:'1.5rem'}}>

        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Channels &amp; Integrations</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.5rem'}}>Connect your marketing platforms. All settings saved automatically.</div>

        {/* ── HubSpot ──────────────────────────────────────────────────────── */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>HubSpot CRM</div>
        <div style={{background:C.card, border:'1px solid ' + C.border, borderRadius:4, padding:'1.5rem', marginBottom:'1.5rem'}}>
          {connected ? (
            <div style={{display:'flex', alignItems:'center', gap:12, justifyContent:'space-between', flexWrap:'wrap'}}>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                <span style={{fontSize:20}}>✓</span>
                <div>
                  <div style={{fontSize:13, fontWeight:700, color:'#22c55e'}}>HubSpot connected</div>
                  <div style={{fontSize:12, color:'rgba(255,255,255,.4)'}}>Leads are syncing automatically as contacts and deals.</div>
                </div>
              </div>
              <button onClick={disconnectHubspot}
                style={{background:'transparent', border:'1px solid rgba(255,100,100,.3)', color:'rgba(255,100,100,.6)', fontSize:11, padding:'7px 14px', borderRadius:3, cursor:'pointer', fontFamily:'inherit'}}>
                Disconnect
              </button>
            </div>
          ) : (
            <form onSubmit={saveHubspot}>
              <div style={{fontSize:13, color:'rgba(255,255,255,.6)', marginBottom:12, lineHeight:1.7}}>
                Paste your HubSpot Private App token. In HubSpot: <strong style={{color:'rgba(255,255,255,.7)'}}>Settings → Integrations → Private Apps</strong> → create app with <code style={{background:'#0a0a0a', padding:'1px 5px', borderRadius:3, fontSize:12}}>crm.objects.contacts.write</code> scope.
              </div>
              <div style={{display:'flex', gap:10, alignItems:'flex-end', flexWrap:'wrap'}}>
                <div style={{flex:1, minWidth:200}}>
                  <label style={{display:'block', fontSize:11, fontWeight:600, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6}}>Private App Token</label>
                  <input type="password" value={hubspotKey} onChange={function(e){setHubspotKey(e.target.value)}} placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required style={inp2}/>
                </div>
                <button type="submit" disabled={hubSaving || !hubspotKey} style={{background:C.acc, color:'#fff', border:'none', padding:'10px 20px', fontSize:13, fontWeight:700, borderRadius:4, cursor:'pointer', whiteSpace:'nowrap', opacity:hubSaving||!hubspotKey?.5:1}}>
                  {hubSaving ? 'Connecting…' : 'Connect HubSpot'}
                </button>
              </div>
              {hubSaved && <div style={{marginTop:10, fontSize:12, color:'#22c55e'}}>Connected! New leads will now sync to HubSpot automatically.</div>}
            </form>
          )}
        </div>

        {/* ── Social Channels ───────────────────────────────────────────────── */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Social Channels</div>
        {loadingSet ? (
          <div style={{color:'rgba(255,255,255,.3)', fontSize:12, marginBottom:'1.5rem'}}>Loading settings…</div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12, marginBottom:'1.5rem'}}>
            {SOCIAL_CARDS.map(function(card) {
              return (
                <SocialCard
                  key={card.settingKey}
                  color={card.color}
                  platform={card.platform}
                  settingKey={card.settingKey}
                  placeholder={card.placeholder}
                  manageUrl={card.platform==='Google Business' ? (settings.google_business_url||null) : null}
                  manageLabel={card.manageLabel}
                  credentials={card.credentials}
                  settings={settings}
                  onSave={onSettingSave}
                  onClear={onSettingClear}
                />
              )
            })}
          </div>
        )}

        {/* ── Video Publishing ──────────────────────────────────────────────── */}
        <VideoPublishing settings={settings} />

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
