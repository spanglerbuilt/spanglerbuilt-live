import Layout from '../../components/Layout'

export default function ScopePage() {
  const phases = [
    { num:1, name:'Pre-construction', status:'complete', items:[
      'Site visit and measurements completed',
      'Permits applied for (DeKalb County)',
      'Material selections initiated',
      'Subcontractor bids received and awarded',
      'Project schedule confirmed — start Feb 9, 2026',
    ]},
    { num:2, name:'Demo & rough framing', status:'complete', items:[
      'Existing finishes demolished and removed',
      'Concrete floor prepped and leveled',
      'Moisture barrier installed',
      'Perimeter and interior walls framed',
      'Soffit and beam box framing complete',
      'Bar area rough framing complete',
      'Bathroom backing and blocking installed',
    ]},
    { num:3, name:'Rough mechanicals (plumbing, electrical, HVAC)', status:'in progress', items:[
      'Bathroom DWV rough-in',
      'Bar sink plumbing rough-in',
      'Electrical panel review and circuit additions',
      'LED recessed light rough-in (20 fixtures)',
      'HVAC ductwork extension — 2 new registers',
      'Exhaust fan rough-in — bathroom',
    ]},
    { num:4, name:'Insulation, drywall & finishes', status:'upcoming', items:[
      'Spray foam — rim joists',
      'Rigid foam — perimeter walls',
      'Drywall hang and finish (level 4)',
      'Moisture-resistant drywall — bathroom',
      'Tile installation — bathroom floor and shower walls',
      'LVP flooring installation — main areas',
      'Paint — walls, ceilings, trim (2 coats)',
    ]},
    { num:5, name:'Fixtures, trim & closeout', status:'upcoming', items:[
      'Plumbing fixtures installed — toilet, vanity, shower',
      'Bar cabinets and countertop installed',
      'Interior doors and hardware installed',
      'Electrical fixtures — outlets, switches, lighting',
      'Bath accessories installed',
      'Final cleaning and punch list walkthrough',
      'Client final walkthrough and CO sign-off',
    ]},
  ]
  const STATUS = {
    complete:    {bg:'#eaf3de',color:'#3B6D11',dot:'#3B6D11',label:'Complete'},
    'in progress':{bg:'#fff3e0',color:'#D06830',dot:'#D06830',label:'In progress'},
    upcoming:    {bg:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)',dot:'#e8e6e0',label:'Upcoming'},
  }
  return (
    <Layout>
      <div style={{maxWidth:800,margin:'0 auto',padding:'1.5rem'}}>
        <div style={{background:'#0a0a0a',borderRadius:4,padding:'1rem 1.5rem',marginBottom:'1.25rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:16,color:'#fff',marginBottom:2}}>Mendel Basement Renovation</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>SB-2026-001 · 665 sf · 5 phases · Feb 9 – Apr 22, 2026</div>
          </div>
          <div style={{display:'flex',gap:12}}>
            {[['Complete','#3B6D11'],['In progress','#D06830'],['Upcoming','#9a9690']].map(([l,c])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:4}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:c,flexShrink:0}}/>
                <span style={{fontSize:10,color:'rgba(255,255,255,.6)'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {phases.map(phase=>{
          const sc = STATUS[phase.status]
          return (
            <div key={phase.num} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',marginBottom:10}}>
              <div style={{background:sc.bg,padding:'10px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e8e6e0'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:24,height:24,background:'#0a0a0a',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#D06830',flexShrink:0}}>{phase.num}</div>
                  <span style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{phase.name}</span>
                </div>
                <span style={{background:sc.color+'22',color:sc.color,fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:3,textTransform:'uppercase'}}>{sc.label}</span>
              </div>
              <div style={{padding:'10px 14px'}}>
                {phase.items.map((item,i)=>(
                  <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'5px 0',borderBottom:i<phase.items.length-1?'1px solid rgba(255,255,255,.07)':'none',fontSize:12,color:phase.status==='upcoming'?'#9a9690':'#3d3b37'}}>
                    <span style={{color:phase.status==='complete'?'#3B6D11':phase.status==='in progress'?'#D06830':'#e8e6e0',fontSize:12,flexShrink:0,marginTop:1}}>
                      {phase.status==='complete'?'✓':phase.status==='in progress'?'●':'○'}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        <div style={{marginTop:'1rem',fontSize:11,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          Questions about scope? Call Michael at (404) 492-7650 · SpanglerBuilt Inc.
        </div>
      </div>
    </Layout>
  )
}
