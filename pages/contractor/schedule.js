import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'

var WEEK_W  = 54   // px per week column
var ROW_H   = 40   // px per phase row
var LABEL_W = 192  // px for phase name column

var DEFAULT_PHASES = [
  { phase:'Demo & Site Prep',     start_week:0,  duration_weeks:1, color:'185FA5' },
  { phase:'Rough Framing',        start_week:1,  duration_weeks:2, color:'27AE60' },
  { phase:'MEP Rough-In',         start_week:2,  duration_weeks:3, color:'185FA5' },
  { phase:'Inspections',          start_week:4,  duration_weeks:1, color:'FF8C00' },
  { phase:'Insulation & Drywall', start_week:5,  duration_weeks:2, color:'D06830' },
  { phase:'Finishes & Tile',      start_week:6,  duration_weeks:3, color:'27AE60' },
  { phase:'Fixtures & Trim',      start_week:8,  duration_weeks:2, color:'8E44AD' },
  { phase:'Punch List',           start_week:10, duration_weeks:1, color:'E74C3C' },
]

var COLOR_OPTS = [
  {label:'Blue',    val:'185FA5'},
  {label:'Green',   val:'27AE60'},
  {label:'Orange',  val:'D06830'},
  {label:'Amber',   val:'FF8C00'},
  {label:'Purple',  val:'8E44AD'},
  {label:'Red',     val:'E74C3C'},
  {label:'Teal',    val:'16A085'},
  {label:'Gray',    val:'566573'},
]

function addDays(base, days) {
  var d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
}

function todayStr() {
  var d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
}

function inp(extra) {
  return Object.assign({ padding:'5px 7px', background:'#0d0d0d', border:'1px solid rgba(255,255,255,.1)', borderRadius:3, color:'rgba(255,255,255,.85)', fontSize:12, outline:'none', fontFamily:'inherit' }, extra || {})
}

export default function ContractorSchedule() {
  var [projects,   setProjects]   = useState([])
  var [projectId,  setProjectId]  = useState('')
  var [phases,     setPhases]     = useState([])
  var [editMode,   setEditMode]   = useState(false)
  var [editRow,    setEditRow]    = useState(null)   // id of row being edited inline
  var [saving,     setSaving]     = useState(false)
  var [saved,      setSaved]      = useState(false)
  var [loading,    setLoading]    = useState(false)
  var [startDate,  setStartDate]  = useState(todayStr)
  var nextId = useRef(1)

  // ── Load projects ─────────────────────────────────────────────────────────────
  useEffect(function() {
    fetch('/api/projects/list')
      .then(function(r){ return r.json() })
      .then(function(j){ setProjects(j.projects || []) })
      .catch(function(){})
  }, [])

  // ── Load phases when project changes ─────────────────────────────────────────
  useEffect(function() {
    if (!projectId) { setPhases([]); return }
    setLoading(true)
    fetch('/api/schedule/project-schedule?projectId=' + projectId)
      .then(function(r){ return r.json() })
      .then(function(j){
        setLoading(false)
        var loaded = (j.phases || []).map(function(p, i) {
          return Object.assign({}, p, { _id: i + 1 })
        })
        if (loaded.length > 0) {
          nextId.current = loaded.length + 1
          setPhases(loaded)
        } else {
          setPhases([])
        }
      })
      .catch(function(){ setLoading(false) })
  }, [projectId])

  // ── Derived totals ─────────────────────────────────────────────────────────
  var totalWeeks = phases.reduce(function(acc, p) {
    return Math.max(acc, (parseInt(p.start_week) || 0) + (parseInt(p.duration_weeks) || 1))
  }, 12)
  var displayWeeks = totalWeeks + 2  // buffer columns

  var estStart = startDate ? new Date(startDate + 'T00:00:00') : null
  var estEnd   = estStart  ? addDays(estStart, totalWeeks * 7) : null

  // ── Mutations ────────────────────────────────────────────────────────────────
  function seedDefaults() {
    var seeded = DEFAULT_PHASES.map(function(p, i) {
      return Object.assign({}, p, { _id: i + 1 })
    })
    nextId.current = seeded.length + 1
    setPhases(seeded)
  }

  function addPhase() {
    var id = nextId.current++
    setPhases(function(prev) {
      var maxEnd = prev.reduce(function(acc, p) {
        return Math.max(acc, (parseInt(p.start_week)||0) + (parseInt(p.duration_weeks)||1))
      }, 0)
      return [...prev, { _id:id, phase:'New Phase', start_week:maxEnd, duration_weeks:2, color:'566573' }]
    })
    setEditRow(id)
  }

  function deletePhase(id) {
    setPhases(function(prev){ return prev.filter(function(p){ return p._id !== id }) })
    if (editRow === id) setEditRow(null)
  }

  function updatePhase(id, field, val) {
    setPhases(function(prev) {
      return prev.map(function(p) {
        return p._id === id ? Object.assign({}, p, {[field]: val}) : p
      })
    })
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  function save() {
    if (!projectId) return
    setSaving(true)
    fetch('/api/schedule/project-schedule', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({ projectId, phases }),
    }).then(function(r){ return r.json() }).then(function() {
      setSaving(false); setSaved(true)
      setTimeout(function(){ setSaved(false) }, 3000)
    }).catch(function(){ setSaving(false) })
  }

  // ── Calendar ICS export ──────────────────────────────────────────────────────
  function syncCalendar() {
    if (!estStart || phases.length === 0) return
    fetch('/api/calendar/sync', {
      method:  'POST',
      headers: {'Content-Type':'application/json'},
      body:    JSON.stringify({
        projectId,
        projectName: selProject ? (selProject.project_number + ' — ' + selProject.client_name) : 'SpanglerBuilt Project',
        startDate,
        phases,
      }),
    })
    .then(function(r){ return r.blob() })
    .then(function(blob) {
      var a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'SpanglerBuilt_Schedule.ics'
      a.click()
    })
    .catch(function(){})
  }

  // ── CSV export ───────────────────────────────────────────────────────────────
  function exportCSV() {
    var rows = [['Phase','Start Week','End Week','Duration (weeks)','Est. Start Date','Est. End Date']]
    phases.forEach(function(p) {
      var sw = parseInt(p.start_week) || 0
      var dw = parseInt(p.duration_weeks) || 1
      var ew = sw + dw
      var es = estStart ? fmtDate(addDays(estStart, sw * 7)) : ''
      var ee = estStart ? fmtDate(addDays(estStart, ew * 7)) : ''
      rows.push([p.phase, sw + 1, ew, dw, es, ee])
    })
    var csv = rows.map(function(r){
      return r.map(function(c){ return '"' + String(c).replace(/"/g, '""') + '"' }).join(',')
    }).join('\n')
    var blob = new Blob([csv], {type:'text/csv'})
    var a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'schedule.csv'
    a.click()
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  var selProject = projects.find(function(p){ return p.id === projectId })

  return (
    <Layout>
      <div style={{maxWidth:2000}}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:10}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff'}}>Project Schedule</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:2}}>Week-based Gantt · drag to edit · save when done</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <select value={projectId} onChange={function(e){setProjectId(e.target.value)}}
              style={inp({minWidth:220,padding:'7px 10px'})}>
              <option value=''>— Select project —</option>
              {projects.map(function(p){
                var tier  = p.selected_tier ? ' — ' + p.selected_tier : ''
                var label = (p.project_number || p.id.slice(0,8)) + ' — ' + (p.client_name || 'Unknown') + tier
                return <option key={p.id} value={p.id}>{label}</option>
              })}
            </select>
            <label style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'rgba(255,255,255,.4)'}}>
              Start
              <input type="date" value={startDate} onChange={function(e){setStartDate(e.target.value)}}
                style={inp({width:130})}/>
            </label>
            {phases.length > 0 && (
              <button onClick={function(){ setEditMode(function(v){ return !v }) }}
                style={{background:editMode?'rgba(208,104,48,.2)':'#1a1a1a',border:'1px solid',borderColor:editMode?'#D06830':'rgba(255,255,255,.1)',color:editMode?'#D06830':'rgba(255,255,255,.5)',padding:'7px 14px',fontSize:11,fontWeight:600,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                {editMode ? 'Done Editing' : 'Edit Mode'}
              </button>
            )}
            {editMode && (
              <button onClick={addPhase}
                style={{background:'#161616',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.6)',padding:'7px 14px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                + Add Phase
              </button>
            )}
            {phases.length > 0 && estStart && (
              <button onClick={syncCalendar}
                style={{background:'#161616',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',padding:'7px 14px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                📅 Sync Calendar
              </button>
            )}
            {phases.length > 0 && (
              <button onClick={exportCSV}
                style={{background:'#161616',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)',padding:'7px 14px',fontSize:11,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                Export CSV
              </button>
            )}
            <button onClick={save} disabled={saving || !projectId || phases.length === 0}
              style={{background:saving||!projectId||phases.length===0?'rgba(208,104,48,.35)':'#D06830',color:'#fff',border:'none',padding:'7px 18px',fontSize:11,fontWeight:700,borderRadius:3,cursor:saving||!projectId||phases.length===0?'not-allowed':'pointer',fontFamily:'inherit'}}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Schedule'}
            </button>
          </div>
        </div>

        {/* ── Summary strip ──────────────────────────────────────────────────── */}
        {phases.length > 0 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'10px 16px',marginBottom:'1rem',display:'flex',gap:24,flexWrap:'wrap',alignItems:'center'}}>
            {selProject && (
              <div>
                <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Project</span>
                <div style={{fontSize:13,color:'#fff',fontWeight:600,marginTop:1}}>{selProject.project_number || selProject.id.slice(0,8)} — {selProject.client_name}</div>
              </div>
            )}
            <div>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Duration</span>
              <div style={{fontSize:13,color:'#fff',fontWeight:600,marginTop:1}}>{totalWeeks} weeks</div>
            </div>
            <div>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Est. Start</span>
              <div style={{fontSize:13,color:'#fff',fontWeight:600,marginTop:1}}>{estStart ? fmtDate(estStart) : '—'}</div>
            </div>
            <div>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Est. Completion</span>
              <div style={{fontSize:13,color:'#D06830',fontWeight:600,marginTop:1}}>{estEnd ? fmtDate(estEnd) : '—'}</div>
            </div>
            <div>
              <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.08em'}}>Phases</span>
              <div style={{fontSize:13,color:'#fff',fontWeight:600,marginTop:1}}>{phases.length}</div>
            </div>
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {!projectId && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.07)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:14,color:'rgba(255,255,255,.3)'}}>Select a project above to load or create its schedule.</div>
          </div>
        )}

        {projectId && loading && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.07)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.3)'}}>Loading schedule…</div>
          </div>
        )}

        {projectId && !loading && phases.length === 0 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.07)',borderRadius:4,padding:'2.5rem',textAlign:'center'}}>
            <div style={{fontSize:14,color:'rgba(255,255,255,.4)',marginBottom:16}}>No schedule yet for this project.</div>
            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <button onClick={seedDefaults}
                style={{background:'#D06830',color:'#fff',border:'none',padding:'9px 22px',fontSize:12,fontWeight:700,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                Seed Default Phases
              </button>
              <button onClick={addPhase}
                style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.6)',padding:'9px 20px',fontSize:12,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
                + Add Phase Manually
              </button>
            </div>
          </div>
        )}

        {/* ── Gantt chart ─────────────────────────────────────────────────────── */}
        {phases.length > 0 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden',marginBottom:'1rem'}}>

            <div style={{overflowX:'auto'}}>
              <div style={{minWidth: LABEL_W + displayWeeks * WEEK_W}}>

                {/* Week header row */}
                <div style={{display:'flex',borderBottom:'1px solid rgba(255,255,255,.08)',background:'#0f0f0f'}}>
                  <div style={{width:LABEL_W,minWidth:LABEL_W,padding:'8px 12px',fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em',borderRight:'1px solid rgba(255,255,255,.07)'}}>
                    Phase
                  </div>
                  {Array(displayWeeks).fill(0).map(function(_,w){
                    var weekNum = w + 1
                    var weekDate = estStart ? fmtDate(addDays(estStart, w * 7)).slice(0,6) : null
                    return (
                      <div key={w} style={{width:WEEK_W,minWidth:WEEK_W,flexShrink:0,borderRight:'1px solid rgba(255,255,255,.04)',textAlign:'center',padding:'4px 2px'}}>
                        <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.45)'}}>{weekNum}</div>
                        {weekDate && <div style={{fontSize:9,color:'rgba(255,255,255,.2)',marginTop:1}}>{weekDate}</div>}
                      </div>
                    )
                  })}
                </div>

                {/* Phase rows */}
                {phases.map(function(p, idx) {
                  var sw = parseInt(p.start_week)  || 0
                  var dw = parseInt(p.duration_weeks) || 1
                  var barLeft  = sw * WEEK_W
                  var barWidth = dw * WEEK_W
                  var hex = '#' + (p.color || 'D06830').replace('#','')
                  var isEditing = editRow === p._id

                  return (
                    <div key={p._id} style={{borderBottom: idx < phases.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none'}}>

                      {/* Main row */}
                      <div style={{display:'flex',alignItems:'center',height:ROW_H,background: idx%2===0 ? '#161616' : '#141414'}}>
                        {/* Phase label */}
                        <div style={{
                          width:LABEL_W,minWidth:LABEL_W,padding:'0 12px',
                          fontSize:12,color:'rgba(255,255,255,.75)',fontWeight:500,
                          borderRight:'1px solid rgba(255,255,255,.06)',
                          display:'flex',alignItems:'center',justifyContent:'space-between',gap:4,
                          overflow:'hidden',height:'100%',
                        }}>
                          <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{p.phase}</span>
                          {editMode && (
                            <div style={{display:'flex',gap:4,flexShrink:0}}>
                              <button onClick={function(){ setEditRow(isEditing ? null : p._id) }}
                                style={{background:'transparent',border:'1px solid rgba(255,255,255,.1)',color:isEditing?'#D06830':'rgba(255,255,255,.3)',fontSize:10,padding:'2px 6px',borderRadius:2,cursor:'pointer',fontFamily:'inherit'}}>
                                {isEditing ? 'Done' : 'Edit'}
                              </button>
                              <button onClick={function(){ deletePhase(p._id) }}
                                style={{background:'transparent',border:'none',color:'rgba(255,100,100,.5)',fontSize:15,cursor:'pointer',padding:'0 2px',lineHeight:1}}>
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Gantt bar area */}
                        <div style={{flex:1,height:'100%',position:'relative',overflow:'hidden'}}>
                          {/* Week grid lines */}
                          {Array(displayWeeks).fill(0).map(function(_,w){
                            return (
                              <div key={w} style={{
                                position:'absolute',left:w*WEEK_W,top:0,width:WEEK_W,height:'100%',
                                borderRight:'1px solid rgba(255,255,255,.03)',
                                background: w%2===0 ? 'transparent' : 'rgba(255,255,255,.015)',
                              }}/>
                            )
                          })}
                          {/* Bar */}
                          <div
                            title={p.phase + ' · Week ' + (sw+1) + '–' + (sw+dw) + ' (' + dw + 'w)'}
                            style={{
                              position:'absolute',
                              left:   barLeft + 3,
                              width:  Math.max(barWidth - 6, 8),
                              top:    6,
                              height: ROW_H - 12,
                              background: hex,
                              borderRadius: 4,
                              display:'flex',alignItems:'center',paddingLeft:8,
                              overflow:'hidden',
                              boxShadow: '0 1px 3px rgba(0,0,0,.4)',
                              cursor: editMode ? 'pointer' : 'default',
                              opacity: 0.92,
                            }}
                            onClick={function(){ if(editMode) setEditRow(isEditing ? null : p._id) }}>
                            <span style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.9)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                              {dw >= 2 ? p.phase : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Edit row (expanded below) */}
                      {isEditing && (
                        <div style={{background:'#0d0d0d',borderTop:'1px solid rgba(255,255,255,.06)',padding:'10px 14px',display:'flex',gap:12,flexWrap:'wrap',alignItems:'center'}}>
                          <label style={{display:'flex',flexDirection:'column',gap:3}}>
                            <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Phase Name</span>
                            <input value={p.phase} onChange={function(e){ updatePhase(p._id,'phase',e.target.value) }}
                              style={inp({width:200})}/>
                          </label>
                          <label style={{display:'flex',flexDirection:'column',gap:3}}>
                            <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Start Week</span>
                            <input type="number" min="0" value={sw} onChange={function(e){ updatePhase(p._id,'start_week', parseInt(e.target.value)||0) }}
                              style={inp({width:80})}/>
                          </label>
                          <label style={{display:'flex',flexDirection:'column',gap:3}}>
                            <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Duration (weeks)</span>
                            <input type="number" min="1" value={dw} onChange={function(e){ updatePhase(p._id,'duration_weeks', Math.max(1,parseInt(e.target.value)||1)) }}
                              style={inp({width:80})}/>
                          </label>
                          <label style={{display:'flex',flexDirection:'column',gap:3}}>
                            <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Color</span>
                            <select value={(p.color||'D06830').replace('#','')} onChange={function(e){ updatePhase(p._id,'color',e.target.value) }}
                              style={inp({width:110})}>
                              {COLOR_OPTS.map(function(c){
                                return <option key={c.val} value={c.val}>{c.label}</option>
                              })}
                            </select>
                          </label>
                          {estStart && (
                            <div style={{fontSize:11,color:'rgba(255,255,255,.4)',paddingTop:16}}>
                              {fmtDate(addDays(estStart, sw*7))} → {fmtDate(addDays(estStart, (sw+dw)*7))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}
