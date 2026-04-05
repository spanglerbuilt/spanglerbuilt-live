import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var MILESTONES = [
  {
    num:    1,
    label:  'Deposit to Book',
    pct:    10,
    desc:   'Due upon signing the project agreement. Secures your spot on the schedule.',
    status: 'paid',
  },
  {
    num:    2,
    label:  'Project Mobilization',
    pct:    25,
    desc:   'Due before work begins on site. Covers permit fees, design finalizations, and materials ordering.',
    status: 'paid',
  },
  {
    num:    3,
    label:  'Rough-In Complete',
    pct:    25,
    desc:   'Due upon completion of rough electrical, plumbing, HVAC, and structural framing.',
    status: 'pending',
  },
  {
    num:    4,
    label:  'Materials & Selections Set',
    pct:    25,
    desc:   'Due when all finish materials are confirmed and on order — tile, fixtures, cabinets, flooring.',
    status: 'upcoming',
  },
  {
    num:    5,
    label:  'Substantial Completion',
    pct:    10,
    desc:   'Due when all major work is complete and the project passes final inspection.',
    status: 'upcoming',
  },
  {
    num:    6,
    label:  'Final Walkthrough & Sign-Off',
    pct:    5,
    desc:   'Final payment due upon your satisfaction at the project closeout walkthrough.',
    status: 'upcoming',
  },
]

var STATUS_STYLE = {
  paid:     { bg:'#eaf3de', color:'#3B6D11', label:'Paid' },
  pending:  { bg:'#fff3e0', color:'#e65100', label:'Due Now' },
  upcoming: { bg:'rgba(255,255,255,.06)', color:'rgba(255,255,255,.4)', label:'Upcoming' },
}

function fmt(n) {
  return '$' + Math.round(n).toLocaleString()
}

export default function ClientPayments() {
  var [project, setProject] = useState(null)
  var [total,   setTotal]   = useState(null)

  useEffect(function() {
    if (typeof window !== 'undefined') {
      try {
        var auth = JSON.parse(localStorage.getItem('sb_auth') || '{}')
        if (!auth.role) { window.location.href = '/login'; return }
        setProject(auth.project || null)
        if (auth.project && auth.project.estimate_total) {
          setTotal(parseFloat(auth.project.estimate_total) || null)
        }
      } catch(e) { window.location.href = '/login' }
    }
  }, [])

  var paidPct  = MILESTONES.filter(function(m){ return m.status === 'paid' }).reduce(function(a,m){ return a + m.pct }, 0)
  var paidAmt  = total ? fmt(total * paidPct / 100) : null
  var dueNow   = MILESTONES.find(function(m){ return m.status === 'pending' })
  var dueAmt   = dueNow && total ? fmt(total * dueNow.pct / 100) : null

  return (
    <Layout>
      <div style={{maxWidth:800, margin:'0 auto', padding:'1.5rem'}}>

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:8}}>
          <div>
            <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>Payment Schedule</div>
            <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>
              {project ? project.project_number + ' · ' + project.project_type : 'Your SpanglerBuilt project'}
            </div>
          </div>
          <a href="/client/dashboard" style={{fontSize:11, color:'#D06830', textDecoration:'none', fontWeight:600}}>← Back to portal</a>
        </div>

        {/* ── Summary strip ───────────────────────────────────────────────────── */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:'1.5rem'}}>
          {[
            ['Contract Total', total ? '$' + total.toLocaleString() : '—'],
            ['Amount Paid',    paidAmt || (paidPct + '% of total')],
            ['Due Now',        dueAmt  || (dueNow ? dueNow.pct + '% of total' : '—')],
          ].map(function(item) {
            return (
              <div key={item[0]} style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'.75rem 1rem', borderTop:'3px solid #0a0a0a'}}>
                <div style={{fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4}}>{item[0]}</div>
                <div style={{fontSize:20, fontWeight:600, color:'rgba(255,255,255,.8)'}}>{item[1]}</div>
              </div>
            )
          })}
        </div>

        {/* ── Progress bar ────────────────────────────────────────────────────── */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, padding:'1rem 1.25rem', marginBottom:'1.5rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
            <div style={{fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em'}}>Payment progress</div>
            <div style={{fontSize:10, color:'#D06830', fontWeight:600}}>{paidPct}% paid</div>
          </div>
          <div style={{height:8, background:'rgba(255,255,255,.08)', borderRadius:4, overflow:'hidden'}}>
            <div style={{height:8, width:paidPct+'%', background:'linear-gradient(90deg,#D06830,#e07840)', borderRadius:4, transition:'width .4s ease'}}/>
          </div>
          <div style={{display:'flex', marginTop:8, gap:4}}>
            {MILESTONES.map(function(m) {
              var style = STATUS_STYLE[m.status]
              return (
                <div key={m.num} style={{flex:1, height:4, borderRadius:2, background: m.status === 'paid' ? '#D06830' : m.status === 'pending' ? '#e65100' : 'rgba(255,255,255,.1)'}}/>
              )
            })}
          </div>
        </div>

        {/* ── Milestone list ──────────────────────────────────────────────────── */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Draw schedule</div>
        <div style={{display:'flex', flexDirection:'column', gap:0, background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderRadius:4, overflow:'hidden'}}>

          {/* Table header */}
          <div style={{display:'grid', gridTemplateColumns:'40px 1fr 80px 120px 100px', gap:12, padding:'8px 1rem', background:'#0a0a0a', fontSize:10, fontWeight:600, color:'#D06830', textTransform:'uppercase', letterSpacing:'.04em'}}>
            <span>#</span>
            <span>Milestone</span>
            <span>%</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {MILESTONES.map(function(m, i) {
            var ss  = STATUS_STYLE[m.status]
            var amt = total ? fmt(total * m.pct / 100) : m.pct + '%'
            return (
              <div key={m.num} style={{
                display:'grid', gridTemplateColumns:'40px 1fr 80px 120px 100px',
                gap:12, padding:'14px 1rem', alignItems:'start',
                borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,.07)',
                background: m.status === 'pending' ? 'rgba(208,104,48,.04)' : 'transparent',
              }}>
                <div style={{width:26, height:26, borderRadius:'50%', background: m.status === 'paid' ? '#D06830' : 'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: m.status === 'paid' ? '#fff' : 'rgba(255,255,255,.3)', flexShrink:0}}>
                  {m.status === 'paid' ? '✓' : m.num}
                </div>
                <div>
                  <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)', marginBottom:3}}>{m.label}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)', lineHeight:1.5}}>{m.desc}</div>
                </div>
                <div style={{fontSize:13, fontWeight:500, color:'rgba(255,255,255,.6)', paddingTop:2}}>{m.pct}%</div>
                <div style={{fontSize:14, fontWeight:700, color:'rgba(255,255,255,.85)', paddingTop:2}}>{amt}</div>
                <div style={{paddingTop:2}}>
                  <span style={{background:ss.bg, color:ss.color, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:3, whiteSpace:'nowrap'}}>
                    {ss.label}
                  </span>
                  {m.status === 'pending' && (
                    <div style={{marginTop:8}}>
                      <a href="mailto:michael@spanglerbuilt.com?subject=Payment%20-%20Draw%20' + m.num" style={{fontSize:10, color:'#D06830', fontWeight:600, textDecoration:'none', border:'1px solid #D06830', padding:'3px 8px', borderRadius:3, whiteSpace:'nowrap'}}>
                        Pay Now →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Payment methods note ─────────────────────────────────────────────── */}
        <div style={{background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.07)', borderRadius:4, padding:'1rem 1.25rem', marginTop:'1.25rem'}}>
          <div style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,.5)', marginBottom:6}}>Payment methods accepted</div>
          <div style={{fontSize:12, color:'rgba(255,255,255,.35)', lineHeight:1.8}}>
            Check payable to <strong style={{color:'rgba(255,255,255,.55)'}}>SpanglerBuilt Inc.</strong> · ACH bank transfer · Zelle to michael@spanglerbuilt.com<br/>
            Questions about a draw? Call <a href="tel:4044927650" style={{color:'#D06830'}}>Michael at (404) 492-7650</a>.
          </div>
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
