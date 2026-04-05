import { useState } from 'react'

var PROJECT_TYPES = [
  'Basement Renovation','Kitchen Remodel','Bathroom Remodel',
  'Home Addition','Deck / Patio','Screened Porch',
  'Custom Home Build','Whole-Home Renovation','Other'
]
var BUDGETS = [
  'Under $25K','$25K–$50K','$50K–$100K',
  '$100K–$250K','$250K–$500K','$500K+'
]
var TIMELINES = ['ASAP','1–3 months','3–6 months','6–12 months','Planning ahead']
var REFERRALS = ['Google search','Friend or neighbor','Houzz','Instagram / Facebook','Nextdoor','Past client','Other']

export default function ContactPage() {
  var [form, setForm] = useState({
    firstName:'',lastName:'',email:'',phone:'',
    address:'',projectType:'',description:'',
    budget:'',timeline:'',referral:'',
  })
  var [step,      setStep]      = useState(1)
  var [loading,   setLoading]   = useState(false)
  var [result,    setResult]    = useState(null)
  var [error,     setError]     = useState('')

  function setF(k,v) { setForm(function(f){return Object.assign({},f,{[k]:v})}) }

  function valid1() { return form.firstName && form.lastName && form.email && form.phone }
  function valid2() { return form.projectType && form.description }

  async function submit() {
    setLoading(true)
    setError('')
    try {
      var r = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(form),
      })
      var j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Submission failed')
      setResult(j)
      setStep(4)
    } catch(e) {
      setError(e.message)
    }
    setLoading(false)
  }

  var topbar = (
    <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
      </div>
      <div style={{textAlign:'right'}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>We build more than projects — we build lifestyles.</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:2}}>Design/Build Contractor · GC &amp; Home Builder</div>
        </div>
    </div>
  )

  // Step indicators
  var steps = ['Your info','Your project','Details','Submitted']
  var stepBar = (
    <div style={{display:'flex',background:'#1a1a1a',borderBottom:'1px solid #e8e6e0'}}>
      {steps.map(function(s,i){
        var active = step === i+1
        var done   = step > i+1
        return (
          <div key={s} style={{flex:1,padding:'10px',textAlign:'center',fontSize:11,fontWeight:active?500:400,color:active?'#0a0a0a':done?'#3B6D11':'#9a9690',borderBottom:active?'2px solid #D06830':done?'2px solid #3B6D11':'2px solid transparent',background:active?'#fff':'transparent'}}>
            {done?'✓ ':''}{s}
          </div>
        )
      })}
    </div>
  )

  // Success screen
  if (step === 4 && result) {
    return (
      <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>
        {topbar}
        <div style={{maxWidth:600,margin:'3rem auto',padding:'0 1.5rem',textAlign:'center'}}>
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'3rem',borderTop:'4px solid #D06830'}}>
            <div style={{width:56,height:56,background:'#eaf3de',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.25rem',fontSize:24,color:'#3B6D11'}}>✓</div>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:22,color:'rgba(255,255,255,.75)',marginBottom:8}}>We received your project!</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.35)',marginBottom:'1.5rem',lineHeight:1.7}}>
              Your project number is<br/>
              <strong style={{fontSize:20,color:'rgba(255,255,255,.75)',fontFamily:'Poppins,sans-serif'}}>{result.projectNumber}</strong><br/>
              Michael will contact you within 1 business day.
            </div>
            {result.ballpark && (
              <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'1rem 1.25rem',marginBottom:'1.5rem',textAlign:'left'}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.75)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>AI ballpark estimate — your project</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.65)',lineHeight:1.9,whiteSpace:'pre-wrap'}}>{result.ballpark}</div>
                <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:8}}>This is a preliminary estimate only. Your formal 4-tier written estimate will be delivered within 48 hours of your site visit.</div>
              </div>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'center'}}>
              <a href="tel:4044927650" style={{background:'#D06830',color:'#fff',padding:'10px 20px',fontSize:12,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em'}}>
                Call Michael: (404) 492-7650
              </a>
              <a href="/" style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'10px 20px',fontSize:12,textDecoration:'none',borderRadius:3}}>
                Back to home
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif'}}>
      {topbar}
      {stepBar}
      <div style={{maxWidth:680,margin:'0 auto',padding:'1.5rem'}}>

        {/* Step 1 — Contact info */}
        {step === 1 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem'}}>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,color:'rgba(255,255,255,.75)',marginBottom:4}}>Tell us about yourself</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:'1.25rem'}}>We'll use this to create your project file and send your confirmation.</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>First name *</div>
                <input value={form.firstName} onChange={function(e){setF('firstName',e.target.value)}} placeholder="Michael" style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Last name *</div>
                <input value={form.lastName} onChange={function(e){setF('lastName',e.target.value)}} placeholder="Spangler" style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Email *</div>
                <input type="email" value={form.email} onChange={function(e){setF('email',e.target.value)}} placeholder="you@email.com" style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Phone *</div>
                <input type="tel" value={form.phone} onChange={function(e){setF('phone',e.target.value)}} placeholder="(404) 555-0100" style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
              </div>
            </div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Project address</div>
              <input value={form.address} onChange={function(e){setF('address',e.target.value)}} placeholder="Street address, City, GA ZIP" style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
            </div>
            <button onClick={function(){if(valid1())setStep(2)}} disabled={!valid1()} style={{background:'#D06830',color:'#fff',border:'none',padding:'11px 28px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',opacity:valid1()?1:0.5}}>
              Next — your project →
            </button>
          </div>
        )}

        {/* Step 2 — Project type */}
        {step === 2 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem'}}>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,color:'rgba(255,255,255,.75)',marginBottom:4}}>Tell us about your project</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:'1.25rem'}}>The more detail you give, the more accurate your ballpark estimate will be.</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Project type *</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {PROJECT_TYPES.map(function(t){return (
                  <button key={t} onClick={function(){setF('projectType',t)}} style={{padding:'10px 8px',fontSize:11,fontWeight:500,border:'1px solid',borderColor:form.projectType===t?'#0a0a0a':'#e8e6e0',background:form.projectType===t?'#0a0a0a':'#fff',color:form.projectType===t?'#D06830':'#5f5e5a',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',textAlign:'center'}}>
                    {t}
                  </button>
                )})}
              </div>
            </div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Describe your project *</div>
              <textarea value={form.description} onChange={function(e){setF('description',e.target.value)}}
                placeholder="Tell us what you're envisioning — size, scope, style, must-haves. The more detail, the better your ballpark estimate."
                style={{width:'100%',padding:'9px 11px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',minHeight:100,resize:'vertical',background:'rgba(208,104,48,.1)'}}/>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={function(){setStep(1)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'11px 20px',fontSize:12,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>← Back</button>
              <button onClick={function(){if(valid2())setStep(3)}} disabled={!valid2()} style={{background:'#D06830',color:'#fff',border:'none',padding:'11px 28px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',opacity:valid2()?1:0.5}}>
                Next — budget and timeline →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Budget, timeline, referral */}
        {step === 3 && (
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'1.5rem'}}>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,color:'rgba(255,255,255,.75)',marginBottom:4}}>Almost done</div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:'1.25rem'}}>A few last details to complete your project inquiry.</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Budget range</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {BUDGETS.map(function(b){return (
                  <button key={b} onClick={function(){setF('budget',b)}} style={{padding:'7px 14px',fontSize:11,fontWeight:500,border:'1px solid',borderColor:form.budget===b?'#0a0a0a':'#e8e6e0',background:form.budget===b?'#0a0a0a':'#fff',color:form.budget===b?'#D06830':'#5f5e5a',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                    {b}
                  </button>
                )})}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Timeline</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {TIMELINES.map(function(t){return (
                  <button key={t} onClick={function(){setF('timeline',t)}} style={{padding:'7px 14px',fontSize:11,fontWeight:500,border:'1px solid',borderColor:form.timeline===t?'#0a0a0a':'#e8e6e0',background:form.timeline===t?'#0a0a0a':'#fff',color:form.timeline===t?'#D06830':'#5f5e5a',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                    {t}
                  </button>
                )})}
              </div>
            </div>
            <div style={{marginBottom:'1.25rem'}}>
              <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>How did you hear about us?</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {REFERRALS.map(function(r){return (
                  <button key={r} onClick={function(){setF('referral',r)}} style={{padding:'7px 14px',fontSize:11,fontWeight:500,border:'1px solid',borderColor:form.referral===r?'#0a0a0a':'#e8e6e0',background:form.referral===r?'#0a0a0a':'#fff',color:form.referral===r?'#D06830':'#5f5e5a',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                    {r}
                  </button>
                )})}
              </div>
            </div>
            <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:3,padding:'10px 12px',marginBottom:'1.25rem',fontSize:12,color:'rgba(255,255,255,.65)'}}>
              After you submit, Claude AI will instantly generate a ballpark estimate in all 4 tiers based on your project description. Michael will follow up within 1 business day.
            </div>
            {error && <div style={{fontSize:12,color:'#c0392b',marginBottom:10}}>{error}</div>}
            <div style={{display:'flex',gap:8}}>
              <button onClick={function(){setStep(2)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'11px 20px',fontSize:12,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>← Back</button>
              <button onClick={submit} disabled={loading} style={{background:'#D06830',color:'#fff',border:'none',padding:'11px 28px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',opacity:loading?0.6:1}}>
                {loading ? 'Submitting...' : 'Submit my project inquiry →'}
              </button>
            </div>
          </div>
        )}

        <div style={{marginTop:'1rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · Design/Build Contractor · GC &amp; Home Builder · Alpharetta, GA · (404) 492-7650 · michael@spanglerbuilt.com
        </div>
      </div>
    </div>
  )
}
