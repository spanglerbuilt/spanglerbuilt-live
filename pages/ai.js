import { useState } from 'react'
export default function AIPage() {
  var [action,  setAction]  = useState('estimate')
  var [prompt,  setPrompt]  = useState('')
  var [result,  setResult]  = useState('')
  var [loading, setLoading] = useState(false)
  var ACTIONS = [
    {id:'estimate',   label:'Generate estimate'},
    {id:'proposal',   label:'Write proposal'},
    {id:'email',      label:'Draft email'},
    {id:'selections', label:'Recommend materials'},
    {id:'contract',   label:'Generate contract'},
    {id:'changeOrder',label:'Change order'},
    {id:'clientChat', label:'Client Q&A'},
    {id:'review',     label:'Review reply'},
    {id:'taskPlan',   label:'Task plan'},
  ]
  function run() {
    if (!prompt.trim()) return
    setLoading(true)
    setResult('')
    fetch('/api/claude', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:action, data:{prompt:prompt}}),
    }).then(function(r){return r.json()}).then(function(j){
      setResult(j.result || j.error || 'No response')
      setLoading(false)
    }).catch(function(e){
      setResult('Error: ' + e.message)
      setLoading(false)
    })
  }
  function onKey(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); run() } }
  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}>AI TOOLS</span></div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>Back to dashboard</a>
      </div>
      <div style={{padding:'1.5rem',maxWidth:1000,margin:'0 auto'}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {ACTIONS.map(function(a){return (
            <button key={a.id} onClick={function(){setAction(a.id)}} style={{padding:'6px 14px',fontSize:11,border:'1px solid',fontFamily:'inherit',fontWeight:500,cursor:'pointer',borderRadius:3,borderColor:action===a.id?'#002147':'#e8e6e0',background:action===a.id?'#002147':'#fff',color:action===a.id?'#FF8C00':'#5f5e5a'}}>{a.label}</button>
          )})}
        </div>
        <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,padding:'1.5rem',marginBottom:'1rem'}}>
          <div style={{fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Describe your project</div>
          <textarea value={prompt} onChange={function(e){setPrompt(e.target.value)}} onKeyDown={onKey}
            placeholder="e.g. Basement renovation for SB-2026-001 Mendel project, 665 sf, full bathroom, custom bar, LVP flooring, Dunwoody GA, budget $50K-$100K."
            style={{width:'100%',fontFamily:'inherit',fontSize:13,border:'1px solid #e8e6e0',borderRadius:3,padding:'10px',minHeight:100,outline:'none',resize:'vertical',marginBottom:12,background:'#FFFCEB'}}/>
          <button onClick={run} disabled={loading||!prompt.trim()} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'10px 24px',fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'inherit',opacity:loading||!prompt.trim()?0.5:1}}>
            {loading ? 'Claude is writing...' : 'Generate with Claude'}
          </button>
        </div>
        {result && (
          <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden'}}>
            <div style={{background:'#002147',padding:'8px 1rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{color:'#FF8C00',fontSize:12,fontWeight:500}}>Claude AI Output</span>
              <button onClick={function(){navigator.clipboard.writeText(result)}} style={{background:'transparent',border:'1px solid #333',color:'#9a9690',fontSize:10,padding:'2px 8px',cursor:'pointer',borderRadius:3,fontFamily:'inherit'}}>Copy</button>
            </div>
            <div style={{padding:'1.25rem',fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',color:'#3d3b37',maxHeight:500,overflowY:'auto'}}>{result}</div>
          </div>
        )}
      </div>
    </div>
  )
}
