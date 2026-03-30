import { useState } from 'react'

const TEMPLATES = [
  {
    id: 'BSM-665-FULL',
    code: 'BSM',
    name: 'Full basement renovation — 665 sf',
    desc: 'Full finish with bathroom, bar area, LVP flooring, 20 recessed lights. Standard Cherokee/DeKalb market pricing.',
    tags: ['basement','bathroom','bar','LVP','665sf'],
    sqft: 665,
    divisions: 16,
    estimateBase: 43970,
    duration: '8–10 weeks',
    phases: 5,
    uses: 3,
    lastUsed: '2026-BSM-001-RM · Mendel · Mar 2026',
    tiers: { good: 53000, better: 62000, best: 73000, luxury: 89000 },
    scope: [
      'Demo existing finishes and haul off',
      'Concrete floor prep, leveling, vapor barrier',
      'Perimeter and interior wall framing',
      'Spray foam rim joists, rigid foam perimeter',
      'Full bathroom rough-in (DWV + fixtures)',
      'Custom bar framing and rough carpentry',
      'HVAC extension — 2 new registers',
      'Electrical — 20 recessed lights, panel review',
      'Drywall hang and finish (level 4)',
      'LVP flooring installation — main areas',
      'Tile — bathroom floor and shower walls',
      'Paint — 2 coats walls, ceilings, trim',
      'Bar cabinets and countertop (allowance)',
      'All fixtures, hardware, accessories (allowance)',
    ],
  },
  {
    id: 'BSM-500-BATH',
    code: 'BSM',
    name: 'Basement renovation — 500 sf + bath only',
    desc: 'Smaller basement, full bathroom but no bar. Good for starter homes and townhomes.',
    tags: ['basement','bathroom','500sf','no bar'],
    sqft: 500,
    divisions: 14,
    estimateBase: 32000,
    duration: '6–8 weeks',
    phases: 4,
    uses: 1,
    lastUsed: '2026-BSM-005-MR · Rivera · Mar 2026',
    tiers: { good: 39000, better: 46000, best: 54000, luxury: 65000 },
    scope: [
      'Demo existing finishes',
      'Concrete floor prep and vapor barrier',
      'Perimeter and interior wall framing',
      'Spray foam and insulation',
      'Full bathroom rough-in',
      'HVAC extension — 1 register',
      'Electrical — 14 recessed lights',
      'Drywall hang and finish',
      'LVP flooring',
      'Tile — bathroom',
      'Paint',
      'Fixtures and hardware (allowance)',
    ],
  },
  {
    id: 'KIT-FULL-OPEN',
    code: 'KIT',
    name: 'Full kitchen remodel — open floor plan',
    desc: 'Wall removal, new cabinets, countertops, backsplash, appliances. Alpharetta/Woodstock market.',
    tags: ['kitchen','open floor plan','cabinets','quartz'],
    sqft: 280,
    divisions: 12,
    estimateBase: 58000,
    duration: '6–8 weeks',
    phases: 4,
    uses: 1,
    lastUsed: '2026-KIT-002-JP · Park · Mar 2026',
    tiers: { good: 62000, better: 73000, best: 85000, luxury: 102000 },
    scope: [
      'Demo existing cabinets, countertops, flooring',
      'Wall removal (structural engineer if load-bearing)',
      'Electrical — under-cabinet lighting, new circuits',
      'Plumbing — sink, dishwasher, gas line',
      'New cabinets — base and upper (allowance)',
      'Countertops — quartz or stone (allowance)',
      'Tile backsplash',
      'LVP or hardwood flooring',
      'Paint',
      'Appliance installation',
      'Fixtures and hardware (allowance)',
    ],
  },
  {
    id: 'BTH-PRIMARY',
    code: 'BTH',
    name: 'Primary bathroom gut renovation',
    desc: 'Full gut — new tile, frameless glass shower, double vanity, freestanding tub option.',
    tags: ['bathroom','primary bath','tile','frameless glass','double vanity'],
    sqft: 120,
    divisions: 10,
    estimateBase: 22000,
    duration: '4–6 weeks',
    phases: 3,
    uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 24000, better: 28000, best: 33000, luxury: 41000 },
    scope: [
      'Full demo — tile, drywall, fixtures',
      'Waterproofing membrane — shower and wet areas',
      'Plumbing rough-in — shower, tub, double vanity',
      'Electrical — exhaust fan, vanity lighting, heated floor',
      'Moisture-resistant drywall',
      'Large-format tile — floor and shower walls (allowance)',
      'Frameless glass shower enclosure',
      'Double vanity cabinet and top (allowance)',
      'Plumbing fixtures (allowance)',
      'Paint',
    ],
  },
  {
    id: 'ADD-BONUS-ROOM',
    code: 'ADD',
    name: 'Home addition — bonus room over garage',
    desc: 'Bonus room addition above existing garage. 400 sf. Includes HVAC, electrical, egress window.',
    tags: ['addition','bonus room','over garage','400sf'],
    sqft: 400,
    divisions: 16,
    estimateBase: 118000,
    duration: '16–20 weeks',
    phases: 6,
    uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 130000, better: 153000, best: 179000, luxury: 215000 },
    scope: [
      'Structural engineering review and stamped drawings',
      'Permit — Cherokee or applicable county',
      'Structural framing — floor system, walls, roof',
      'Roofing tie-in and weatherproofing',
      'HVAC extension — new zone',
      'Electrical — panel capacity, lighting, outlets',
      'Insulation — walls, ceiling, floor',
      'Drywall hang and finish',
      'Flooring — LVP or carpet (allowance)',
      'Paint',
      'Egress window',
      'Trim and doors',
    ],
  },
  {
    id: 'CHB-2500-SPEC',
    code: 'CHB',
    name: 'Custom home build — 2,500 sf spec',
    desc: '2,500 sf 4BR/3BA single-family spec build. Cherokee County. Slab foundation.',
    tags: ['custom home','spec build','2500sf','4 bedroom','Cherokee County'],
    sqft: 2500,
    divisions: 16,
    estimateBase: 425000,
    duration: '12–15 months',
    phases: 8,
    uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 487000, better: 575000, best: 672000, luxury: 806000 },
    scope: [
      'Land clearing and grading',
      'Slab foundation',
      'Framing — walls, roof system',
      'Roofing — architectural shingles',
      'Windows and exterior doors',
      'Exterior siding and trim',
      'HVAC — 2 zones',
      'Plumbing — rough-in and finish',
      'Electrical — service, rough-in, finish',
      'Insulation',
      'Drywall',
      'Interior trim and doors',
      'Cabinets and countertops (allowance)',
      'Flooring (allowance)',
      'Fixtures and hardware (allowance)',
      'Paint',
      'Landscaping and drive (allowance)',
    ],
  },
]

const TYPE_COLORS = {
  BSM: { bg:'#e6f1fb', color:'#185FA5' },
  KIT: { bg:'#faeeda', color:'#854F0B' },
  BTH: { bg:'#eeedfe', color:'#534AB7' },
  ADD: { bg:'#eaf3de', color:'#3B6D11' },
  CHB: { bg:'#fcebeb', color:'#A32D2D' },
}

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function TemplatesPage() {
  const [search,     setSearch]     = useState('')
  const [filterType, setFilterType] = useState('All')
  const [expanded,   setExpanded]   = useState(null)
  const [cloning,    setCloning]    = useState(null)

  const types = ['All','BSM','KIT','BTH','ADD','CHB']

  const filtered = TEMPLATES.filter(t => {
    const matchType = filterType === 'All' || t.code === filterType
    const q = search.toLowerCase()
    const matchSearch = !q ||
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    return matchType && matchSearch
  })

  function useTemplate(tmpl) {
    setCloning(tmpl)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f5f4f1',fontFamily:'sans-serif',position:'relative'}}>

      {/* Topbar */}
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src='/logo.png' alt='SpanglerBuilt' style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#FF8C00',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>&nbsp;· Project Templates</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      {/* Clone modal */}
      {cloning && (
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(0,33,71,.85)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',minHeight:'100vh'}}>
          <div style={{background:'#fff',borderRadius:4,maxWidth:560,width:'100%',overflow:'hidden',border:'3px solid #FF8C00'}}>
            <div style={{background:'#002147',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #FF8C00'}}>
              <div style={{color:'#FF8C00',fontSize:13,fontWeight:700}}>Start new project from template</div>
              <button onClick={()=>setCloning(null)} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{background:'#FFFCEB',border:'1px solid #FF8C00',borderRadius:3,padding:'10px 12px',marginBottom:'1.25rem',fontSize:12,color:'#3d3b37'}}>
                <strong style={{color:'#002147'}}>Template:</strong> {cloning.name}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Client name</div>
                  <input placeholder="First & Last name" style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB'}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Client email</div>
                  <input placeholder="client@email.com" style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB'}}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Project address</div>
                <input placeholder="Street address, City, GA ZIP" style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB'}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Square footage</div>
                  <input defaultValue={cloning.sqft} style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB'}}/>
                </div>
                <div>
                  <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:5}}>Starting tier</div>
                  <select style={{width:'100%',padding:'8px 10px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#fff'}}>
                    {Object.entries(cloning.tiers).map(([t,v])=>(
                      <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)} — {fmt(v)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{background:'#f5f4f1',borderRadius:3,padding:'10px 12px',marginBottom:'1.25rem',fontSize:11,color:'#9a9690'}}>
                This will create a new project with a sequential SB-{new Date().getFullYear()}-XXX number, pre-fill the estimate with all {cloning.divisions} divisions, generate the scope of work, and set up the client portal automatically.
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={function(){
                  if(typeof window !== 'undefined'){
                    window.location.href = '/contractor/leads?template=' + cloning.id
                  }
                }} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'10px 24px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',flex:1}}>
                  Create project from template →
                </button>
                <button onClick={()=>setCloning(null)} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'10px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{maxWidth:1000,margin:'0 auto',padding:'1.5rem'}}>

        {/* Search and filter */}
        <div style={{display:'flex',gap:10,marginBottom:'1.25rem',flexWrap:'wrap',alignItems:'center'}}>
          <input
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search templates — basement, kitchen, 665sf, bar..."
            style={{flex:1,minWidth:220,padding:'9px 12px',border:'1px solid #e8e6e0',borderRadius:3,fontSize:13,fontFamily:'sans-serif',outline:'none',background:'#FFFCEB'}}
          />
          <div style={{display:'flex',gap:4}}>
            {types.map(t=>(
              <button key={t} onClick={()=>setFilterType(t)} style={{
                padding:'6px 14px',fontSize:11,border:'1px solid',fontFamily:'sans-serif',fontWeight:500,cursor:'pointer',borderRadius:3,
                borderColor:filterType===t?'#002147':'#e8e6e0',
                background:filterType===t?'#002147':'#fff',
                color:filterType===t?'#FF8C00':'#9a9690',
              }}>{t==='All'?'All types':t}</button>
            ))}
          </div>
          <button style={{background:'#FF8C00',color:'#fff',border:'none',padding:'8px 16px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',whiteSpace:'nowrap'}}>
            + New template
          </button>
        </div>

        <div style={{fontSize:11,color:'#9a9690',marginBottom:'1rem'}}>{filtered.length} template{filtered.length!==1?'s':''} · {TEMPLATES.reduce((s,t)=>s+t.uses,0)} total uses</div>

        {/* Template cards */}
        <div style={{display:'grid',gap:10}}>
          {filtered.map(tmpl => {
            const tc  = TYPE_COLORS[tmpl.code] || TYPE_COLORS.BSM
            const exp = expanded === tmpl.id
            return (
              <div key={tmpl.id} style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',borderLeft:'4px solid #002147'}}>

                {/* Card header */}
                <div style={{padding:'1rem 1.25rem',display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer'}} onClick={()=>setExpanded(exp?null:tmpl.id)}>
                  <div style={{flexShrink:0}}>
                    <span style={{background:tc.bg,color:tc.color,fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:3,display:'block',textAlign:'center',letterSpacing:'.06em'}}>{tmpl.code}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,color:'#002147',marginBottom:3}}>{tmpl.name}</div>
                    <div style={{fontSize:12,color:'#9a9690',marginBottom:6}}>{tmpl.desc}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {tmpl.tags.map(tag=>(
                        <span key={tag} style={{background:'#f5f4f1',color:'#5f5e5a',fontSize:10,padding:'1px 7px',borderRadius:3}}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:16,flexShrink:0,alignItems:'flex-start'}}>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'#9a9690',marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>Good tier est.</div>
                      <div style={{fontSize:15,fontWeight:500,color:'#002147'}}>{fmt(tmpl.tiers.good)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'#9a9690',marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>Used</div>
                      <div style={{fontSize:15,fontWeight:500,color:'#002147'}}>{tmpl.uses}×</div>
                    </div>
                    <div style={{fontSize:12,color:'#9a9690',marginTop:2}}>{exp?'▲':'▼'}</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {exp && (
                  <div style={{borderTop:'1px solid #f5f4f1'}}>

                    {/* Tier pricing */}
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'#e8e6e0',margin:'0'}}>
                      {Object.entries(tmpl.tiers).map(([tier,val])=>{
                        const tc2 = {good:{c:'#3B6D11',bg:'#eaf3de'},better:{c:'#185FA5',bg:'#e6f1fb'},best:{c:'#534AB7',bg:'#eeedfe'},luxury:{c:'#854F0B',bg:'#faeeda'}}[tier]
                        return (
                          <div key={tier} style={{background:'#fff',padding:'10px 14px',textAlign:'center'}}>
                            <div style={{fontSize:9,fontWeight:700,color:tc2.c,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{tier}</div>
                            <div style={{fontSize:16,fontWeight:500,color:'#002147'}}>{fmt(val)}</div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Details row */}
                    <div style={{display:'flex',gap:0,background:'#f5f4f1',borderTop:'1px solid #e8e6e0',borderBottom:'1px solid #e8e6e0'}}>
                      {[['Sq footage',tmpl.sqft+' sf'],['Duration',tmpl.duration],['Phases',tmpl.phases],['Divisions',tmpl.divisions]].map(([l,v])=>(
                        <div key={l} style={{flex:1,padding:'8px 14px',borderRight:'1px solid #e8e6e0'}}>
                          <div style={{fontSize:9,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:500,color:'#002147'}}>{v}</div>
                        </div>
                      ))}
                      <div style={{flex:2,padding:'8px 14px'}}>
                        <div style={{fontSize:9,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Last used</div>
                        <div style={{fontSize:11,color:'#5f5e5a'}}>{tmpl.lastUsed}</div>
                      </div>
                    </div>

                    {/* Scope list */}
                    <div style={{padding:'1rem 1.25rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 24px'}}>
                      {tmpl.scope.map((item,i)=>(
                        <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'3px 0',fontSize:12,color:'#3d3b37'}}>
                          <span style={{color:'#FF8C00',fontSize:11,flexShrink:0,marginTop:1}}>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div style={{padding:'0 1.25rem 1rem',display:'flex',gap:8}}>
                      <button onClick={function(){setCloning(tmpl)}} style={{background:'#FF8C00',color:'#fff',border:'none',padding:'9px 20px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                        Use this template →
                      </button>
                      <button onClick={function(){alert('Edit template coming soon')}} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'9px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                        Edit template
                      </button>
                      <button onClick={function(){alert('Template duplicated!')}} style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'9px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                        Duplicate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{marginTop:'1.5rem',fontSize:10,color:'#9a9690',textAlign:'center'}}>
          SpanglerBuilt Inc. · Project template library · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </div>
  )
}
