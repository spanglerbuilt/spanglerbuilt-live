import Layout from '../../components/Layout'
import { useState, useEffect } from 'react'

var TYPES = ['Basement','Kitchen','Bathroom','Addition','New Build']

var TAB_DESC = {
  'Basement':  'Section 3 — Unforeseen & Hidden Conditions (water intrusion, mold, radon, structural)',
  'Kitchen':   'Section 3 — Unforeseen & Hidden Conditions (subfloor, plumbing, load-bearing walls, asbestos)',
  'Bathroom':  'Section 3 — Unforeseen & Hidden Conditions (subfloor, shower pan, mold, GFCI)',
  'Addition':  'Section 3 — Unforeseen & Hidden Conditions (tie-in, soil/subsurface, permits, weather)',
  'New Build': 'Section 3 — Unforeseen Conditions (soil, weather, permits, engineering, contamination)',
}

export default function ContractTemplateAdmin() {
  var [activeTab, setActiveTab]   = useState('Basement')
  var [templates, setTemplates]   = useState({})  // { 'Basement': { section_3_text, version }, ... }
  var [saving,    setSaving]      = useState(false)
  var [saved,     setSaved]       = useState('')
  var [previewing,setPreviewing]  = useState(false)
  var [editText,  setEditText]    = useState('')

  useEffect(function() {
    try {
      var auth = JSON.parse(localStorage.getItem('sb_auth') || 'null')
      if (!auth || auth.role !== 'contractor') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login'; return }

    // Load all templates
    fetch('/api/contracts/templates')
      .then(function(r){ return r.json() })
      .then(function(j) {
        var map = {}
        ;(j.templates || []).forEach(function(t) { map[t.project_type] = t })
        setTemplates(map)
        // Set edit text for active tab
        if (map['Basement']) setEditText(map['Basement'].section_3_text || '')
      })
      .catch(function(){})
  }, [])

  // When tab changes, load text
  function switchTab(t) {
    setActiveTab(t)
    setSaved('')
    setEditText((templates[t] && templates[t].section_3_text) || '')
  }

  function save() {
    setSaving(true); setSaved('')
    fetch('/api/contracts/save-template', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectType: activeTab, section3Text: editText }),
    })
      .then(function(r){ return r.json() })
      .then(function(j) {
        setSaving(false)
        if (j.ok) {
          setSaved('Saved ✓ — v' + j.version)
          setTemplates(function(prev) {
            var next = Object.assign({}, prev)
            next[activeTab] = Object.assign({}, next[activeTab] || {}, { section_3_text: editText, version: j.version })
            return next
          })
        } else {
          setSaved('Error: ' + (j.error || 'Save failed'))
        }
      })
      .catch(function(){ setSaving(false); setSaved('Network error') })
  }

  function preview() {
    // Find a project ID to preview against, or use a dummy
    setPreviewing(true)
    // We'll just open a blank preview window with the HTML
    fetch('/api/contracts/preview', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectType: activeTab, section3Text: editText }),
    })
      .then(function(r){
        if (!r.ok) return r.json().then(function(j){ throw new Error(j.error || 'Preview failed') })
        return r.blob()
      })
      .then(function(blob) {
        setPreviewing(false)
        var url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      })
      .catch(function(err){ setPreviewing(false); alert(err.message) })
  }

  var tpl     = templates[activeTab]
  var version = tpl?.version || '—'

  function inp(extra) {
    return Object.assign({ padding:'7px 10px', background:'#0d0d0d', border:'1px solid rgba(255,255,255,.1)', borderRadius:3, color:'rgba(255,255,255,.8)', fontSize:12, outline:'none', fontFamily:'inherit' }, extra||{})
  }

  return (
    <Layout>
      <div style={{padding:'1.5rem', maxWidth:1400, margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.25rem', flexWrap:'wrap', gap:10}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Contract Templates</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>Edit Section 3 (project-type specific unforeseen conditions) for each contract type</div>
          </div>
          <a href="/contractor/contracts" style={{fontSize:11,color:'rgba(255,255,255,.4)',textDecoration:'none'}}>← All Contracts</a>
        </div>

        {/* Tabs */}
        <div style={{display:'flex', gap:4, marginBottom:'1.25rem', flexWrap:'wrap'}}>
          {TYPES.map(function(t) {
            var active = t === activeTab
            var tplData = templates[t]
            return (
              <button key={t} onClick={function(){ switchTab(t) }}
                style={{
                  padding:'8px 16px', fontSize:12, fontWeight: active?700:400, borderRadius:3, cursor:'pointer',
                  background: active ? '#FF8C00' : '#1a1f2e',
                  color:      active ? '#fff'    : 'rgba(255,255,255,.5)',
                  border:     active ? 'none'    : '1px solid rgba(255,255,255,.1)',
                  fontFamily: 'inherit',
                }}>
                {t}
                {tplData && <span style={{marginLeft:6, fontSize:9, opacity:.7}}>v{tplData.version}</span>}
              </button>
            )
          })}
        </div>

        {/* Edit panel */}
        <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, padding:'1.25rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:8}}>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:3}}>{activeTab} Contract — Section 3</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{TAB_DESC[activeTab]}</div>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:10, color:'rgba(255,255,255,.3)'}}>Version: {version}</span>
              {saved && (
                <span style={{fontSize:11, color: saved.includes('Error') ? '#e57373' : '#81c784', fontWeight:600}}>{saved}</span>
              )}
              <button onClick={preview} disabled={previewing}
                style={inp({background:'rgba(255,140,0,.1)',border:'1px solid rgba(255,140,0,.3)',color:'#FF8C00',fontWeight:600,cursor:previewing?'not-allowed':'pointer',opacity:previewing?.6:1})}>
                {previewing ? '⏳…' : '👁 Preview PDF'}
              </button>
              <button onClick={save} disabled={saving}
                style={inp({background:saving?'rgba(255,140,0,.4)':'#FF8C00',color:'#fff',border:'none',fontWeight:700,cursor:saving?'not-allowed':'pointer'})}>
                {saving ? 'Saving…' : 'Save Template'}
              </button>
            </div>
          </div>

          <div style={{fontSize:10, color:'rgba(255,255,255,.3)', marginBottom:8}}>
            This text is injected as Section 3 of the contract for all {activeTab} projects. Sections 1,2,4–12 and all Exhibits are identical across all contract types. Changes are versioned automatically.
          </div>

          <textarea
            value={editText}
            onChange={function(e){ setEditText(e.target.value); setSaved('') }}
            rows={30}
            style={{
              width:'100%', padding:'10px 12px',
              background:'#0a0a0a', border:'1px solid rgba(255,255,255,.1)',
              borderRadius:3, color:'rgba(255,255,255,.8)',
              fontSize:11.5, lineHeight:1.7, outline:'none',
              fontFamily:'Monaco,Consolas,"Courier New",monospace',
              resize:'vertical',
            }}
          />

          <div style={{marginTop:8, fontSize:10, color:'rgba(255,255,255,.25)', lineHeight:1.7}}>
            Plain text only. Paragraphs separated by blank lines become &lt;p&gt; tags. Subsection labels (3a., 3b., etc.) become bold headings. The Georgia Right to Repair Act notice at the end is required and should remain in each template.
          </div>
        </div>

        {/* All templates overview */}
        <div style={{marginTop:'1.5rem'}}>
          <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>All templates</div>
          <div style={{background:'#1a1f2e', border:'1px solid rgba(255,140,0,.2)', borderRadius:4, overflow:'hidden'}}>
            <div style={{display:'grid', gridTemplateColumns:'140px 1fr 80px 140px', gap:12, padding:'7px 1rem', background:'#111', fontSize:10, fontWeight:600, color:'#FF8C00', textTransform:'uppercase', letterSpacing:'.04em'}}>
              <span>Type</span><span>Template Name</span><span>Version</span><span>Status</span>
            </div>
            {TYPES.map(function(t, i) {
              var tplData = templates[t]
              return (
                <div key={t} onClick={function(){ switchTab(t) }} style={{
                  display:'grid', gridTemplateColumns:'140px 1fr 80px 140px',
                  gap:12, padding:'10px 1rem', alignItems:'center', fontSize:12,
                  borderTop: i===0?'none':'1px solid rgba(255,255,255,.06)',
                  cursor:'pointer', background: t===activeTab?'rgba(255,140,0,.06)':'transparent',
                }}>
                  <span style={{fontWeight:600, color: t===activeTab?'#FF8C00':'rgba(255,255,255,.7)'}}>{t}</span>
                  <span style={{color:'rgba(255,255,255,.5)'}}>{tplData?.name || t + ' Contract'}</span>
                  <span style={{color:'rgba(255,255,255,.35)'}}>{tplData?.version || '—'}</span>
                  <span>
                    {tplData
                      ? <span style={{background:'#eaf3de',color:'#3B6D11',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3}}>Active</span>
                      : <span style={{background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3}}>Not seeded</span>
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
