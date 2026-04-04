// pages/contractor/projects/[id].js
// Project detail page with Presentation Book generator

import Layout from '../../../components/Layout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const TIER_COLOR = { good:'#27ae60', better:'#185FA5', best:'#6C3483', luxury:'#D06830' }
const TIER_LABEL = { good:'Good',    better:'Better',  best:'Best',    luxury:'Luxury'  }

const STATUS_BADGE = {
  new_lead:  { bg:'#fff3e0', color:'#e65100',  label:'New Lead'  },
  contacted: { bg:'#e3f2fd', color:'#0d47a1',  label:'Contacted' },
  estimate:  { bg:'#eeedfe', color:'#534AB7',  label:'Estimate'  },
  approved:  { bg:'#eaf3de', color:'#3B6D11',  label:'Approved'  },
  started:   { bg:'#e8f5e9', color:'#1b5e20',  label:'Started'   },
  completed: { bg:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.5)', label:'Completed' },
  lost:      { bg:'#fcebeb', color:'#c0392b',  label:'Lost'      },
}

export default function ProjectDetail() {
  const router  = useRouter()
  const { id }  = router.query

  const [project,   setProject]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [generating,setGenerating]= useState(false)
  const [genError,  setGenError]  = useState('')

  useEffect(function() {
    // Auth check
    try {
      var auth = JSON.parse(localStorage.getItem('sb_auth') || 'null')
      if (!auth || auth.role !== 'contractor') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login'; return }

    if (!id) return

    // Fetch project from leads API
    fetch('/api/leads/list')
      .then(function(r){ return r.json() })
      .then(function(json) {
        var found = (json.leads||[]).find(function(l){ return l.id === id || String(l.id) === String(id) })
        if (found) {
          setProject(found)
        } else {
          // Try to parse id as index fallback
          setProject(null)
        }
        setLoading(false)
      })
      .catch(function(){ setLoading(false) })
  }, [id])

  function generatePresentation() {
    if (!id) return
    setGenerating(true)
    setGenError('')

    fetch('/api/generate-presentation', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectId: id }),
    })
      .then(function(r) {
        if (!r.ok) return r.json().then(function(j){ throw new Error(j.error || 'Generation failed') })
        return r.blob()
      })
      .then(function(blob) {
        // Trigger browser download
        var url  = URL.createObjectURL(blob)
        var a    = document.createElement('a')
        var name = project ? project.name.trim().split(/\s+/).pop() : 'Client'
        a.href     = url
        a.download = 'SpanglerBuilt_' + name + '_PresentationBook.pptx'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setGenerating(false)
      })
      .catch(function(err) {
        setGenError(err.message)
        setGenerating(false)
      })
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Layout>
        <div style={{padding:'2rem', textAlign:'center', color:'rgba(255,255,255,.4)', fontSize:13}}>
          Loading project…
        </div>
      </Layout>
    )
  }

  // ── Not found — show mock if no Supabase project ────────────────────────────
  const proj = project || {
    id, pn: id,
    name:'Project',
    type:'Renovation',
    address:'',
    status:'estimate',
    value:0,
    note:'',
    email:'',
    phone:'',
  }

  const statusKey = (proj.status||'').toLowerCase().replace(/\s+/g,'_')
  const badge     = STATUS_BADGE[statusKey] || STATUS_BADGE.estimate
  const tierKey   = (proj.tier||'better').toLowerCase()
  const tierColor = TIER_COLOR[tierKey] || '#185FA5'

  return (
    <Layout>
      <div style={{maxWidth:1400, margin:'0 auto', padding:'1.5rem'}}>

        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:10}}>

          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <a href="/contractor/leads" style={{fontSize:11, color:'rgba(255,255,255,.35)', textDecoration:'none'}}>
              ← Projects
            </a>
            <span style={{color:'rgba(255,255,255,.15)'}}>|</span>
            <span style={{fontSize:13, fontWeight:600, color:'#FF8C00'}}>{proj.pn || id}</span>
            <span style={{background:badge.bg, color:badge.color, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:3}}>
              {badge.label}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <a href={'/contractor/estimate?id='+id} style={{
              display:'inline-flex', alignItems:'center', gap:5,
              background:'#1a1f2e', border:'1px solid rgba(255,255,255,.12)',
              color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:600,
              padding:'8px 14px', borderRadius:4, textDecoration:'none',
            }}>
              $ Estimate
            </a>
            <a href={'/client/project-book?id='+id} style={{
              display:'inline-flex', alignItems:'center', gap:5,
              background:'#1a1f2e', border:'1px solid rgba(255,255,255,.12)',
              color:'rgba(255,255,255,.7)', fontSize:11, fontWeight:600,
              padding:'8px 14px', borderRadius:4, textDecoration:'none',
            }}>
              ◻ Project Book
            </a>
            <button
              onClick={generatePresentation}
              disabled={generating}
              style={{
                display:'inline-flex', alignItems:'center', gap:6,
                background: generating ? '#b36200' : '#FF8C00',
                color:'#fff', border:'none',
                fontSize:12, fontWeight:700,
                padding:'8px 18px', borderRadius:4, cursor: generating ? 'default' : 'pointer',
                fontFamily:'inherit', letterSpacing:'.04em',
                opacity: generating ? 0.8 : 1,
                transition:'all .15s',
              }}
            >
              {generating ? (
                <>⏳ Generating…</>
              ) : (
                <>▶ Generate Presentation Book</>
              )}
            </button>
          </div>
        </div>

        {/* Generation error */}
        {genError && (
          <div style={{background:'rgba(192,57,43,.15)', border:'1px solid rgba(192,57,43,.3)', borderRadius:4, padding:'10px 14px', marginBottom:'1rem', fontSize:12, color:'#e57373'}}>
            ✗ {genError}
          </div>
        )}

        {/* ── Project header card ─────────────────────────────────────── */}
        <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderLeft:'4px solid #FF8C00', borderRadius:4, padding:'1.25rem 1.5rem', marginBottom:'1.25rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12}}>
            <div>
              <div style={{fontSize:22, fontWeight:700, color:'#fff', marginBottom:4}}>{proj.name}</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,.4)', marginBottom:2}}>{proj.type}{proj.address ? '  ·  ' + proj.address : ''}</div>
              {proj.email && <div style={{fontSize:11, color:'rgba(255,255,255,.3)'}}>{proj.email}{proj.phone ? '  ·  ' + proj.phone : ''}</div>}
            </div>
            <div style={{textAlign:'right'}}>
              {proj.value > 0 && (
                <>
                  <div style={{fontSize:9, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2}}>Contract value</div>
                  <div style={{fontSize:20, color:'#FF8C00', fontWeight:700}}>${Number(proj.value).toLocaleString()}</div>
                </>
              )}
              {proj.tier && (
                <div style={{display:'inline-block', marginTop:4, background:tierColor, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:3}}>
                  {TIER_LABEL[tierKey]||proj.tier} Tier
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────── */}
        <div className="sb-split" style={{gap:16}}>

          {/* Left: Notes / description */}
          <div className="sb-split-aside" style={{width:380}}>
            <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, padding:'1rem', marginBottom:12}}>
              <div style={{fontSize:10, fontWeight:600, color:'#FF8C00', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Project Notes</div>
              {proj.note ? (
                <div style={{fontSize:12, color:'rgba(255,255,255,.65)', lineHeight:1.7, whiteSpace:'pre-wrap'}}>{proj.note}</div>
              ) : (
                <div style={{fontSize:12, color:'rgba(255,255,255,.3)'}}>No notes on file.</div>
              )}
            </div>

            <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, padding:'1rem'}}>
              <div style={{fontSize:10, fontWeight:600, color:'#FF8C00', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8}}>Quick Links</div>
              {[
                { label:'Open Estimate',         href:'/contractor/estimate?id='+id },
                { label:'Selections',            href:'/contractor/selections' },
                { label:'Schedule',              href:'/contractor/schedule' },
                { label:'Payments',              href:'/contractor/payments' },
                { label:'Client Project Book',   href:'/client/project-book?id='+id },
                { label:'Material Catalog',      href:'/contractor/catalog' },
              ].map(function(link) {
                return (
                  <a key={link.href} href={link.href} style={{
                    display:'block', padding:'7px 0',
                    borderBottom:'1px solid rgba(255,255,255,.06)',
                    fontSize:12, color:'rgba(255,255,255,.6)', textDecoration:'none',
                  }}
                  onMouseEnter={function(e){e.currentTarget.style.color='#FF8C00'}}
                  onMouseLeave={function(e){e.currentTarget.style.color='rgba(255,255,255,.6)'}}
                  >
                    {link.label} →
                  </a>
                )
              })}
            </div>
          </div>

          {/* Right: Generate presentation CTA */}
          <div className="sb-split-main">
            <div style={{background:'#1a1f2e', border:'2px solid rgba(255,140,0,.3)', borderRadius:4, padding:'2rem', textAlign:'center', marginBottom:12}}>
              <div style={{fontSize:32, marginBottom:12}}>▶</div>
              <div style={{fontSize:18, fontWeight:700, color:'#fff', marginBottom:8}}>Presentation Book</div>
              <div style={{fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.7, marginBottom:'1.5rem', maxWidth:480, margin:'0 auto 1.5rem'}}>
                Generate a professional 11-slide PowerPoint presentation for this project including project scope, tier comparison, material selections, Gantt schedule, payment milestones, and next steps.
              </div>
              <button
                onClick={generatePresentation}
                disabled={generating}
                style={{
                  background: generating ? '#b36200' : '#FF8C00',
                  color:'#fff', border:'none',
                  fontSize:13, fontWeight:700,
                  padding:'13px 32px', borderRadius:4,
                  cursor: generating ? 'default' : 'pointer',
                  fontFamily:'inherit', letterSpacing:'.06em',
                  textTransform:'uppercase',
                  opacity: generating ? 0.8 : 1,
                }}
              >
                {generating ? '⏳  Generating Presentation…' : '▶  Generate Presentation Book (.pptx)'}
              </button>

              <div style={{marginTop:12, fontSize:11, color:'rgba(255,255,255,.3)'}}>
                Downloads instantly · Opens in PowerPoint or Google Slides
              </div>
            </div>

            {/* Slide preview list */}
            <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, padding:'1rem'}}>
              <div style={{fontSize:10, fontWeight:600, color:'#FF8C00', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Presentation includes</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:4}}>
                {[
                  'Slide 1 — Cover',
                  'Slide 2 — About SpanglerBuilt',
                  'Slide 3 — Project Scope',
                  'Slide 4 — Selection Tiers',
                  'Slide 5 — Flooring & Countertops',
                  'Slide 6 — Cabinets & Tile',
                  'Slide 7 — Project Schedule (Gantt)',
                  'Slide 8 — Reference Projects',
                  'Slide 9 — Investment Summary',
                  'Slide 10 — Payment Milestones',
                  'Slide 11 — Next Steps',
                ].map(function(sl) {
                  return (
                    <div key={sl} style={{fontSize:11, color:'rgba(255,255,255,.5)', padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,.05)'}}>
                      <span style={{color:'#FF8C00', marginRight:6}}>▪</span>{sl}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props:{} } }
