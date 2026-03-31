import { useState } from 'react'

var PROJECTS = [
  {
    id:1, pn:'SB-2026-001', client:'Ryan and Dori Mendel', type:'Basement',
    contract: 55394,
    milestones: [
      {label:'Deposit — contract signing',     pct:25, status:'paid',    date:'Mar 15'},
      {label:'Demo and framing complete',       pct:25, status:'paid',    date:'Mar 28'},
      {label:'Drywall and rough-ins complete',  pct:25, status:'due',     date:'Apr 10'},
      {label:'Paint, flooring and trim',        pct:20, status:'upcoming',date:'Apr 18'},
      {label:'Final punch list and closeout',   pct:5,  status:'upcoming',date:'Apr 22'},
    ]
  },
  {
    id:2, pn:'SB-2026-002', client:'John and Susan Park', type:'Kitchen',
    contract: 78200,
    milestones: [
      {label:'Deposit — contract signing',     pct:25, status:'paid',    date:'Mar 18'},
      {label:'Demo and framing complete',       pct:25, status:'due',     date:'Apr 1'},
      {label:'Drywall and rough-ins complete',  pct:25, status:'upcoming',date:'Apr 15'},
      {label:'Paint, flooring and trim',        pct:20, status:'upcoming',date:'Apr 25'},
      {label:'Final punch list and closeout',   pct:5,  status:'upcoming',date:'Apr 30'},
    ]
  },
  {
    id:3, pn:'SB-2026-003', client:'Tom and Wendy Harris', type:'Addition',
    contract: 148000,
    milestones: [
      {label:'Deposit — contract signing',     pct:25, status:'paid',    date:'Feb 9'},
      {label:'Foundation and framing',          pct:25, status:'paid',    date:'Mar 5'},
      {label:'Rough mechanicals and drywall',   pct:25, status:'paid',    date:'Mar 25'},
      {label:'Finishes and fixtures',           pct:20, status:'due',     date:'Apr 5'},
      {label:'Final punch list and closeout',   pct:5,  status:'upcoming',date:'Apr 20'},
    ]
  },
]

var STATUS_STYLE = {
  paid:    {bg:'#eaf3de',color:'#3B6D11',label:'Paid'},
  due:     {bg:'#fff3e0',color:'#e65100',label:'Due now'},
  upcoming:{bg:'#f5f4f1',color:'#9a9690',label:'Upcoming'},
}

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function PaymentsPage() {
  var [selected, setSelected] = useState(null)

  var totalPaid = PROJECTS.reduce(function(s,p){
    return s + p.milestones.filter(function(m){return m.status==='paid'}).reduce(function(ms,m){return ms+(p.contract*m.pct/100)},0)
  },0)
  var totalDue = PROJECTS.reduce(function(s,p){
    return s + p.milestones.filter(function(m){return m.status==='due'}).reduce(function(ms,m){return ms+(p.contract*m.pct/100)},0)
  },0)
  var totalContract = PROJECTS.reduce(function(s,p){return s+p.contract},0)

  return (
    <div style={{minHeight:'100vh',background:'#f5f4f1',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#FF8C00',letterSpacing:'.1em',textTransform:'uppercase'}}>· Payment Tracker</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'1.5rem'}}>

        {/* Summary metrics */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            ['Total contract value', fmt(totalContract), '#002147'],
            ['Collected to date',    fmt(totalPaid),     '#3B6D11'],
            ['Due right now',        fmt(totalDue),      '#e65100'],
            ['Active projects',      PROJECTS.length,    '#002147'],
          ].map(function(item){return(
            <div key={item[0]} style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,padding:'.75rem 1rem',borderTop:'3px solid '+item[2]}}>
              <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{item[0]}</div>
              <div style={{fontSize:20,fontWeight:500,color:item[2]}}>{item[1]}</div>
            </div>
          )})}
        </div>

        {/* Due now alert */}
        {totalDue > 0 && (
          <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'#3d3b37',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span><strong style={{color:'#002147'}}>Action needed:</strong> {fmt(totalDue)} is due right now across {PROJECTS.filter(function(p){return p.milestones.some(function(m){return m.status==='due'})}).length} projects</span>
            <span style={{fontSize:11,color:'#FF8C00',fontWeight:500}}>Send invoices ↓</span>
          </div>
        )}

        {/* Project payment cards */}
        {PROJECTS.map(function(project){
          var paid     = project.milestones.filter(function(m){return m.status==='paid'}).reduce(function(s,m){return s+(project.contract*m.pct/100)},0)
          var due      = project.milestones.filter(function(m){return m.status==='due'}).reduce(function(s,m){return s+(project.contract*m.pct/100)},0)
          var paidPct  = Math.round((paid/project.contract)*100)
          var isOpen   = selected===project.id

          return (
            <div key={project.id} style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',marginBottom:10}}>
              {/* Project header */}
              <div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',borderBottom:isOpen?'1px solid #e8e6e0':'none'}} onClick={function(){setSelected(isOpen?null:project.id)}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:'#002147',marginBottom:2}}>{project.client}</div>
                  <div style={{fontSize:11,color:'#9a9690'}}>{project.pn} · {project.type} · {fmt(project.contract)}</div>
                </div>
                <div style={{display:'flex',gap:16,alignItems:'center'}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:10,color:'#9a9690',marginBottom:2}}>Collected</div>
                    <div style={{fontSize:14,fontWeight:500,color:'#3B6D11'}}>{fmt(paid)}</div>
                  </div>
                  {due > 0 && (
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'#9a9690',marginBottom:2}}>Due now</div>
                      <div style={{fontSize:14,fontWeight:500,color:'#e65100'}}>{fmt(due)}</div>
                    </div>
                  )}
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:10,color:'#9a9690',marginBottom:4}}>{paidPct}% collected</div>
                    <div style={{width:80,height:6,background:'#f5f4f1',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:6,width:paidPct+'%',background:'#3B6D11',borderRadius:3}}/>
                    </div>
                  </div>
                  <span style={{color:'#9a9690',fontSize:12}}>{isOpen?'▲':'▼'}</span>
                </div>
              </div>

              {/* Milestone breakdown */}
              {isOpen && (
                <div>
                  {project.milestones.map(function(m,i){
                    var amount = project.contract * m.pct / 100
                    var sc     = STATUS_STYLE[m.status]
                    return (
                      <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 1.25rem',borderBottom:i<project.milestones.length-1?'1px solid #f5f4f1':'none',background:m.status==='due'?'#FFFCEB':'#fff'}}>
                        <div style={{display:'flex',gap:10,alignItems:'center',flex:1}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:m.status==='paid'?'#eaf3de':m.status==='due'?'#fff3e0':'#f5f4f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:sc.color,fontWeight:700,flexShrink:0}}>
                            {m.status==='paid'?'✓':m.pct+'%'}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:500,color:'#002147'}}>{m.label}</div>
                            <div style={{fontSize:10,color:'#9a9690'}}>{m.pct}% · {m.date}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:12,alignItems:'center'}}>
                          <span style={{fontSize:13,fontWeight:500,color:'#002147'}}>{fmt(amount)}</span>
                          <span style={{background:sc.bg,color:sc.color,fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:3}}>{sc.label}</span>
                          {m.status==='due' && (
                            <button style={{background:'#FF8C00',color:'#fff',border:'none',padding:'5px 12px',fontSize:10,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.06em'}}>
                              Send invoice
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div style={{marginTop:'1rem',fontSize:10,color:'#9a9690',textAlign:'center'}}>
          SpanglerBuilt Inc. · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </div>
  )
}
