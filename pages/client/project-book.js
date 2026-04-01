var HEADSHOT = 'https://images.squarespace-cdn.com/content/v1/69358d7c8272151c17be540c/f801ea2e-5193-427a-aacb-eff13f1ae8cf/IMG_6546.jpg'

var PHOTOS = {
  cover:      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85',
  about:      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=85',
  process:    'https://images.unsplash.com/photo-1590579491624-f98f36d4c763?w=1200&q=85',
  estimate:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=85',
  scope:      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85',
  payment:    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=85',
  warranty:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=85',
}

var PROJECT = {
  number:   'SB-2026-001',
  client:   'Ryan & Dori Mendel',
  address:  '4995 Shadow Glen Ct, Dunwoody, GA 30338',
  type:     'Basement Renovation',
  tier:     'Better',
  price:    62500,
  start:    'April 28, 2026',
  end:      'June 20, 2026',
  prepared: 'March 31, 2026',
}

var MILESTONES = [
  {label:'Deposit — contract signing',     pct:25, amount:15625, date:'April 28'},
  {label:'Demo and framing complete',       pct:25, amount:15625, date:'May 12'},
  {label:'Drywall and rough-ins complete',  pct:25, amount:15625, date:'May 28'},
  {label:'Paint, flooring and trim',        pct:20, amount:12500, date:'June 10'},
  {label:'Final punch list and closeout',   pct:5,  amount:3125,  date:'June 20'},
]

var PHASES = [
  {num:1, name:'Pre-construction',              dates:'April 14–28',    items:['Site visit and final measurements','Permit application submitted','Material selections finalized','Subcontractor schedule confirmed']},
  {num:2, name:'Demo and framing',              dates:'April 28–May 12',items:['Existing finishes demolished and hauled off','Concrete floor prepped and leveled','Moisture barrier installed','Perimeter and interior walls framed']},
  {num:3, name:'Rough mechanicals',             dates:'May 12–28',      items:['Bathroom plumbing rough-in (DWV)','Electrical panel review and new circuits','20 LED recessed light rough-in','HVAC ductwork extension — 2 registers']},
  {num:4, name:'Insulation, drywall, finishes', dates:'May 28–June 10', items:['Spray foam — rim joists','Drywall hang and finish (level 4)','Tile — bathroom floor and shower walls','LVP flooring installation','Paint — 2 coats']},
  {num:5, name:'Fixtures, trim and closeout',   dates:'June 10–20',     items:['Plumbing fixtures installed','Bar cabinets and countertop','Interior doors and hardware','Electrical fixtures and lighting','Final walkthrough']},
]

var TENANTS = [
  {icon:'◉', name:'Owner on-site daily',   desc:'Michael Spangler is personally present on every project, every day. No middlemen.'},
  {icon:'◻', name:'Transparent pricing',    desc:'Every estimate in four tiers with complete line-item detail. No surprises.'},
  {icon:'✦', name:'Written everything',     desc:'Every change is a signed change order. Every commitment is in writing.'},
  {icon:'✓', name:'Craftsmanship first',    desc:'We select subcontractors the same way we would hire for our own home.'},
  {icon:'◈', name:'Client partnership',     desc:'Your home is your most important investment. We treat it accordingly.'},
  {icon:'↗', name:'Long-term value',        desc:'We build with materials that hold up, backed by our 1-year warranty.'},
]

var HOW_WE_WORK = [
  {step:'01', title:'Initial consultation',       desc:'We visit your home, listen to your vision, take measurements, and understand your goals.'},
  {step:'02', title:'4-tier written estimate',    desc:'Within 48 hours of our site visit, you receive a complete written estimate in all four tiers.'},
  {step:'03', title:'Presentation and selection', desc:'We walk you through every material selection room by room at each price point.'},
  {step:'04', title:'Contract and project book',  desc:'Once you select your tier, we prepare your contract and this project book.'},
  {step:'05', title:'Build',                      desc:'Michael is on your job site every day. You receive progress photos and direct access to him.'},
  {step:'06', title:'Closeout and warranty',      desc:'We walk the project together, complete the punch list, and hand you a 1-year warranty.'},
]

function fmt(n){ return '$' + Math.round(n).toLocaleString('en-US') }

var S = {
  page:        {background:'#fff', color:'#002147', fontFamily:'Georgia,serif', maxWidth:900, margin:'0 auto'},
  hero:        {width:'100%', height:220, objectFit:'cover', display:'block'},
  heroWrap:    {overflow:'hidden', marginBottom:0},
  heroOverlay: {background:'rgba(0,33,71,.85)', display:'flex', alignItems:'flex-end', padding:'1rem 2rem', marginTop:-1},
  heroLabel:   {fontSize:11, color:'#FF8C00', letterSpacing:'.2em', textTransform:'uppercase', fontFamily:'sans-serif'},
  section:     {padding:'2.5rem 3rem', borderBottom:'1px solid #e8e6e0'},
  sectionLast: {padding:'2.5rem 3rem'},
  eyebrow:     {fontSize:9, color:'#FF8C00', letterSpacing:'.2em', textTransform:'uppercase', fontFamily:'sans-serif', marginBottom:'0.75rem'},
  h2:          {fontSize:28, fontWeight:400, marginBottom:'1.5rem', color:'#002147'},
  navyBox:     {background:'#002147', borderRadius:4, padding:'1.5rem 2rem', marginBottom:'1.5rem'},
  orangeAccent:{width:48, height:4, background:'#FF8C00', borderRadius:2, marginBottom:'1rem'},
  body:        {fontSize:13, lineHeight:1.85, color:'#3d3b37', fontFamily:'sans-serif'},
  label:       {fontSize:9, color:'#9a9690', textTransform:'uppercase', letterSpacing:'.08em', fontFamily:'sans-serif', marginBottom:4},
}

export default function ProjectBook() {
  return (
    <div style={S.page}>

      <style>{`
        @media print { .no-print { display:none!important; } .pb { page-break-before:always; } }
        @page { margin:0; size:letter; }
        * { box-sizing:border-box; }
      `}</style>

      {/* Print bar */}
      <div className="no-print" style={{background:'#002147',padding:'1rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:32,width:'auto'}}/>
        <div style={{display:'flex',gap:8}}>
          <button onClick={function(){window.print()}} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'8px 20px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.06em',textTransform:'uppercase'}}>
            Print / Save PDF
          </button>
          <a href="/client/dashboard" style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'rgba(255,255,255,.7)',padding:'8px 16px',fontSize:12,textDecoration:'none',borderRadius:3,fontFamily:'sans-serif'}}>Back</a>
        </div>
      </div>

      {/* ── COVER ── */}
      <div style={{background:'#002147', minHeight:500, display:'flex', flexDirection:'column', justifyContent:'space-between', overflow:'hidden'}}>
        <img src={PHOTOS.cover} alt="" style={{width:'100%',height:280,objectFit:'cover',opacity:.3,display:'block'}} onError={function(e){e.target.style.display='none'}}/>
        <div style={{padding:'2rem 3rem 0',marginTop:-20}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:50,width:'auto',marginBottom:'2.5rem'}}/>
          <div style={S.orangeAccent}/>
          <div style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.2em',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:'1rem'}}>Project proposal and agreement</div>
          <div style={{fontSize:46,color:'#fff',fontWeight:400,lineHeight:1.15,marginBottom:'.75rem'}}>{PROJECT.client}</div>
          <div style={{fontSize:17,color:'rgba(255,255,255,.65)',marginBottom:'.5rem',fontFamily:'sans-serif'}}>{PROJECT.address}</div>
          <div style={{fontSize:15,color:'#FF8C00',fontFamily:'sans-serif',marginBottom:'2.5rem'}}>{PROJECT.type} · {PROJECT.tier} Tier · {fmt(PROJECT.price)}</div>
        </div>
        <div style={{margin:'0 3rem 2.5rem',background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:4,padding:'1.5rem 2rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
            {[['Project',PROJECT.number],['Tier',PROJECT.tier+' — '+fmt(PROJECT.price)],['Timeline',PROJECT.start+' – '+PROJECT.end],['Prepared',PROJECT.prepared]].map(function(item){return(
              <div key={item[0]}>
                <div style={S.label}>{item[0]}</div>
                <div style={{fontSize:12,color:'#fff',fontFamily:'sans-serif'}}>{item[1]}</div>
              </div>
            )})}
          </div>
        </div>
        <div style={{padding:'1rem 3rem',borderTop:'1px solid rgba(255,255,255,.1)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontSize:10,color:'rgba(255,255,255,.3)',fontFamily:'sans-serif',letterSpacing:'.06em'}}>SPANGLERBUILT INC. · WOODSTOCK, GA · (404) 492-7650 · SPANGLERBUILT.COM</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.3)',fontFamily:'sans-serif'}}>LICENSED GENERAL CONTRACTOR · GEORGIA</div>
        </div>
      </div>

      {/* ── ABOUT HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.about} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>About SpanglerBuilt</div></div>
      </div>

      {/* ── ABOUT ── */}
      <div style={S.section}>
        <div style={S.eyebrow}>A message from our founder</div>
        <div style={S.h2}>Michael Spangler, CEO & Founder</div>
        <div style={{display:'grid',gridTemplateColumns:'180px 1fr',gap:'2.5rem',alignItems:'start'}}>
          <div>
            <img src={HEADSHOT} alt="Michael Spangler" style={{width:'100%',borderRadius:4,marginBottom:12,border:'3px solid #FF8C00'}} onError={function(e){e.target.style.display='none'}}/>
            <div style={{fontSize:13,fontWeight:600,color:'#002147',fontFamily:'sans-serif'}}>Michael Spangler</div>
            <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>CEO & Founder</div>
            <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>Licensed General Contractor</div>
            <div style={{fontSize:12,color:'#FF8C00',fontFamily:'sans-serif',marginTop:6,fontWeight:600}}>(404) 492-7650</div>
          </div>
          <div>
            <p style={{...S.body,marginBottom:'1rem'}}>SpanglerBuilt was founded on a simple belief: homeowners deserve a contractor who shows up, communicates clearly, and delivers exactly what they were promised — every time.</p>
            <p style={{...S.body,marginBottom:'1rem'}}>I started SpanglerBuilt because I saw a gap in how residential construction was being done in Metro Atlanta. Homeowners were getting vague estimates, unreturned calls, and projects managed by someone they had never met.</p>
            <p style={{...S.body,marginBottom:'1.5rem'}}>When you hire SpanglerBuilt, you get me — on your job site, every day, personally accountable for every decision. We serve homeowners across Cherokee, Fulton, Cobb, and DeKalb counties who want a partner who treats their investment with the same respect they do.</p>
            <div style={{background:'#002147',borderRadius:4,padding:'1rem 1.25rem',borderLeft:'4px solid #FF8C00'}}>
              <div style={{fontSize:15,color:'#fff',fontStyle:'italic',lineHeight:1.7}}>"We build more than projects — we build lifestyles."</div>
            </div>
          </div>
        </div>

        {/* Core tenants */}
        <div style={{marginTop:'2.5rem'}}>
          <div style={S.orangeAccent}/>
          <div style={S.eyebrow}>Our core tenants</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem',marginTop:'1rem'}}>
            {TENANTS.map(function(t){return(
              <div key={t.name} style={{borderTop:'3px solid #002147',paddingTop:'1rem'}}>
                <div style={{fontSize:18,marginBottom:6,color:'#FF8C00'}}>{t.icon}</div>
                <div style={{fontSize:12,fontWeight:700,color:'#002147',marginBottom:4,fontFamily:'sans-serif',textTransform:'uppercase',letterSpacing:'.04em'}}>{t.name}</div>
                <div style={{fontSize:11,color:'#5f5e5a',lineHeight:1.7,fontFamily:'sans-serif'}}>{t.desc}</div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* ── PROCESS HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.process} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>How We Work</div></div>
      </div>

      {/* ── PROCESS ── */}
      <div style={S.section}>
        <div style={S.eyebrow}>Our process</div>
        <div style={S.h2}>How SpanglerBuilt works</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem'}}>
          {HOW_WE_WORK.map(function(step){return(
            <div key={step.step} style={{display:'flex',gap:'1rem',alignItems:'flex-start',padding:'1.25rem',border:'1px solid #e8e6e0',borderRadius:4,borderTop:'3px solid #FF8C00'}}>
              <div style={{width:40,height:40,background:'#002147',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#FF8C00',fontFamily:'sans-serif',flexShrink:0}}>{step.step}</div>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#002147',marginBottom:4,fontFamily:'sans-serif'}}>{step.title}</div>
                <div style={{fontSize:11,color:'#5f5e5a',lineHeight:1.7,fontFamily:'sans-serif'}}>{step.desc}</div>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* ── ESTIMATE HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.estimate} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>Your Estimate</div></div>
      </div>

      {/* ── ESTIMATE ── */}
      <div style={S.section}>
        <div style={S.eyebrow}>Your selected tier</div>
        <div style={S.h2}>{PROJECT.tier} Tier — {fmt(PROJECT.price)}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.5rem'}}>
          {[['Good','$53,000','#3B6D11'],['Better','$62,500','#185FA5'],['Best','$73,000','#534AB7'],['Luxury','$87,500','#854F0B']].map(function(t){
            var sel = t[0]===PROJECT.tier
            return(
              <div key={t[0]} style={{border:sel?'3px solid '+t[2]:'1px solid #e8e6e0',borderRadius:4,padding:'1rem',background:sel?t[2]+'11':'#fafaf8',textAlign:'center'}}>
                <div style={{fontSize:10,fontWeight:700,color:sel?t[2]:'#9a9690',letterSpacing:'.1em',textTransform:'uppercase',fontFamily:'sans-serif',marginBottom:6}}>{t[0]}{sel?' ✓':''}</div>
                <div style={{fontSize:20,fontWeight:sel?700:400,color:sel?t[2]:'#c0c0c0',fontFamily:'sans-serif'}}>{t[1]}</div>
              </div>
            )
          })}
        </div>
        <div style={{background:'#002147',padding:'1.5rem 2rem',borderRadius:4,display:'flex',justifyContent:'space-between',alignItems:'center',borderLeft:'6px solid #FF8C00'}}>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'sans-serif',marginBottom:4}}>Contract total — {PROJECT.tier} tier</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)',fontFamily:'sans-serif'}}>{PROJECT.type} · {PROJECT.address}</div>
          </div>
          <div style={{fontSize:36,fontWeight:700,color:'#FF8C00',fontFamily:'sans-serif'}}>{fmt(PROJECT.price)}</div>
        </div>
      </div>

      {/* ── SCOPE HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.scope} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>Scope of Work</div></div>
      </div>

      {/* ── SCOPE ── */}
      <div style={S.section}>
        <div style={S.eyebrow}>What we are building</div>
        <div style={S.h2}>Scope of work — {PROJECT.type}</div>
        {PHASES.map(function(ph,pi){return(
          <div key={ph.num} style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:'1.5rem',marginBottom:'1.25rem',paddingBottom:'1.25rem',borderBottom:pi<PHASES.length-1?'1px solid #f5f4f1':'none'}}>
            <div style={{background:pi%2===0?'#002147':'#FF8C00',borderRadius:4,padding:'1rem',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{fontSize:24,fontWeight:700,color:'rgba(255,255,255,.3)',fontFamily:'sans-serif',marginBottom:4}}>0{ph.num}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#fff',fontFamily:'sans-serif',marginBottom:4}}>{ph.name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)',fontFamily:'sans-serif'}}>{ph.dates}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:6}}>
              {ph.items.map(function(item){return(
                <div key={item} style={{display:'flex',gap:8,alignItems:'flex-start',fontSize:12,color:'#3d3b37',fontFamily:'sans-serif'}}>
                  <span style={{color:'#FF8C00',flexShrink:0,fontWeight:700}}>✓</span>
                  <span>{item}</span>
                </div>
              )})}
            </div>
          </div>
        )})}
      </div>

      {/* ── PAYMENT HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.payment} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>Payment Schedule</div></div>
      </div>

      {/* ── PAYMENT ── */}
      <div style={S.section}>
        <div style={S.eyebrow}>5-milestone payment plan</div>
        <div style={S.h2}>Payment schedule</div>
        <div style={{border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'10px 20px',background:'#002147',fontSize:9,fontWeight:700,color:'#FF8C00',textTransform:'uppercase',letterSpacing:'.1em',fontFamily:'sans-serif'}}>
            <span>#</span><span>Milestone</span><span>%</span><span>Due date</span><span style={{textAlign:'right'}}>Amount</span>
          </div>
          {MILESTONES.map(function(m,i){return(
            <div key={i} style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'14px 20px',borderTop:'1px solid #f5f4f1',alignItems:'center',background:i%2===0?'#fff':'#fafaf8'}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:'#002147',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#FF8C00',fontFamily:'sans-serif'}}>{i+1}</div>
              <div style={{fontSize:12,color:'#002147',fontFamily:'sans-serif'}}>{m.label}</div>
              <div style={{fontSize:12,color:'#9a9690',fontFamily:'sans-serif'}}>{m.pct}%</div>
              <div style={{fontSize:12,color:'#9a9690',fontFamily:'sans-serif'}}>{m.date}</div>
              <div style={{fontSize:14,fontWeight:700,color:'#002147',fontFamily:'sans-serif',textAlign:'right'}}>{fmt(m.amount)}</div>
            </div>
          )})}
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 100px 110px',gap:16,padding:'14px 20px',background:'#002147',alignItems:'center'}}>
            <div/>
            <div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,.7)',fontFamily:'sans-serif'}}>Total contract value</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.4)',fontFamily:'sans-serif'}}>100%</div>
            <div/>
            <div style={{fontSize:20,fontWeight:700,color:'#FF8C00',fontFamily:'sans-serif',textAlign:'right'}}>{fmt(PROJECT.price)}</div>
          </div>
        </div>
      </div>

      {/* ── WARRANTY HERO ── */}
      <div className="pb" style={S.heroWrap}>
        <img src={PHOTOS.warranty} alt="" style={S.hero} onError={function(e){e.target.style.display='none'}}/>
        <div style={S.heroOverlay}><div style={S.heroLabel}>Warranty & Agreement</div></div>
      </div>

      {/* ── WARRANTY + SIGNATURE ── */}
      <div style={S.sectionLast}>
        <div style={S.eyebrow}>Workmanship warranty</div>
        <div style={S.h2}>1-year warranty and authorization</div>
        <div style={{background:'#002147',borderRadius:4,padding:'1.5rem 2rem',marginBottom:'1.5rem',borderLeft:'6px solid #FF8C00'}}>
          <div style={{fontSize:16,color:'#fff',marginBottom:'.75rem',lineHeight:1.5}}>SpanglerBuilt warrants all workmanship for one full year from the date of project completion.</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.65)',lineHeight:1.8,fontFamily:'sans-serif'}}>This warranty covers defects in workmanship and installation performed by SpanglerBuilt Inc. and its subcontractors. It does not cover damage caused by misuse, normal wear and tear, or acts of nature. Manufacturer warranties on materials and products are separate and may extend beyond this period.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1.5rem',marginBottom:'3rem'}}>
          {[['Coverage period','1 year from project completion date'],['What is covered','All labor and installation by SpanglerBuilt'],['Response time','Michael responds within 2 business days'],['How to submit','Client portal · (404) 492-7650']].map(function(item){return(
            <div key={item[0]} style={{borderTop:'3px solid #FF8C00',paddingTop:'1rem'}}>
              <div style={S.label}>{item[0]}</div>
              <div style={{fontSize:12,color:'#002147',fontFamily:'sans-serif',lineHeight:1.6}}>{item[1]}</div>
            </div>
          )})}
        </div>

        {/* Signature blocks */}
        <div style={{borderTop:'2px solid #002147',paddingTop:'2rem',marginBottom:'2rem'}}>
          <div style={S.eyebrow}>Authorization and agreement</div>
          <div style={{fontSize:12,color:'#5f5e5a',fontFamily:'sans-serif',marginBottom:'2rem',lineHeight:1.7}}>Client signature below confirms acceptance of the scope of work, selected tier, payment schedule, and all terms outlined in this project book. SpanglerBuilt signature confirms commitment to deliver all work at the quality and price specified herein.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem'}}>
            <div>
              <div style={{borderBottom:'2px solid #002147',height:48,marginBottom:8}}/>
              <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>Client signature</div>
              <div style={{borderBottom:'1px solid #e8e6e0',height:36,marginTop:24,marginBottom:8}}/>
              <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>Date</div>
            </div>
            <div>
              <div style={{borderBottom:'2px solid #002147',height:48,marginBottom:8}}/>
              <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>Michael Spangler — SpanglerBuilt Inc.</div>
              <div style={{borderBottom:'1px solid #e8e6e0',height:36,marginTop:24,marginBottom:8}}/>
              <div style={{fontSize:11,color:'#9a9690',fontFamily:'sans-serif'}}>Date</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{borderTop:'1px solid #e8e6e0',paddingTop:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:28,width:'auto'}}/>
          <div style={{fontSize:9,color:'#9a9690',fontFamily:'sans-serif',textAlign:'right',lineHeight:1.7}}>
            SpanglerBuilt Inc. · 44 Milton Ave, Suite 243 · Woodstock, GA 30188<br/>
            (404) 492-7650 · michael@spanglerbuilt.com · spanglerbuilt.com<br/>
            Licensed General Contractor · State of Georgia · {PROJECT.number}
          </div>
        </div>
      </div>
    </div>
  )
}export async function getServerSideProps() { return { props: {} } }
