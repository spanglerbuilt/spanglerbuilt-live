import { useEffect, useState, useRef } from 'react'
import Layout from '../../components/Layout'

export default function ClientSchedule() {
  var ganttRef  = useRef(null)
  var ganttInst = useRef(null)
  var [tasks,   setTasks]   = useState([])
  var [loading, setLoading] = useState(true)
  var [error,   setError]   = useState('')

  useEffect(function() {
    if (typeof window === 'undefined') return
    try {
      var a = JSON.parse(localStorage.getItem('sb_auth') || '{}')
      if (!a.role) { window.location.href = '/login'; return }
      var projectId = a.project && a.project.id
      if (!projectId) { setLoading(false); setError('No project linked to your account.'); return }

      fetch('/api/schedule?projectId=' + projectId)
        .then(function(r){ return r.json() })
        .then(function(d){
          setLoading(false)
          if (d.tasks && d.tasks.length > 0) {
            setTasks(d.tasks.map(function(t){
              return { id:t.task_id, name:t.name, start:t.start_date, end:t.end_date, progress:t.progress, dependencies:t.dependencies||'' }
            }))
          }
        })
        .catch(function(e){ setLoading(false); setError(e.message) })
    } catch(e) { window.location.href = '/login' }
  }, [])

  useEffect(function() {
    if (typeof window === 'undefined' || !ganttRef.current || tasks.length === 0) return

    import('frappe-gantt').then(function(mod) {
      var Gantt = mod.default || mod
      if (ganttInst.current) {
        ganttInst.current.refresh(tasks)
      } else {
        ganttInst.current = new Gantt(ganttRef.current, tasks, {
          view_mode:    'Week',
          date_format:  'YYYY-MM-DD',
          bar_height:   26,
          bar_corner_radius: 3,
          padding:      12,
          readonly:     true,
          custom_popup_html: function(task) {
            return '<div style="padding:8px 12px;background:#161616;border:1px solid rgba(255,255,255,.12);border-radius:4px;font-family:Poppins,sans-serif">' +
              '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:4px">' + task.name + '</div>' +
              '<div style="font-size:11px;color:rgba(255,255,255,.5)">' + task._start.toDateString() + ' → ' + task._end.toDateString() + '</div>' +
              '<div style="font-size:11px;color:#22c55e;margin-top:3px">Progress: ' + task.progress + '%</div>' +
            '</div>'
          },
        })
      }
    }).catch(function(){})
  }, [tasks])

  // Overall progress
  var pct = tasks.length ? Math.round(tasks.reduce(function(s,t){return s+t.progress},0)/tasks.length) : 0

  return (
    <Layout>
      <div style={{maxWidth:1100}}>

        <div style={{marginBottom:'1.25rem'}}>
          <div style={{fontSize:20, fontWeight:700, color:'#fff'}}>Project schedule</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,.35)', marginTop:3}}>Your project timeline — updated by your SpanglerBuilt team.</div>
        </div>

        {loading && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)'}}>Loading schedule…</div>
          </div>
        )}

        {error && (
          <div style={{background:'rgba(192,57,43,.1)',border:'1px solid rgba(192,57,43,.25)',borderRadius:4,padding:'1rem 1.25rem',fontSize:13,color:'#e57373'}}>{error}</div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'3rem',textAlign:'center'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.3)'}}>Schedule not published yet.</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.2)',marginTop:6}}>Your SpanglerBuilt team will publish your project timeline here.</div>
          </div>
        )}

        {tasks.length > 0 && (
          <>
            {/* Overall progress */}
            <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderLeft:'4px solid #22c55e',borderRadius:4,padding:'1rem 1.25rem',marginBottom:'1.25rem',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:200}}>
                <div style={{fontSize:11,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>Overall project progress</div>
                <div style={{height:8,background:'rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{height:8,width:pct+'%',background:'#22c55e',borderRadius:4,transition:'width .3s'}}/>
                </div>
              </div>
              <div style={{fontSize:28,fontWeight:700,color:'#22c55e'}}>{pct}%</div>
            </div>

            {/* Gantt */}
            <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,padding:'1rem',marginBottom:'1.25rem',overflowX:'auto'}}>
              <style>{`
                .gantt .bar { fill: #22c55e !important; }
                .gantt .bar-progress { fill: #16a34a !important; }
                .gantt .bar-label { fill: #fff !important; font-family: Poppins,sans-serif !important; font-size: 11px !important; }
                .gantt .grid-header { fill: #0a0a0a !important; }
                .gantt .grid-row { fill: #161616 !important; }
                .gantt .grid-row:nth-child(even) { fill: #141414 !important; }
                .gantt .row-line { stroke: rgba(255,255,255,.05) !important; }
                .gantt .tick { stroke: rgba(255,255,255,.08) !important; }
                .gantt .today-highlight { fill: rgba(34,197,94,.08) !important; }
                .gantt .lower-text, .gantt .upper-text { fill: rgba(255,255,255,.4) !important; font-family: Poppins,sans-serif !important; font-size: 11px !important; }
                .gantt .arrow { stroke: rgba(255,255,255,.2) !important; }
                .gantt-container { background: transparent !important; }
              `}</style>
              <div ref={ganttRef}/>
            </div>

            {/* Task list */}
            <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.08)',borderRadius:4,overflow:'hidden'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 110px 110px 80px',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                {['Phase / Task','Start','End','Progress'].map(function(h){
                  return <div key={h} style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.3)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</div>
                })}
              </div>
              {tasks.map(function(t,i){
                var done = t.progress >= 100
                var inProg = t.progress > 0 && t.progress < 100
                var color = done ? '#22c55e' : inProg ? '#D06830' : 'rgba(255,255,255,.3)'
                return (
                  <div key={t.id} style={{display:'grid',gridTemplateColumns:'1fr 110px 110px 80px',padding:'10px 14px',borderBottom:i<tasks.length-1?'1px solid rgba(255,255,255,.05)':'none',alignItems:'center'}}>
                    <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{t.name}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{t.start}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>{t.end}</div>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div style={{flex:1,height:4,background:'rgba(255,255,255,.08)',borderRadius:2,overflow:'hidden'}}>
                        <div style={{height:4,width:t.progress+'%',background:color,borderRadius:2}}/>
                      </div>
                      <span style={{fontSize:10,color:color,fontWeight:600,width:28,textAlign:'right'}}>{t.progress}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
