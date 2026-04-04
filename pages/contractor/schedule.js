import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'

var DEFAULT_TASKS = [
  { id:'T1', name:'Pre-construction & permits',  start:'2026-04-07', end:'2026-04-18', progress:0, dependencies:'' },
  { id:'T2', name:'Demo & site prep',            start:'2026-04-21', end:'2026-04-25', progress:0, dependencies:'T1' },
  { id:'T3', name:'Framing & rough-ins',         start:'2026-04-28', end:'2026-05-09', progress:0, dependencies:'T2' },
  { id:'T4', name:'MEP rough (plumbing/elec)',   start:'2026-05-05', end:'2026-05-16', progress:0, dependencies:'T3' },
  { id:'T5', name:'Insulation & drywall',        start:'2026-05-19', end:'2026-05-30', progress:0, dependencies:'T4' },
  { id:'T6', name:'Paint & prime',               start:'2026-06-02', end:'2026-06-06', progress:0, dependencies:'T5' },
  { id:'T7', name:'Flooring & tile',             start:'2026-06-09', end:'2026-06-20', progress:0, dependencies:'T6' },
  { id:'T8', name:'Cabinets & millwork',         start:'2026-06-09', end:'2026-06-20', progress:0, dependencies:'T6' },
  { id:'T9', name:'Fixtures & finish MEP',       start:'2026-06-23', end:'2026-06-27', progress:0, dependencies:'T7' },
  { id:'T10',name:'Punch list & closeout',       start:'2026-06-30', end:'2026-07-03', progress:0, dependencies:'T9' },
]

export default function ContractorSchedule() {
  var ganttRef   = useRef(null)
  var ganttInst  = useRef(null)
  var [tasks,    setTasks]    = useState(DEFAULT_TASKS)
  var [saving,   setSaving]   = useState(false)
  var [saved,    setSaved]    = useState(false)
  var [projectId, setProjectId] = useState(null)
  var [projects,  setProjects]  = useState([])

  // Load projects for selector
  useEffect(function() {
    fetch('/api/leads/list')
      .then(function(r){ return r.json() })
      .then(function(d){ setProjects(d.projects || []) })
      .catch(function(){})
  }, [])

  // Load tasks when project changes
  useEffect(function() {
    if (!projectId) return
    fetch('/api/schedule?projectId=' + projectId)
      .then(function(r){ return r.json() })
      .then(function(d){
        if (d.tasks && d.tasks.length > 0) {
          setTasks(d.tasks.map(function(t){
            return { id:t.task_id, name:t.name, start:t.start_date, end:t.end_date, progress:t.progress, dependencies:t.dependencies||'' }
          }))
        } else {
          setTasks(DEFAULT_TASKS)
        }
      })
      .catch(function(){})
  }, [projectId])

  // Init / update Gantt
  useEffect(function() {
    if (typeof window === 'undefined' || !ganttRef.current) return

    import('frappe-gantt').then(function(mod) {
      var Gantt = mod.default || mod
      if (ganttInst.current) {
        ganttInst.current.refresh(tasks)
      } else {
        ganttInst.current = new Gantt(ganttRef.current, tasks, {
          view_mode:       'Week',
          date_format:     'YYYY-MM-DD',
          bar_height:      28,
          bar_corner_radius: 3,
          arrow_curve:     5,
          padding:         14,
          on_click:        function(task) {},
          on_date_change:  function(task, start, end) {
            setTasks(function(prev){
              return prev.map(function(t){
                return t.id === task.id ? Object.assign({},t,{start:fmt(start),end:fmt(end)}) : t
              })
            })
          },
          on_progress_change: function(task, progress) {
            setTasks(function(prev){
              return prev.map(function(t){
                return t.id === task.id ? Object.assign({},t,{progress:Math.round(progress)}) : t
              })
            })
          },
          custom_popup_html: function(task) {
            return '<div style="padding:8px 12px;background:#161616;border:1px solid rgba(255,255,255,.12);border-radius:4px;font-family:Poppins,sans-serif">' +
              '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:4px">' + task.name + '</div>' +
              '<div style="font-size:11px;color:rgba(255,255,255,.5)">' + task._start.toDateString() + ' → ' + task._end.toDateString() + '</div>' +
              '<div style="font-size:11px;color:#D06830;margin-top:3px">Progress: ' + task.progress + '%</div>' +
            '</div>'
          },
        })
      }
    }).catch(function(){})
  }, [tasks])

  function fmt(d) {
    if (!d) return ''
    var dt = new Date(d)
    return dt.getFullYear() + '-' + String(dt.getMonth()+1).padStart(2,'0') + '-' + String(dt.getDate()).padStart(2,'0')
  }

  function addTask() {
    var id  = 'T' + (tasks.length + 1 + Date.now())
    var today = fmt(new Date())
    var end   = fmt(new Date(Date.now() + 7*24*60*60*1000))
    setTasks(function(prev){ return [...prev, { id, name:'New task', start:today, end:end, progress:0, dependencies:'' }] })
  }

  function removeTask(id) {
    setTasks(function(prev){ return prev.filter(function(t){ return t.id !== id }) })
  }

  function updateTask(id, field, value) {
    setTasks(function(prev){
      return prev.map(function(t){ return t.id === id ? Object.assign({},t,{[field]:value}) : t })
    })
  }

  function save() {
    if (!projectId) { alert('Select a project first'); return }
    setSaving(true)
    fetch('/api/schedule', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ projectId, tasks }),
    }).then(function(r){ return r.json() }).then(function(){
      setSaving(false); setSaved(true)
      setTimeout(function(){ setSaved(false) }, 3000)
    }).catch(function(){ setSaving(false) })
  }

  var inp = { padding:'6px 8px', background:'#0d0d0d', border:'1px solid rgba(255,255,255,.08)', borderRadius:3, color:'rgba(255,255,255,.75)', fontSize:12, outline:'none', fontFamily:'inherit' }

  return (
    <Layout>
      <div style={{maxWidth:1200}}>

        {/* Header */}
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem', flexWrap:'wrap', gap:10}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>Project schedule</div>
            <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:3}}>Drag bars to adjust dates · drag right edge to resize · click bar to set progress</div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap'}}>
            <select value={projectId||''} onChange={function(e){setProjectId(e.target.value||null)}}
              style={Object.assign({},inp,{minWidth:200})}>
              <option value=''>— Select project —</option>
              {projects.map(function(p){
                return <option key={p.id} value={p.id}>{p.project_number} · {p.client_name}</option>
              })}
            </select>
            <button onClick={addTask} style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,.1)',color:'rgba(255,255,255,.6)',padding:'7px 14px',fontSize:12,borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>+ Add task</button>
            <button onClick={save} disabled={saving||!projectId} style={{background:'#D06830',color:'#fff',border:'none',padding:'7px 18px',fontSize:12,fontWeight:700,borderRadius:3,cursor:'pointer',fontFamily:'inherit',opacity:saving||!projectId?.5:1}}>
              {saving?'Saving…':saved?'Saved ✓':'Save schedule'}
            </button>
          </div>
        </div>

        {/* Gantt chart */}
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'1rem',marginBottom:'1.25rem',overflowX:'auto'}}>
          <style>{`
            .gantt .bar { fill: #D06830 !important; }
            .gantt .bar-progress { fill: #a04f1f !important; }
            .gantt .bar-label { fill: #fff !important; font-family: Poppins,sans-serif !important; font-size: 11px !important; }
            .gantt .grid-header { fill: #0a0a0a !important; }
            .gantt .grid-row { fill: #161616 !important; }
            .gantt .grid-row:nth-child(even) { fill: #141414 !important; }
            .gantt .row-line { stroke: rgba(255,255,255,.05) !important; }
            .gantt .tick { stroke: rgba(255,255,255,.08) !important; }
            .gantt .today-highlight { fill: rgba(208,104,48,.08) !important; }
            .gantt .lower-text, .gantt .upper-text { fill: rgba(255,255,255,.4) !important; font-family: Poppins,sans-serif !important; font-size: 11px !important; }
            .gantt .arrow { stroke: rgba(255,255,255,.2) !important; }
            .gantt-container { background: transparent !important; }
          `}</style>
          <div ref={ganttRef}/>
        </div>

        {/* Task table */}
        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 60px 140px 32px',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
            {['Task name','Start','End','%','Dependencies',''].map(function(h){
              return <div key={h} style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</div>
            })}
          </div>
          {tasks.map(function(t,i){
            return (
              <div key={t.id} style={{display:'grid',gridTemplateColumns:'1fr 120px 120px 60px 140px 32px',padding:'7px 14px',borderBottom:i<tasks.length-1?'1px solid rgba(255,255,255,.05)':'none',alignItems:'center',gap:6}}>
                <input value={t.name} onChange={function(e){updateTask(t.id,'name',e.target.value)}} style={Object.assign({},inp,{width:'100%'})}/>
                <input type="date" value={t.start} onChange={function(e){updateTask(t.id,'start',e.target.value)}} style={inp}/>
                <input type="date" value={t.end}   onChange={function(e){updateTask(t.id,'end',e.target.value)}}   style={inp}/>
                <input type="number" value={t.progress} min={0} max={100} onChange={function(e){updateTask(t.id,'progress',parseInt(e.target.value)||0)}} style={Object.assign({},inp,{width:'100%'})}/>
                <input value={t.dependencies} onChange={function(e){updateTask(t.id,'dependencies',e.target.value)}} placeholder="T1,T2" style={Object.assign({},inp,{width:'100%'})}/>
                <button onClick={function(){removeTask(t.id)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.2)',fontSize:16,cursor:'pointer',padding:0,lineHeight:1}}>×</button>
              </div>
            )
          })}
        </div>

      </div>
    </Layout>
  )
}
