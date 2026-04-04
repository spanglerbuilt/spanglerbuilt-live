import Layout from '../../components/Layout'
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
  paid:    {bg:'rgba(80,160,60,.2)',color:'#7ec86a',label:'Paid'},
  due:     {bg:'rgba(208,104,48,.2)',color:'#D06830',label:'Due now'},
  upcoming:{bg:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)',label:'Upcoming'},
}

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function PaymentsPage() {
  var [selected,     setSelected]     = useState(null)
  var [invoiceFor,   setInvoiceFor]   = useState(null) // {project, milestone}
  var [copied,       setCopied]       = useState(false)
  var [markPaid,     setMarkPaid]     = useState({}) // {pn-idx: true}
  var [projects,     setProjects]     = useState(PROJECTS)

  var totalPaid = projects.reduce(function(s,p){
    return s + p.milestones.filter(function(m){return m.status==='paid'}).reduce(function(ms,m){return ms+(p.contract*m.pct/100)},0)
  },0)
  var totalDue = projects.reduce(function(s,p){
    return s + p.milestones.filter(function(m){return m.status==='due'}).reduce(function(ms,m){return ms+(p.contract*m.pct/100)},0)
  },0)
  var totalContract = projects.reduce(function(s,p){return s+p.contract},0)

  function openInvoice(project, milestone, idx) {
    setInvoiceFor({project, milestone, idx})
    setCopied(false)
  }

  function getInvoiceText(project, milestone) {
    var amount = project.contract * milestone.pct / 100
    return [
      'INVOICE — SPANGLERBUILT INC.',
      '44 Milton Ave, Suite 243 · Woodstock, GA 30188',
      '(404) 492-7650 · michael@spanglerbuilt.com',
      '',
      'Project: ' + project.pn + ' — ' + project.client,
      'Type: ' + project.type,
      'Contract total: ' + fmt(project.contract),
      '',
      'MILESTONE: ' + milestone.label,
      'Milestone: ' + milestone.pct + '% of contract',
      'Amount due: ' + fmt(amount),
      'Due date: ' + milestone.date,
      '',
      'Payment methods: Check payable to SpanglerBuilt Inc.',
      'or Zelle: michael@spanglerbuilt.com',
      '',
      'Thank you for your business.',
    ].join('\n')
  }

  function copyInvoice() {
    if (!invoiceFor) return
    var text = getInvoiceText(invoiceFor.project, invoiceFor.milestone)
    navigator.clipboard.writeText(text).then(function(){
      setCopied(true)
      setTimeout(function(){setCopied(false)}, 2500)
    })
  }

  function markAsPaid(projectId, milestoneIdx) {
    setProjects(projects.map(function(p) {
      if (p.id !== projectId) return p
      return {
        ...p,
        milestones: p.milestones.map(function(m, i) {
          if (i !== milestoneIdx) return m
          return {...m, status:'paid', date: new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}
        })
      }
    }))
    setInvoiceFor(null)
  }

  return (
    <Layout>

      {/* Invoice modal */}
      {invoiceFor && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,.85)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:'#161616',borderRadius:4,maxWidth:500,width:'100%',border:'3px solid #D06830',overflow:'hidden'}}>
            <div style={{background:'#0a0a0a',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D06830'}}>
              <span style={{color:'#D06830',fontSize:13,fontWeight:700}}>Invoice — {invoiceFor.project.pn}</span>
              <button onClick={()=>setInvoiceFor(null)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{background:'#1a1a1a',borderRadius:3,padding:'1rem',marginBottom:'1rem',fontFamily:'monospace',fontSize:12,whiteSpace:'pre-wrap',lineHeight:1.7,color:'rgba(255,255,255,.65)',maxHeight:280,overflowY:'auto'}}>
                {getInvoiceText(invoiceFor.project, invoiceFor.milestone)}
              </div>
              <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:3,padding:'8px 12px',marginBottom:'1rem',fontSize:12,color:'rgba(255,255,255,.65)'}}>
                <strong style={{color:'rgba(255,255,255,.75)'}}>{fmt(invoiceFor.project.contract * invoiceFor.milestone.pct / 100)}</strong> due by {invoiceFor.milestone.date} · {invoiceFor.milestone.pct}% milestone
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={copyInvoice} style={{flex:1,background:copied?'#3B6D11':'#D06830',color:'#fff',border:'none',padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.06em',textTransform:'uppercase',transition:'background .2s'}}>
                  {copied ? '✓ Copied to clipboard' : 'Copy invoice text'}
                </button>
                <button onClick={()=>markAsPaid(invoiceFor.project.id, invoiceFor.idx)} style={{background:'#0a0a0a',color:'#D06830',border:'none',padding:'10px 16px',fontSize:11,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                  Mark paid
                </button>
                <button onClick={()=>setInvoiceFor(null)} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'10px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#D06830',letterSpacing:'.1em',textTransform:'uppercase'}}>· Payment Tracker</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            ['Total contract value', fmt(totalContract), '#0a0a0a'],
            ['Collected to date',    fmt(totalPaid),     '#3B6D11'],
            ['Due right now',        fmt(totalDue),      '#e65100'],
            ['Active projects',      projects.length,    '#0a0a0a'],
          ].map(function(item){return(
            <div key={item[0]} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'.75rem 1rem',borderTop:'3px solid '+item[2]}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{item[0]}</div>
              <div style={{fontSize:20,fontWeight:500,color:item[2]}}>{item[1]}</div>
            </div>
          )})}
        </div>

        {totalDue > 0 && (
          <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'rgba(255,255,255,.65)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span><strong style={{color:'rgba(255,255,255,.75)'}}>Action needed:</strong> {fmt(totalDue)} is due right now across {projects.filter(function(p){return p.milestones.some(function(m){return m.status==='due'})}).length} projects</span>
            <span style={{fontSize:11,color:'#D06830',fontWeight:500}}>Send invoices ↓</span>
          </div>
        )}

        {projects.map(function(project){
          var paid    = project.milestones.filter(function(m){return m.status==='paid'}).reduce(function(s,m){return s+(project.contract*m.pct/100)},0)
          var due     = project.milestones.filter(function(m){return m.status==='due'}).reduce(function(s,m){return s+(project.contract*m.pct/100)},0)
          var paidPct = Math.round((paid/project.contract)*100)
          var isOpen  = selected===project.id

          return (
            <div key={project.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',marginBottom:10}}>
              <div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',borderBottom:isOpen?'1px solid #e8e6e0':'none'}} onClick={function(){setSelected(isOpen?null:project.id)}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.75)',marginBottom:2}}>{project.client}</div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{project.pn} · {project.type} · {fmt(project.contract)}</div>
                </div>
                <div style={{display:'flex',gap:16,alignItems:'center'}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:2}}>Collected</div>
                    <div style={{fontSize:14,fontWeight:500,color:'#3B6D11'}}>{fmt(paid)}</div>
                  </div>
                  {due > 0 && (
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:2}}>Due now</div>
                      <div style={{fontSize:14,fontWeight:500,color:'#e65100'}}>{fmt(due)}</div>
                    </div>
                  )}
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:4}}>{paidPct}% collected</div>
                    <div style={{width:80,height:6,background:'#1a1a1a',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:6,width:paidPct+'%',background:'#3B6D11',borderRadius:3}}/>
                    </div>
                  </div>
                  <span style={{color:'rgba(255,255,255,.35)',fontSize:12}}>{isOpen?'▲':'▼'}</span>
                </div>
              </div>

              {isOpen && (
                <div>
                  {project.milestones.map(function(m,i){
                    var amount = project.contract * m.pct / 100
                    var sc     = STATUS_STYLE[m.status]
                    return (
                      <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 1.25rem',borderBottom:i<project.milestones.length-1?'1px solid rgba(255,255,255,.07)':'none',background:m.status==='due'?'rgba(208,104,48,.1)':'#fff'}}>
                        <div style={{display:'flex',gap:10,alignItems:'center',flex:1}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:m.status==='paid'?'#eaf3de':m.status==='due'?'#fff3e0':'rgba(255,255,255,.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:sc.color,fontWeight:700,flexShrink:0}}>
                            {m.status==='paid'?'✓':m.pct+'%'}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{m.label}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>{m.pct}% · {m.date}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:12,alignItems:'center'}}>
                          <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{fmt(amount)}</span>
                          <span style={{background:sc.bg,color:sc.color,fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:3}}>{sc.label}</span>
                          {m.status==='due' && (
                            <button onClick={function(){openInvoice(project,m,i)}} style={{background:'#D06830',color:'#fff',border:'none',padding:'5px 12px',fontSize:10,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.06em'}}>
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

        <div style={{marginTop:'1rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
