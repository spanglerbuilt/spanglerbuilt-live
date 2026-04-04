import { useEffect, useState } from 'react'
import MarketingNav from './_nav'

var FOLDERS = [
  { id: 'Project Photos',   icon: '◉', desc: 'Before & after, in-progress shots' },
  { id: 'Brand Assets',     icon: '◈', desc: 'Logos, colors, fonts'              },
  { id: 'Brochures & PDFs', icon: '✦', desc: 'Service brochures, leave-behinds'  },
  { id: 'Social Content',   icon: '◻', desc: 'Posts, reels, stories'             },
  { id: 'Ad Creatives',     icon: '$', desc: 'Google, Meta, display ads'         },
]

var IMAGE_TYPES = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml']
var DOC_TYPES   = ['application/pdf','application/vnd.google-apps.document','application/vnd.google-apps.presentation','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']

function fileIcon(mimeType) {
  if (IMAGE_TYPES.includes(mimeType)) return '🖼'
  if (DOC_TYPES.includes(mimeType))   return '📄'
  if (mimeType.includes('video'))     return '🎬'
  if (mimeType.includes('folder'))    return '📁'
  return '📎'
}

function fileSize(bytes) {
  if (!bytes) return ''
  var b = parseInt(bytes)
  if (b > 1048576) return (b/1048576).toFixed(1) + ' MB'
  if (b > 1024)    return (b/1024).toFixed(0) + ' KB'
  return b + ' B'
}

export default function MarketingMaterials() {
  var [activeFolder, setActiveFolder] = useState('Project Photos')
  var [files,        setFiles]        = useState([])
  var [loading,      setLoading]      = useState(false)
  var [error,        setError]        = useState('')
  var [view,         setView]         = useState('grid')  // grid | list
  var [lightbox,     setLightbox]     = useState(null)
  var [uploading,    setUploading]    = useState(false)
  var [uploadMsg,    setUploadMsg]    = useState('')

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }
  }, [])

  useEffect(function() {
    loadFolder(activeFolder)
  }, [activeFolder])

  function loadFolder(folder) {
    setLoading(true); setError(''); setFiles([])
    fetch('/api/drive/files?folder=' + encodeURIComponent(folder))
      .then(function(r){ return r.json() })
      .then(function(d){
        setLoading(false)
        if (d.error) { setError(d.error); return }
        setFiles(d.files || [])
      })
      .catch(function(e){ setLoading(false); setError(e.message) })
  }

  var images = files.filter(function(f){ return IMAGE_TYPES.includes(f.mimeType) })
  var docs   = files.filter(function(f){ return !IMAGE_TYPES.includes(f.mimeType) })

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>
      <MarketingNav />

      {/* Lightbox */}
      {lightbox && (
        <div onClick={function(){setLightbox(null)}} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.92)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',cursor:'zoom-out'}}>
          <img src={lightbox.thumbnailLink ? lightbox.thumbnailLink.replace('=s220','=s1600') : ''} alt={lightbox.name}
            style={{maxWidth:'90vw',maxHeight:'85vh',objectFit:'contain',borderRadius:4,boxShadow:'0 8px 48px rgba(0,0,0,.6)'}}
            onClick={function(e){e.stopPropagation()}}
          />
          <div style={{position:'absolute',bottom:'1.5rem',left:0,right:0,textAlign:'center'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.7)',marginBottom:8}}>{lightbox.name}</div>
            <a href={lightbox.webViewLink} target="_blank" rel="noopener noreferrer"
              style={{background:'#D06830',color:'#fff',padding:'8px 18px',borderRadius:3,textDecoration:'none',fontSize:12,fontWeight:700,marginRight:8}}>
              Open in Drive
            </a>
            {lightbox.webContentLink && (
              <a href={lightbox.webContentLink} target="_blank" rel="noopener noreferrer"
                style={{background:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.7)',padding:'8px 18px',borderRadius:3,textDecoration:'none',fontSize:12}}>
                Download
              </a>
            )}
          </div>
          <button onClick={function(){setLightbox(null)}} style={{position:'absolute',top:'1.5rem',right:'1.5rem',background:'rgba(255,255,255,.1)',border:'none',color:'#fff',fontSize:20,width:40,height:40,borderRadius:'50%',cursor:'pointer'}}>×</button>
        </div>
      )}

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>Marketing materials</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:3}}>Pulled live from Google Drive · <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" style={{color:'#D06830',textDecoration:'none'}}>Open Drive ↗</a></div>
          </div>
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {uploadMsg && <span style={{fontSize:11,color:uploadMsg.startsWith('Error')?'#e57373':'#22c55e'}}>{uploadMsg}</span>}
            <label style={{padding:'6px 14px',background:'rgba(208,104,48,.15)',border:'1px solid rgba(208,104,48,.3)',color:'#D06830',borderRadius:3,cursor:'pointer',fontSize:12,fontWeight:600,opacity:uploading?.6:1}}>
              {uploading ? 'Uploading…' : '↑ Upload'}
              <input type="file" multiple style={{display:'none'}} disabled={uploading} onChange={function(e){
                var fileList = Array.from(e.target.files || [])
                if (!fileList.length) return
                setUploading(true); setUploadMsg('')
                Promise.all(fileList.map(function(file){
                  var fd = new FormData()
                  fd.append('file', file)
                  fd.append('folder', activeFolder)
                  return fetch('/api/drive/upload', { method:'POST', body:fd })
                    .then(function(r){ return r.json() })
                })).then(function(results){
                  setUploading(false)
                  var failed = results.filter(function(r){ return r.error })
                  if (failed.length) setUploadMsg('Error: ' + failed[0].error)
                  else { setUploadMsg(fileList.length + ' file' + (fileList.length>1?'s':'') + ' uploaded!'); loadFolder(activeFolder); setTimeout(function(){setUploadMsg('')},4000) }
                }).catch(function(err){ setUploading(false); setUploadMsg('Error: '+err.message) })
                e.target.value = ''
              }}/>
            </label>
            <button onClick={function(){setView('grid')}} style={{padding:'6px 12px',background:view==='grid'?'#D06830':'#1a1a1a',border:'1px solid',borderColor:view==='grid'?'#D06830':'rgba(255,255,255,.1)',color:view==='grid'?'#fff':'rgba(255,255,255,.4)',borderRadius:3,cursor:'pointer',fontSize:12}}>Grid</button>
            <button onClick={function(){setView('list')}} style={{padding:'6px 12px',background:view==='list'?'#D06830':'#1a1a1a',border:'1px solid',borderColor:view==='list'?'#D06830':'rgba(255,255,255,.1)',color:view==='list'?'#fff':'rgba(255,255,255,.4)',borderRadius:3,cursor:'pointer',fontSize:12}}>List</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:16,alignItems:'start'}}>

          {/* Folder sidebar */}
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
            {FOLDERS.map(function(f){
              var active = activeFolder === f.id
              return (
                <button key={f.id} onClick={function(){setActiveFolder(f.id)}} style={{
                  width:'100%',textAlign:'left',padding:'12px 14px',background:active?'rgba(208,104,48,.12)':'transparent',
                  borderBottom:'1px solid rgba(255,255,255,.05)',border:'none',
                  borderLeft: active ? '3px solid #D06830' : '3px solid transparent',
                  cursor:'pointer',fontFamily:'inherit',
                }}>
                  <div style={{fontSize:12,fontWeight:active?700:500,color:active?'#D06830':'rgba(255,255,255,.6)'}}>{f.id}</div>
                  <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginTop:2}}>{f.desc}</div>
                </button>
              )
            })}
          </div>

          {/* File area */}
          <div>
            {loading && (
              <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:13,color:'rgba(255,255,255,.4)'}}>Loading from Google Drive…</div>
              </div>
            )}

            {error && (
              <div style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.25)',borderRadius:4,padding:'1rem 1.25rem',marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:600,color:'#e57373',marginBottom:4}}>Drive not connected</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.5)',lineHeight:1.6}}>{error}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:8}}>
                  Share your <strong style={{color:'rgba(255,255,255,.5)'}}>SpanglerBuilt Marketing</strong> folder with{' '}
                  <code style={{background:'#0a0a0a',padding:'1px 6px',borderRadius:3,color:'#D06830'}}>portal-drive-reader@spanglerbuilt-live.iam.gserviceaccount.com</code>
                </div>
              </div>
            )}

            {!loading && !error && files.length === 0 && (
              <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
                <div style={{fontSize:13,color:'rgba(255,255,255,.3)'}}>No files in this folder yet.</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.2)',marginTop:6}}>Add files to the <strong style={{color:'rgba(255,255,255,.35)'}}>{activeFolder}</strong> folder in Google Drive.</div>
              </div>
            )}

            {/* Image grid */}
            {!loading && images.length > 0 && view === 'grid' && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Images ({images.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8}}>
                  {images.map(function(f){
                    return (
                      <div key={f.id} onClick={function(){setLightbox(f)}} style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden',cursor:'zoom-in',transition:'border-color .15s'}}
                        onMouseEnter={function(e){e.currentTarget.style.borderColor='rgba(208,104,48,.4)'}}
                        onMouseLeave={function(e){e.currentTarget.style.borderColor='rgba(255,255,255,.08)'}}>
                        {f.thumbnailLink
                          ? <img src={f.thumbnailLink.replace('=s220','=s400')} alt={f.name} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',display:'block'}}/>
                          : <div style={{width:'100%',aspectRatio:'4/3',background:'#0d0d0d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28}}>🖼</div>
                        }
                        <div style={{padding:'7px 9px'}}>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.5)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Docs / other files */}
            {!loading && (view === 'list' ? files : docs).length > 0 && (
              <div>
                {view === 'grid' && <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Documents & other files ({docs.length})</div>}
                <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
                  {(view === 'list' ? files : docs).map(function(f,i){
                    return (
                      <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 14px',borderBottom:i<(view==='list'?files:docs).length-1?'1px solid rgba(255,255,255,.05)':'none'}}>
                        <span style={{fontSize:18,flexShrink:0}}>{fileIcon(f.mimeType)}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,color:'rgba(255,255,255,.75)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.25)',marginTop:2}}>
                            {new Date(f.createdTime).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                            {f.size ? ' · ' + fileSize(f.size) : ''}
                          </div>
                        </div>
                        <div style={{display:'flex',gap:6,flexShrink:0}}>
                          <a href={f.webViewLink} target="_blank" rel="noopener noreferrer"
                            style={{background:'rgba(208,104,48,.15)',border:'1px solid rgba(208,104,48,.3)',color:'#D06830',fontSize:11,padding:'5px 10px',borderRadius:3,textDecoration:'none',fontWeight:600}}>
                            Open ↗
                          </a>
                          {f.webContentLink && (
                            <a href={f.webContentLink} target="_blank" rel="noopener noreferrer"
                              style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.4)',fontSize:11,padding:'5px 10px',borderRadius:3,textDecoration:'none'}}>
                              Download
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
