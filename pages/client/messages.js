import { useState } from 'react'

const INIT_MESSAGES = [
  { id:1, role:'contractor', name:'Michael Spangler', text:'Hi Ryan & Dori — framing is going great. We should be done by end of week. I\'ll post photos tomorrow.', time:'Today 9:14am', read:false },
  { id:2, role:'contractor', name:'Michael Spangler', text:'Quick heads up — we found a small area of moisture near the east wall during demo. We sealed it with Drylok and added extra vapor barrier. No cost impact. I\'ll show you in person on your next site visit.', time:'Yesterday 3:42pm', read:false },
  { id:3, role:'client', name:'Ryan & Dori', text:'That\'s great news on the framing! Should we plan to come by Friday afternoon?', time:'Yesterday 4:10pm', read:true },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState(INIT_MESSAGES)
  const [input,    setInput]    = useState('')

  function send() {
    if (!input.trim()) return
    setMessages(m => [...m, {
      id: m.length+1, role:'client', name:'Ryan & Dori',
      text: input.trim(), time:'Just now', read:true,
    }])
    setInput('')
  }

  function onKey(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00',flexShrink:0}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>SPANGLERBUILT <span style={{fontSize:11,color:'#FF8C00',fontWeight:400}}> · MESSAGES</span></div>
        <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← My project</a>
      </div>

      <div style={{maxWidth:700,width:'100%',margin:'0 auto',padding:'1.5rem',flex:1,display:'flex',flexDirection:'column',gap:16}}>

        <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:4,padding:'10px 14px',fontSize:12,color:'#3d3b37'}}>
          Direct messages with the SpanglerBuilt team. Michael typically responds within 2 hours during business hours.
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
          {messages.map(m => (
            <div key={m.id} style={{display:'flex',justifyContent:m.role==='client'?'flex-end':'flex-start',gap:8}}>
              {m.role==='contractor' && (
                <div style={{width:32,height:32,background:'#002147',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#FF8C00',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2}}>MS</div>
              )}
              <div style={{maxWidth:'72%'}}>
                <div style={{fontSize:10,color:'#9a9690',marginBottom:3,textAlign:m.role==='client'?'right':'left'}}>
                  {m.name} · {m.time} {m.role==='contractor'&&!m.read&&<span style={{background:'#FF8C00',color:'#fff',fontSize:8,padding:'1px 5px',borderRadius:2,marginLeft:4}}>NEW</span>}
                </div>
                <div style={{
                  padding:'10px 14px',borderRadius:8,fontSize:13,lineHeight:1.7,
                  background:m.role==='client'?'#002147':'#fff',
                  color:m.role==='client'?'#fff':'#3d3b37',
                  border:m.role==='client'?'none':'1px solid #e8e6e0',
                }}>
                  {m.text}
                </div>
              </div>
              {m.role==='client' && (
                <div style={{width:32,height:32,background:'#FF8C00',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2}}>RM</div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,padding:10,display:'flex',gap:8,flexShrink:0}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
            placeholder="Type a message to Michael..."
            style={{flex:1,fontFamily:'sans-serif',fontSize:13,border:'none',outline:'none',resize:'none',height:52,lineHeight:1.5}}
          />
          <button onClick={send} disabled={!input.trim()} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'0 18px',borderRadius:3,cursor:'pointer',fontSize:16,fontWeight:700,flexShrink:0,opacity:!input.trim()?.5:1}}>→</button>
        </div>

        <div style={{fontSize:10,color:'#9a9690',textAlign:'center'}}>
          For urgent matters call (404) 492-7650 · SpanglerBuilt Inc.
        </div>
      </div>
    </div>
  )
}
