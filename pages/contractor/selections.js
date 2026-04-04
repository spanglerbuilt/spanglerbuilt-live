import Layout from '../../components/Layout'
import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

var TIER_COLORS = {
  good:   { color:'#3B6D11', bg:'#eaf3de' },
  better: { color:'#185FA5', bg:'#e6f1fb' },
  best:   { color:'#534AB7', bg:'#eeedfe' },
  luxury: { color:'#854F0B', bg:'#faeeda' },
}

var STATUS_STYLE = {
  confirmed: { bg:'#eaf3de', color:'#3B6D11', label:'Confirmed' },
  pending:   { bg:'#fff3e0', color:'#e65100', label:'Pending' },
  'n/a':     { bg:'rgba(255,255,255,.07)', color:'rgba(255,255,255,.35)', label:'N/A' },
}

var INIT_PROJECTS = [
  {
    id:1, pn:'SB-2026-001', client:'Ryan & Dori Mendel', type:'Basement', tier:'better',
    email:'ryan.mendel@email.com', phone:'(404) 555-0101',
    selections:[
      { cat:'Flooring',           status:'pending',   value:null },
      { cat:'Floor & wall tile',  status:'pending',   value:null },
      { cat:'Fixtures & Hardware',status:'pending',   value:null },
      { cat:'Paint colors',       status:'pending',   value:null },
      { cat:'Bar cabinets',       status:'pending',   value:null },
      { cat:'Bar countertop',     status:'pending',   value:null },
      { cat:'Lighting',           status:'pending',   value:null },
      { cat:'Interior doors',     status:'confirmed', value:'Hollow core — White' },
      { cat:'Vanity',             status:'pending',   value:null },
      { cat:'Shower enclosure',   status:'pending',   value:null },
    ],
  },
  {
    id:2, pn:'SB-2026-002', client:'John & Susan Park', type:'Kitchen', tier:'best',
    email:'john.park@email.com', phone:'(770) 555-0202',
    selections:[
      { cat:'Flooring',           status:'confirmed', value:'Engineered Hardwood — Glacier' },
      { cat:'Fixtures & Hardware',status:'confirmed', value:'Unlacquered Brass' },
      { cat:'Paint colors',       status:'confirmed', value:"Elephant's Breath" },
      { cat:'Cabinets',           status:'confirmed', value:'Inset Shaker — Alabaster' },
      { cat:'Countertops',        status:'confirmed', value:'Cambria Brittanicca Warm' },
      { cat:'Lighting',           status:'confirmed', value:'Antique Brass Pendants' },
      { cat:'Interior doors',     status:'confirmed', value:'TruStile MDF — White' },
    ],
  },
  {
    id:3, pn:'SB-2026-003', client:'Tom & Wendy Harris', type:'Addition', tier:'better',
    email:'wendy.harris@email.com', phone:'(678) 555-0303',
    selections:[
      { cat:'Flooring',           status:'confirmed', value:'COREtec Vero Beach Oak' },
      { cat:'Tile',               status:'confirmed', value:'MSI Carrara White' },
      { cat:'Fixtures & Hardware',status:'confirmed', value:'Delta Trinsic — Matte Black' },
      { cat:'Paint colors',       status:'confirmed', value:'Agreeable Gray SW7029' },
      { cat:'Lighting',           status:'confirmed', value:'Brushed Nickel Recessed' },
      { cat:'Interior doors',     status:'confirmed', value:'Solid Core — White' },
      { cat:'Vanity',             status:'confirmed', value:'36" Double — Gray' },
      { cat:'Shower enclosure',   status:'confirmed', value:'Frameless — Brushed Nickel' },
    ],
  },
  {
    id:4, pn:'SB-2026-004', client:'Amy Chen', type:'Bath', tier:'good',
    email:'amy.chen@email.com', phone:'(404) 555-0404',
    selections:[
      { cat:'Floor & wall tile',  status:'pending', value:null },
      { cat:'Fixtures & Hardware',status:'pending', value:null },
      { cat:'Vanity',             status:'pending', value:null },
      { cat:'Shower enclosure',   status:'pending', value:null },
      { cat:'Paint colors',       status:'pending', value:null },
      { cat:'Lighting',           status:'pending', value:null },
    ],
  },
]

export default function ContractorSelections() {
  var { data: session } = useSession()
  var [projects, setProjects] = useState(INIT_PROJECTS)
  var [expanded, setExpanded] = useState(null)

  function getStats(proj) {
    var active    = proj.selections.filter(function(s){ return s.status !== 'n/a' })
    var confirmed = active.filter(function(s){ return s.status === 'confirmed' }).length
    var pending   = active.filter(function(s){ return s.status === 'pending' }).length
    return { total: active.length, confirmed, pending }
  }

  function toggleStatus(projId, cat) {
    setProjects(function(prev) {
      return prev.map(function(p) {
        if (p.id !== projId) return p
        return Object.assign({}, p, {
          selections: p.selections.map(function(s) {
            if (s.cat !== cat) return s
            if (s.status === 'confirmed') return Object.assign({}, s, { status:'pending', value:null })
            return Object.assign({}, s, { status:'confirmed', value: s.value || '—' })
          })
        })
      })
    })
  }

  var totalPending = projects.reduce(function(sum, p){ return sum + getStats(p).pending }, 0)

  return (
    <Layout>

      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#D06830',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>&nbsp;· Material Selections</span>
        </div>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <a href="/contractor/presentation" style={{fontSize:11,color:'rgba(255,255,255,.7)',textDecoration:'none'}}>Presentation tool →</a>
          <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
        </div>
      </div>

      <div style={{maxWidth:1800,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[
            ['Active projects',  projects.length,                                                        '#0a0a0a'],
            ['Total selections', projects.reduce(function(s,p){ return s+getStats(p).total },0),         '#0a0a0a'],
            ['Confirmed',        projects.reduce(function(s,p){ return s+getStats(p).confirmed },0),     '#3B6D11'],
            ['Pending client',   totalPending,                                                            totalPending>0?'#e65100':'#9a9690'],
          ].map(function(item){ return (
            <div key={item[0]} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'.75rem 1rem',borderTop:'3px solid '+(item[0]==='Pending client'&&totalPending>0?'#D06830':'#0a0a0a')}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{item[0]}</div>
              <div style={{fontSize:22,fontWeight:500,color:item[2]}}>{item[1]}</div>
            </div>
          )})}
        </div>

        {totalPending > 0 && (
          <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'rgba(255,255,255,.65)'}}>
            <strong style={{color:'rgba(255,255,255,.75)'}}>Action needed:</strong> {totalPending} selection{totalPending!==1?'s are':' is'} waiting for client confirmation.
            Share the client portal link so clients can make their choices.
          </div>
        )}

        <div style={{display:'grid',gap:10}}>
          {projects.map(function(proj) {
            var stats = getStats(proj)
            var tc    = TIER_COLORS[proj.tier]
            var isExp = expanded === proj.id
            var pct   = stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0

            return (
              <div key={proj.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',borderLeft:'4px solid #0a0a0a'}}>

                <div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={function(){ setExpanded(isExp ? null : proj.id) }}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,fontWeight:500,color:'#FF8C00'}}>{proj.pn}</span>
                      <span style={{background:tc.bg,color:tc.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase',letterSpacing:'.06em'}}>{proj.tier}</span>
                    </div>
                    <div style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,.75)',marginBottom:2}}>{proj.client}</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{proj.type}</div>
                  </div>

                  <div style={{width:180,flexShrink:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>Selections complete</div>
                      <div style={{fontSize:10,fontWeight:500,color:pct===100?'#3B6D11':'#0a0a0a'}}>{stats.confirmed}/{stats.total}</div>
                    </div>
                    <div style={{height:6,background:'#1a1a1a',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:6,width:pct+'%',background:pct===100?'#3B6D11':'#D06830',borderRadius:3,transition:'width .3s'}}/>
                    </div>
                    <div style={{fontSize:9,marginTop:3,color:stats.pending>0?'#e65100':'#3B6D11'}}>
                      {stats.pending > 0 ? stats.pending+' pending client' : 'All confirmed ✓'}
                    </div>
                  </div>

                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <a href={'mailto:'+proj.email} onClick={function(e){e.stopPropagation()}} style={{background:'#1a1a1a',color:'rgba(255,255,255,.75)',padding:'5px 10px',fontSize:10,textDecoration:'none',borderRadius:3,border:'1px solid rgba(255,255,255,.09)'}}>Email</a>
                    <a href={'tel:'+proj.phone.replace(/\D/g,'')} onClick={function(e){e.stopPropagation()}} style={{background:'#1a1a1a',color:'rgba(255,255,255,.75)',padding:'5px 10px',fontSize:10,textDecoration:'none',borderRadius:3,border:'1px solid rgba(255,255,255,.09)'}}>Call</a>
                  </div>
                  <span style={{fontSize:11,color:'rgba(255,255,255,.35)',flexShrink:0}}>{isExp?'▲':'▼'}</span>
                </div>

                {isExp && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'1rem 1.25rem'}}>
                    <div style={{background:'#1a1a1a',borderRadius:3,overflow:'hidden',marginBottom:'1rem'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 110px 1fr 120px',background:'#0a0a0a',padding:'6px 12px',gap:1}}>
                        {['Category','Status','Selection',''].map(function(h){ return (
                          <div key={h} style={{fontSize:10,fontWeight:500,color:'#D06830',textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</div>
                        )})}
                      </div>
                      {proj.selections.map(function(sel, i) {
                        var ss = STATUS_STYLE[sel.status]
                        return (
                          <div key={sel.cat} style={{display:'grid',gridTemplateColumns:'1fr 110px 1fr 120px',padding:'9px 12px',background:i%2===0?'#fff':'#fafaf9',borderTop:'1px solid #f0efed',alignItems:'center',gap:1}}>
                            <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{sel.cat}</div>
                            <div>
                              <span style={{background:ss.bg,color:ss.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase',letterSpacing:'.04em'}}>{ss.label}</span>
                            </div>
                            <div style={{fontSize:11,color:sel.status==='confirmed'?'#3B6D11':'#9a9690'}}>
                              {sel.value || (sel.status==='pending'?'Awaiting client':'—')}
                            </div>
                            <div>
                              {sel.status !== 'n/a' && (
                                <button onClick={function(){toggleStatus(proj.id, sel.cat)}}
                                  style={{background:sel.status==='confirmed'?'transparent':'#D06830',border:sel.status==='confirmed'?'1px solid #e8e6e0':'none',color:sel.status==='confirmed'?'#9a9690':'#fff',padding:'4px 10px',fontSize:9,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>
                                  {sel.status==='confirmed'?'Reset':'Mark confirmed'}
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <a href="/contractor/presentation" style={{background:'#0a0a0a',color:'#D06830',padding:'7px 16px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase'}}>Open presentation →</a>
                      <a href="/contractor/leads" style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'7px 14px',fontSize:11,textDecoration:'none',borderRadius:3}}>View in leads</a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{marginTop:'1rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
