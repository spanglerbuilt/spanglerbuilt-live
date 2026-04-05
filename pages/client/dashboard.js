import Layout from '../../components/Layout'
import { useEffect, useState } from 'react'

var STAGES = ['New Lead','Estimate','Approved','Started','Completed']

export default function ClientDashboard() {
  var [clientEmail, setClientEmail] = useState('')
  var [project,     setProject]     = useState(null)

  useEffect(function() {
    if (typeof window !== 'undefined') {
      try {
        var auth = JSON.parse(localStorage.getItem('sb_auth') || '{}')
        if (!auth.role) { window.location.href = '/login'; return }
        setClientEmail(auth.email || '')
        setProject(auth.project || null)
      } catch(e) { window.location.href = '/login' }
    }
  }, [])

  function handleSignOut() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb_auth')
      window.location.href = '/login'
    }
  }

  var rawStatus = project ? (project.status || 'new_lead') : 'new_lead'
  // Map DB status values to display stage names
  var STATUS_MAP = {
    'new_lead':  'New Lead',
    'New lead':  'New Lead',
    'New Lead':  'New Lead',
    'Estimate':  'Estimate',
    'estimate':  'Estimate',
    'Approved':  'Approved',
    'approved':  'Approved',
    'Started':   'Started',
    'started':   'Started',
    'Completed': 'Completed',
    'completed': 'Completed',
  }
  var currentStage = STATUS_MAP[rawStatus] || 'New Lead'
  var stageIdx  = STAGES.indexOf(currentStage)
  if (stageIdx < 0) stageIdx = 0
  var stagePct  = Math.round((stageIdx / (STAGES.length - 1)) * 100)

  var firstName = project && project.client_name ? project.client_name.split(' ')[0] : ''

  var MAIN_CARDS = [
    {
      label: 'My Selections',
      href:  '/client/selections',
      icon:  '✓',
      desc:  'Choose your materials and finishes',
      alert: true,
      alertMsg: '10 pending',
      color: '#D06830',
    },
    {
      label: 'Payment Schedule',
      href:  '/client/payments',
      icon:  '$',
      desc:  'Draw schedule, milestones & invoices',
      alert: false,
      color: '#D06830',
    },
    {
      label: 'Project Timeline',
      href:  '/client/schedule',
      icon:  '◉',
      desc:  'Gantt chart & phase schedule',
      alert: false,
      color: '#D06830',
    },
    {
      label: 'Documents',
      href:  '/client/documents',
      icon:  '✦',
      desc:  'Contract, proposals & signatures',
      alert: true,
      alertMsg: '1 to sign',
      color: '#D06830',
    },
  ]

  var MORE_LINKS = [
    {href:'/client/estimate',   label:'Estimate',           icon:'$', desc:'View and select your tier'},
    {href:'/client/scope',      label:'Scope of work',      icon:'◻', desc:'What is included phase by phase'},
    {href:'/client/options',    label:'Options & upgrades', icon:'◈', desc:'Customize finishes & pricing'},
    {href:'/client/photos',     label:'Progress photos',    icon:'◉', desc:'Latest site photos'},
    {href:'/client/punch-list', label:'Punch list',         icon:'☑', desc:'Submit items & track status'},
    {href:'/client/warranty',   label:'Warranty',           icon:'◈', desc:'Submit a warranty request'},
    {href:'/client/messages',   label:'Messages',           icon:'✉', desc:'Chat with SpanglerBuilt'},
  ]

  return (
    <Layout>
      <div style={{maxWidth:960, margin:'0 auto', padding:'1.5rem'}}>

        {/* ── Welcome banner ──────────────────────────────────────────────────── */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.09)', borderLeft:'4px solid #D06830', borderRadius:4, padding:'1.25rem 1.5rem', marginBottom:'1.25rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:'1rem'}}>
            <div>
              <div style={{fontSize:20, fontWeight:700, color:'#fff', marginBottom:4}}>
                {firstName ? 'Welcome back, ' + firstName : 'Welcome back'}
              </div>
              {project ? (
                <>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:2}}>
                    {project.project_number} · {project.project_type}
                  </div>
                  {project.address && (
                    <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>{project.address}</div>
                  )}
                </>
              ) : (
                <div style={{fontSize:11, color:'rgba(255,255,255,.4)'}}>Your SpanglerBuilt project portal</div>
              )}
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <div style={{textAlign:'right', marginRight:4}}>
                <div style={{fontSize:9, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2}}>Status</div>
                <div style={{fontSize:13, color:'#D06830', fontWeight:700}}>{currentStage}</div>
              </div>
              <button onClick={handleSignOut}
                style={{background:'transparent', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.35)', padding:'6px 12px', fontSize:11, cursor:'pointer', borderRadius:3, fontFamily:'inherit'}}>
                Sign out
              </button>
            </div>
          </div>

          {/* Progress bar — 5 stages */}
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:6}}>
              <div style={{fontSize:10, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em'}}>Project stage</div>
              <div style={{fontSize:10, color:'#D06830', fontWeight:600}}>{stagePct}%</div>
            </div>
            <div style={{height:6, background:'rgba(255,255,255,.08)', borderRadius:3, overflow:'hidden', marginBottom:8}}>
              <div style={{height:6, width:stagePct+'%', background:'linear-gradient(90deg,#D06830,#e07840)', borderRadius:3, transition:'width .4s ease'}}/>
            </div>
            <div style={{display:'flex'}}>
              {STAGES.map(function(stage, i) {
                var active  = i === stageIdx
                var done    = i < stageIdx
                return (
                  <div key={stage} style={{flex:1, textAlign:'center', fontSize:9, lineHeight:1.4,
                    color: done ? '#D06830' : active ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.25)',
                    fontWeight: active ? 700 : done ? 600 : 400,
                  }}>
                    {done ? '✓ ' : active ? '● ' : ''}{stage}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── 4 Main Cards ────────────────────────────────────────────────────── */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>Your project at a glance</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:'1.5rem'}}>
          {MAIN_CARDS.map(function(card) {
            return (
              <a key={card.href} href={card.href} style={{
                display:'flex', flexDirection:'column', gap:8,
                padding:'1.25rem',
                background:'#161616',
                border:'1px solid ' + (card.alert ? 'rgba(208,104,48,.35)' : 'rgba(255,255,255,.09)'),
                borderTop:'3px solid ' + (card.alert ? '#D06830' : 'rgba(255,255,255,.08)'),
                borderRadius:4, textDecoration:'none',
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div style={{width:36, height:36, background:'#0a0a0a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#D06830'}}>
                    {card.icon}
                  </div>
                  {card.alert && (
                    <span style={{background:'#D06830', color:'#fff', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:3, whiteSpace:'nowrap'}}>
                      {card.alertMsg}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{fontSize:14, fontWeight:700, color:'rgba(255,255,255,.85)', marginBottom:3}}>{card.label}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{card.desc}</div>
                </div>
                <div style={{fontSize:11, color:'#D06830', fontWeight:600, marginTop:'auto'}}>Open →</div>
              </a>
            )
          })}
        </div>

        {/* ── Action required ─────────────────────────────────────────────────── */}
        <div style={{background:'rgba(208,104,48,.07)', border:'1px solid rgba(208,104,48,.25)', borderRadius:4, padding:'1rem 1.25rem', marginBottom:'1.5rem'}}>
          <div style={{fontSize:10, fontWeight:700, color:'#D06830', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:8}}>Action required</div>
          <div style={{fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:2}}>
            · <a href="/client/estimate"   style={{color:'#D06830', fontWeight:500}}>Select your project tier</a> — Good, Better, Best, or Luxury.<br/>
            · <a href="/client/selections" style={{color:'#D06830', fontWeight:500}}>10 material selections</a> are waiting for your input.<br/>
            · <a href="/client/options"    style={{color:'#D06830', fontWeight:500}}>Review options &amp; upgrades</a> — customize your finishes.<br/>
            · <a href="/client/documents"  style={{color:'#D06830', fontWeight:500}}>1 document</a> ready for your review and signature.
          </div>
        </div>

        {/* ── More links ──────────────────────────────────────────────────────── */}
        <div style={{fontSize:10, fontWeight:600, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10}}>More tools</div>
        <div className="sb-grid-2" style={{marginBottom:'1.5rem'}}>
          {MORE_LINKS.map(function(item) {
            return (
              <a key={item.href} href={item.href} style={{
                display:'flex', gap:12, alignItems:'center',
                padding:'1rem 1.25rem',
                background:'#161616',
                border:'1px solid rgba(255,255,255,.08)',
                borderLeft:'4px solid rgba(255,255,255,.06)',
                borderRadius:4, textDecoration:'none',
              }}>
                <div style={{width:32, height:32, background:'#0a0a0a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'#D06830', flexShrink:0}}>
                  {item.icon}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600, color:'rgba(255,255,255,.8)', marginBottom:1}}>{item.label}</div>
                  <div style={{fontSize:11, color:'rgba(255,255,255,.35)'}}>{item.desc}</div>
                </div>
              </a>
            )
          })}
        </div>

        {/* ── Contact card ────────────────────────────────────────────────────── */}
        <div style={{background:'#161616', border:'1px solid rgba(255,255,255,.08)', borderRadius:4, padding:'1.25rem 1.5rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:'rgba(255,255,255,.75)', marginBottom:4}}>Questions? Contact Michael directly</div>
              <div style={{fontSize:11, color:'rgba(255,255,255,.35)', lineHeight:1.7}}>
                SpanglerBuilt Inc. · Design/Build Contractor · GC &amp; Home Builder<br/>
                44 Milton Ave, Alpharetta, GA 30009
              </div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <a href="tel:4044927650" style={{background:'#D06830', color:'#fff', padding:'9px 18px', fontSize:12, fontWeight:700, textDecoration:'none', borderRadius:3, whiteSpace:'nowrap'}}>(404) 492-7650</a>
              <a href="mailto:michael@spanglerbuilt.com" style={{background:'transparent', border:'1px solid rgba(255,255,255,.15)', color:'rgba(255,255,255,.55)', padding:'9px 18px', fontSize:12, textDecoration:'none', borderRadius:3, whiteSpace:'nowrap'}}>Email</a>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
