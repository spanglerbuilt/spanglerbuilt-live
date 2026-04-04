import Layout from '../../components/Layout'
import { useEffect, useState, useRef } from 'react'

var COLUMNS = [
  { id: 'new_lead',      label: 'New Lead',      color: '#D06830' },
  { id: 'contacted',     label: 'Contacted',      color: '#4a9eff' },
  { id: 'proposal_sent', label: 'Proposal Sent',  color: '#a78bfa' },
  { id: 'in_progress',   label: 'In Progress',    color: '#22c55e' },
  { id: 'closed_won',    label: 'Closed Won',     color: '#16a34a' },
  { id: 'closed_lost',   label: 'Closed Lost',    color: 'rgba(255,255,255,.2)' },
]

export default function Pipeline() {
  var [projects,    setProjects]    = useState([])
  var [dragging,    setDragging]    = useState(null)  // { id, projectNumber, fromStatus }
  var [dragOver,    setDragOver]    = useState(null)  // column id
  var [saving,      setSaving]      = useState(null)  // project id being saved
  var dragItem = useRef(null)

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (a.role !== 'marketing') { window.location.href = '/login'; return }
    } catch(e) { window.location.href = '/login' }

    fetch('/api/leads/list')
      .then(function(r) { return r.json() })
      .then(function(d) { setProjects(d.projects || []) })
      .catch(function(){})
  }, [])

  function onDragStart(e, project) {
    dragItem.current = project
    setDragging(project.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragEnd() {
    setDragging(null)
    setDragOver(null)
    dragItem.current = null
  }

  function onDragOver(e, colId) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(colId)
  }

  function onDrop(e, newStatus) {
    e.preventDefault()
    var project = dragItem.current
    if (!project || project.status === newStatus) { onDragEnd(); return }

    // Optimistic update
    setProjects(function(prev) {
      return prev.map(function(p) { return p.id === project.id ? Object.assign({}, p, { status: newStatus }) : p })
    })
    setDragging(null)
    setDragOver(null)
    dragItem.current = null

    // Persist
    setSaving(project.id)
    fetch('/api/leads/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, projectNumber: project.project_number, status: newStatus }),
    })
      .then(function(r) { return r.json() })
      .then(function(d) {
        if (!d.ok) {
          // Revert on failure
          setProjects(function(prev) {
            return prev.map(function(p) { return p.id === project.id ? Object.assign({}, p, { status: project.status }) : p })
          })
        }
      })
      .catch(function() {
        setProjects(function(prev) {
          return prev.map(function(p) { return p.id === project.id ? Object.assign({}, p, { status: project.status }) : p })
        })
      })
      .finally(function() { setSaving(null) })
  }

  function cardsByStatus(statusId) {
    return projects.filter(function(p) { return (p.status || 'new_lead') === statusId })
  }

  return (
    <Layout>

      <div style={{padding:'1.5rem'}}>
        <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Lead pipeline</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginBottom:'1.25rem'}}>
          Drag cards to update stage — syncs to HubSpot automatically.
        </div>

        {/* Kanban board */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(6, minmax(180px, 1fr))', gap:10, overflowX:'auto', paddingBottom:'1rem'}}>
          {COLUMNS.map(function(col) {
            var cards  = cardsByStatus(col.id)
            var isOver = dragOver === col.id

            return (
              <div
                key={col.id}
                onDragOver={function(e) { onDragOver(e, col.id) }}
                onDragLeave={function()  { setDragOver(null) }}
                onDrop={function(e)      { onDrop(e, col.id) }}
                style={{
                  background:   isOver ? 'rgba(208,104,48,.08)' : '#161616',
                  border:       '1px solid ' + (isOver ? 'rgba(208,104,48,.4)' : 'rgba(255,255,255,.07)'),
                  borderTop:    '3px solid ' + col.color,
                  borderRadius: 4,
                  minHeight:    300,
                  transition:   'background .15s, border-color .15s',
                  display:      'flex',
                  flexDirection:'column',
                }}
              >
                {/* Column header */}
                <div style={{padding:'10px 12px 8px', borderBottom:'1px solid rgba(255,255,255,.06)', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <span style={{fontSize:11, fontWeight:700, color: col.color, textTransform:'uppercase', letterSpacing:'.07em'}}>{col.label}</span>
                  <span style={{fontSize:11, fontWeight:600, color:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.06)', borderRadius:10, padding:'1px 7px'}}>{cards.length}</span>
                </div>

                {/* Cards */}
                <div style={{padding:8, display:'flex', flexDirection:'column', gap:6, flex:1}}>
                  {cards.map(function(p) {
                    var isDragging = dragging === p.id
                    var isSaving   = saving   === p.id
                    return (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={function(e) { onDragStart(e, p) }}
                        onDragEnd={onDragEnd}
                        style={{
                          background:   isDragging ? '#0a0a0a' : '#0d0d0d',
                          border:       '1px solid rgba(255,255,255,.08)',
                          borderRadius: 4,
                          padding:      '10px 11px',
                          cursor:       'grab',
                          opacity:      isDragging ? .4 : 1,
                          transition:   'opacity .15s',
                          userSelect:   'none',
                        }}
                      >
                        <div style={{fontSize:12, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:3, lineHeight:1.3}}>
                          {p.client_name}
                        </div>
                        <div style={{fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:6, lineHeight:1.4}}>
                          {p.project_type}
                        </div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <span style={{fontSize:10, color:'rgba(255,255,255,.25)', fontFamily:'monospace'}}>{p.project_number}</span>
                          {isSaving
                            ? <span style={{fontSize:9, color:'#D06830'}}>saving…</span>
                            : <span style={{fontSize:10, color:'rgba(255,255,255,.2)'}}>
                                {new Date(p.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                              </span>
                          }
                        </div>
                      </div>
                    )
                  })}

                  {cards.length === 0 && (
                    <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'rgba(255,255,255,.15)', fontStyle:'italic', padding:'1rem 0'}}>
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div style={{marginTop:8, fontSize:11, color:'rgba(255,255,255,.2)'}}>
          {projects.length} total leads · drag a card to update its stage
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
