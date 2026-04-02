import ClientNav from './_nav'
import { useState, useEffect } from 'react'

var DEMO_PHOTOS = [
  { id:1, phase:'Framing',        caption:'Perimeter walls framed — main living area',   date:'Mar 25', url:null },
  { id:2, phase:'Framing',        caption:'Bathroom rough framing complete',              date:'Mar 25', url:null },
  { id:3, phase:'Framing',        caption:'Bar area framing — cabinet backing installed', date:'Mar 24', url:null },
  { id:4, phase:'Demo',           caption:'Demo complete — slab prepped and cleared',     date:'Mar 18', url:null },
  { id:5, phase:'Demo',           caption:'Moisture barrier installed — east wall',       date:'Mar 17', url:null },
  { id:6, phase:'Pre-construction', caption:'Pre-demo conditions documented',             date:'Mar 10', url:null },
]

export default function PhotosPage() {
  var [photos,   setPhotos]   = useState(DEMO_PHOTOS)
  var [lightbox, setLightbox] = useState(null) // photo object or null

  // Replace DEMO_PHOTOS with real data: fetch('/api/projects/[id]/photos')
  // useEffect(function(){ fetch(...).then(r=>r.json()).then(d=>setPhotos(d.photos)) }, [])

  var phases = [...new Set(photos.map(function(p){ return p.phase }))]

  return (
    <div style={{minHeight:'100vh', background:'#111', fontFamily:'Poppins,sans-serif'}}>

      <ClientNav />

      <div style={{maxWidth:900, margin:'0 auto', padding:'1.5rem'}}>

        {/* Info banner */}
        <div style={{background:'rgba(208,104,48,.1)', border:'1px solid rgba(208,104,48,.35)', borderRadius:4, padding:'10px 14px', marginBottom:'1.25rem', fontSize:12, color:'rgba(255,255,255,.65)'}}>
          <strong style={{color:'#fff'}}>{photos.length} photos</strong> · Michael uploads new photos after each phase milestone. You'll be notified when new photos are added.
        </div>

        {/* Phase groups */}
        {phases.map(function(phase) {
          return (
            <div key={phase} style={{marginBottom:'1.75rem'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:'0.75rem'}}>
                <span style={{background:'rgba(208,104,48,.15)', color:'#D06830', fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:3, textTransform:'uppercase', letterSpacing:'.08em', border:'1px solid rgba(208,104,48,.3)'}}>
                  {phase}
                </span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0,1fr))', gap:10}}>
                {photos.filter(function(p){ return p.phase === phase }).map(function(photo) {
                  return (
                    <div key={photo.id}
                      onClick={function(){ setLightbox(photo) }}
                      style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden', cursor:'pointer', transition:'border-color .15s'}}
                      onMouseEnter={function(e){ e.currentTarget.style.borderColor = '#D06830' }}
                      onMouseLeave={function(e){ e.currentTarget.style.borderColor = 'rgba(255,255,255,.09)' }}
                    >
                      <div style={{height:140, background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                        {photo.url
                          ? <img src={photo.url} alt={photo.caption} style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                          : <div style={{textAlign:'center'}}>
                              <div style={{fontSize:28, color:'rgba(255,255,255,.15)', marginBottom:4}}>◉</div>
                              <div style={{fontSize:10, color:'rgba(255,255,255,.25)'}}>Photo {photo.id}</div>
                            </div>
                        }
                      </div>
                      <div style={{padding:'8px 10px'}}>
                        <div style={{fontSize:11, fontWeight:500, color:'rgba(255,255,255,.75)', marginBottom:2, lineHeight:1.4}}>{photo.caption}</div>
                        <div style={{fontSize:10, color:'rgba(255,255,255,.35)'}}>{photo.date}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        <div style={{marginTop:'1rem', fontSize:11, color:'rgba(255,255,255,.3)', textAlign:'center'}}>
          Photos added by SpanglerBuilt after each project milestone · (404) 492-7650
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={function(){ setLightbox(null) }}
          style={{position:'fixed', inset:0, background:'rgba(0,0,0,.92)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem'}}
        >
          <div onClick={function(e){ e.stopPropagation() }} style={{maxWidth:800, width:'100%'}}>
            <div style={{background:'#1a1a1a', borderRadius:6, overflow:'hidden', border:'1px solid rgba(255,255,255,.1)'}}>
              <div style={{height:460, background:'#0d0d0d', display:'flex', alignItems:'center', justifyContent:'center'}}>
                {lightbox.url
                  ? <img src={lightbox.url} alt={lightbox.caption} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'contain'}}/>
                  : <div style={{textAlign:'center', color:'rgba(255,255,255,.2)'}}>
                      <div style={{fontSize:48, marginBottom:8}}>◉</div>
                      <div style={{fontSize:12}}>Photo not yet available</div>
                    </div>
                }
              </div>
              <div style={{padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{fontSize:13, color:'rgba(255,255,255,.75)', fontWeight:500, marginBottom:4}}>{lightbox.caption}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{lightbox.phase} · {lightbox.date}</div>
                </div>
                <button onClick={function(){ setLightbox(null) }} style={{background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)', color:'rgba(255,255,255,.6)', fontSize:12, padding:'6px 16px', borderRadius:3, cursor:'pointer', fontFamily:'Poppins,sans-serif'}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
