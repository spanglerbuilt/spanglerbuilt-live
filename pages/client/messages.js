import ClientNav from './_nav'
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
    <div style={{minHeight:'100vh',background:'#111',fontFamily:'Poppins,sans-serif',display:'flex',flexDirection:'column'}}>
      <ClientNav />

      <div style={{maxWidth:700,width:'100%',margin:'0 auto',padding:'1.5rem',flex:1,display:'flex',flexDirection:'column',gap:16}}>

        <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'10px 14px',fontSize:12,color:'rgba(255,255,255,.65)'}}>
          Direct messages with the SpanglerBuilt team. Michael typically responds within 2 hours during business hours.
        </div>

        <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
          {messages.map(m => (
            <div key={m.id} style={{display:'flex',justifyContent:m.role==='client'?'flex-end':'flex-start',gap:8}}>
              {m.role==='contractor' && (
                <div style={{width:32,height:32,background:'#0a0a0a',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#D06830',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2}}>MS</div>
              )}
              <div style={{maxWidth:'72%'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:3,textAlign:m.role==='client'?'right':'left'}}>
                  {m.name} · {m.time} {m.role==='contractor'&&!m.read&&<span style={{background:'#D06830',color:'#fff',fontSize:8,padding:'1px 5px',borderRadius:2,marginLeft:4}}>NEW</span>}
                </div>
                <div style={{
                  padding:'10px 14px',borderRadius:8,fontSize:13,lineHeight:1.7,
                  background:m.role==='client'?'#0a0a0a':'#fff',
                  color:m.role==='client'?'#fff':'#3d3b37',
                  border:m.role==='client'?'none':'1px solid #e8e6e0',
                }}>
                  {m.text}
                </div>
              </div>
              {m.role==='client' && (
                <div style={{width:32,height:32,background:'#D06830',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:700,flexShrink:0,marginTop:2}}>RM</div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:10,display:'flex',gap:8,flexShrink:0}}>
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
            placeholder="Type a message to Michael..."
            style={{flex:1,fontFamily:'Poppins,sans-serif',fontSize:13,border:'none',outline:'none',resize:'none',height:52,lineHeight:1.5}}
          />
          <button onClick={send} disabled={!input.trim()} style={{background:'#D06830',color:'#fff',border:'none',padding:'0 18px',borderRadius:3,cursor:'pointer',fontSize:16,fontWeight:700,flexShrink:0,opacity:!input.trim()?.5:1}}>→</button>
        </div>

        <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          For urgent matters call (404) 492-7650 · SpanglerBuilt Inc.
        </div>
      </div>
    </div>
  )
}
