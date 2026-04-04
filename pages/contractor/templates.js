import Layout from '../../components/Layout'
import { useState } from 'react'

const INIT_TEMPLATES = [
  {
    id: 'BSM-665-FULL', code: 'BSM',
    name: 'Full basement renovation — 665 sf',
    desc: 'Full finish with bathroom, bar area, LVP flooring, 20 recessed lights. Standard Cherokee/DeKalb market pricing.',
    tags: ['basement','bathroom','bar','LVP','665sf'],
    sqft: 665, divisions: 16, estimateBase: 43970, duration: '8–10 weeks', phases: 5, uses: 3,
    lastUsed: '2026-BSM-001-RM · Mendel · Mar 2026',
    tiers: { good: 53000, better: 62000, best: 73000, luxury: 89000 },
    scope: [
      'Demo existing finishes and haul off','Concrete floor prep, leveling, vapor barrier',
      'Perimeter and interior wall framing','Spray foam rim joists, rigid foam perimeter',
      'Full bathroom rough-in (DWV + fixtures)','Custom bar framing and rough carpentry',
      'HVAC extension — 2 new registers','Electrical — 20 recessed lights, panel review',
      'Drywall hang and finish (level 4)','LVP flooring installation — main areas',
      'Tile — bathroom floor and shower walls','Paint — 2 coats walls, ceilings, trim',
      'Bar cabinets and countertop (allowance)','All fixtures, hardware, accessories (allowance)',
    ],
  },
  {
    id: 'BSM-500-BATH', code: 'BSM',
    name: 'Basement renovation — 500 sf + bath only',
    desc: 'Smaller basement, full bathroom but no bar. Good for starter homes and townhomes.',
    tags: ['basement','bathroom','500sf','no bar'],
    sqft: 500, divisions: 14, estimateBase: 32000, duration: '6–8 weeks', phases: 4, uses: 1,
    lastUsed: '2026-BSM-005-MR · Rivera · Mar 2026',
    tiers: { good: 39000, better: 46000, best: 54000, luxury: 65000 },
    scope: [
      'Demo existing finishes','Concrete floor prep and vapor barrier',
      'Perimeter and interior wall framing','Spray foam and insulation',
      'Full bathroom rough-in','HVAC extension — 1 register',
      'Electrical — 14 recessed lights','Drywall hang and finish',
      'LVP flooring','Tile — bathroom','Paint','Fixtures and hardware (allowance)',
    ],
  },
  {
    id: 'KIT-FULL-OPEN', code: 'KIT',
    name: 'Full kitchen remodel — open floor plan',
    desc: 'Wall removal, new cabinets, countertops, backsplash, appliances. Alpharetta/Woodstock market.',
    tags: ['kitchen','open floor plan','cabinets','quartz'],
    sqft: 280, divisions: 12, estimateBase: 58000, duration: '6–8 weeks', phases: 4, uses: 1,
    lastUsed: '2026-KIT-002-JP · Park · Mar 2026',
    tiers: { good: 62000, better: 73000, best: 85000, luxury: 102000 },
    scope: [
      'Demo existing cabinets, countertops, flooring','Wall removal (structural engineer if load-bearing)',
      'Electrical — under-cabinet lighting, new circuits','Plumbing — sink, dishwasher, gas line',
      'New cabinets — base and upper (allowance)','Countertops — quartz or stone (allowance)',
      'Tile backsplash','LVP or hardwood flooring','Paint',
      'Appliance installation','Fixtures and hardware (allowance)',
    ],
  },
  {
    id: 'BTH-PRIMARY', code: 'BTH',
    name: 'Primary bathroom gut renovation',
    desc: 'Full gut — new tile, frameless glass shower, double vanity, freestanding tub option.',
    tags: ['bathroom','primary bath','tile','frameless glass','double vanity'],
    sqft: 120, divisions: 10, estimateBase: 22000, duration: '4–6 weeks', phases: 3, uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 24000, better: 28000, best: 33000, luxury: 41000 },
    scope: [
      'Full demo — tile, drywall, fixtures','Waterproofing membrane — shower and wet areas',
      'Plumbing rough-in — shower, tub, double vanity','Electrical — exhaust fan, vanity lighting, heated floor',
      'Moisture-resistant drywall','Large-format tile — floor and shower walls (allowance)',
      'Frameless glass shower enclosure','Double vanity cabinet and top (allowance)',
      'Plumbing fixtures (allowance)','Paint',
    ],
  },
  {
    id: 'ADD-BONUS-ROOM', code: 'ADD',
    name: 'Home addition — bonus room over garage',
    desc: 'Bonus room addition above existing garage. 400 sf. Includes HVAC, electrical, egress window.',
    tags: ['addition','bonus room','over garage','400sf'],
    sqft: 400, divisions: 16, estimateBase: 118000, duration: '16–20 weeks', phases: 6, uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 130000, better: 153000, best: 179000, luxury: 215000 },
    scope: [
      'Structural engineering review and stamped drawings','Permit — Cherokee or applicable county',
      'Structural framing — floor system, walls, roof','Roofing tie-in and weatherproofing',
      'HVAC extension — new zone','Electrical — panel capacity, lighting, outlets',
      'Insulation — walls, ceiling, floor','Drywall hang and finish',
      'Flooring — LVP or carpet (allowance)','Paint','Egress window','Trim and doors',
    ],
  },
  {
    id: 'CHB-2500-SPEC', code: 'CHB',
    name: 'Custom home build — 2,500 sf spec',
    desc: '2,500 sf 4BR/3BA single-family spec build. Cherokee County. Slab foundation.',
    tags: ['custom home','spec build','2500sf','4 bedroom','Cherokee County'],
    sqft: 2500, divisions: 16, estimateBase: 425000, duration: '12–15 months', phases: 8, uses: 0,
    lastUsed: 'Not yet used',
    tiers: { good: 487000, better: 575000, best: 672000, luxury: 806000 },
    scope: [
      'Land clearing and grading','Slab foundation','Framing — walls, roof system',
      'Roofing — architectural shingles','Windows and exterior doors','Exterior siding and trim',
      'HVAC — 2 zones','Plumbing — rough-in and finish','Electrical — service, rough-in, finish',
      'Insulation','Drywall','Interior trim and doors',
      'Cabinets and countertops (allowance)','Flooring (allowance)',
      'Fixtures and hardware (allowance)','Paint','Landscaping and drive (allowance)',
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

const BLANK = { code:'BSM', name:'', desc:'', sqft:'', duration:'', phases:'', divisions:'',
  tierGood:'', tierBetter:'', tierBest:'', tierLuxury:'', scope:'' }

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function TemplatesPage() {
  const [search,       setSearch]       = useState('')
  const [filterType,   setFilterType]   = useState('All')
  const [expanded,     setExpanded]     = useState(null)
  const [cloning,      setCloning]      = useState(null)
  const [cloneForm,    setCloneForm]    = useState({ clientName:'', clientEmail:'', address:'', sqft:'', tier:'good' })
  const [templates,    setTemplates]    = useState(INIT_TEMPLATES)
  const [showNew,      setShowNew]      = useState(false)
  const [editing,      setEditing]      = useState(null) // template being edited
  const [newForm,      setNewForm]      = useState(BLANK)

  const types = ['All','BSM','KIT','BTH','ADD','CHB']

  const filtered = templates.filter(t => {
    const matchType = filterType === 'All' || t.code === filterType
    const q = search.toLowerCase()
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(tag => tag.toLowerCase().includes(q))
    return matchType && matchSearch
  })

  function openEdit(tmpl) {
    setEditing(tmpl)
    setNewForm({
      code: tmpl.code, name: tmpl.name, desc: tmpl.desc,
      sqft: tmpl.sqft, duration: tmpl.duration, phases: tmpl.phases, divisions: tmpl.divisions,
      tierGood: tmpl.tiers.good, tierBetter: tmpl.tiers.better,
      tierBest: tmpl.tiers.best, tierLuxury: tmpl.tiers.luxury,
      scope: tmpl.scope.join('\n'),
    })
    setShowNew(true)
  }

  function openNew() {
    setEditing(null)
    setNewForm(BLANK)
    setShowNew(true)
  }

  function saveTemplate() {
    if (!newForm.name.trim()) return
    const scopeArr = newForm.scope.split('\n').map(s=>s.trim()).filter(Boolean)
    const tiers = {
      good:   parseInt(newForm.tierGood)   || 0,
      better: parseInt(newForm.tierBetter) || 0,
      best:   parseInt(newForm.tierBest)   || 0,
      luxury: parseInt(newForm.tierLuxury) || 0,
    }
    if (editing) {
      setTemplates(templates.map(t => t.id === editing.id
        ? {...t, ...newForm, sqft:parseInt(newForm.sqft)||0, phases:parseInt(newForm.phases)||0,
            divisions:parseInt(newForm.divisions)||0, tiers, scope:scopeArr,
            tags: newForm.name.toLowerCase().split(' ').slice(0,5) }
        : t
      ))
    } else {
      const id = newForm.code + '-' + Date.now()
      setTemplates([...templates, {
        id, code: newForm.code, name: newForm.name, desc: newForm.desc,
        tags: newForm.name.toLowerCase().split(' ').slice(0,5),
        sqft: parseInt(newForm.sqft)||0, divisions: parseInt(newForm.divisions)||0,
        estimateBase: tiers.good, duration: newForm.duration,
        phases: parseInt(newForm.phases)||0, uses: 0, lastUsed: 'Not yet used',
        tiers, scope: scopeArr,
      }])
    }
    setShowNew(false)
    setEditing(null)
  }

  function duplicate(tmpl) {
    const copy = {
      ...tmpl,
      id: tmpl.id + '-copy-' + Date.now(),
      name: tmpl.name + ' (Copy)',
      uses: 0,
      lastUsed: 'Not yet used',
    }
    setTemplates([...templates, copy])
    setExpanded(copy.id)
  }

  const S = {
    label: { fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5, display:'block' },
    input: { width:'100%', padding:'8px 10px', border:'1px solid rgba(255,255,255,.09)', borderRadius:3, fontSize:13, fontFamily:'Poppins,sans-serif', outline:'none', background:'rgba(208,104,48,.1)', boxSizing:'border-box' },
    overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', overflowY:'auto' },
  }

  return (
    <Layout>

      {/* Clone modal */}
      {cloning && (
        <div style={{...S.overlay}}>
          <div style={{background:'#161616',borderRadius:4,maxWidth:560,width:'100%',overflow:'hidden',border:'3px solid #D06830'}}>
            <div style={{background:'#0a0a0a',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D06830'}}>
              <div style={{color:'#D06830',fontSize:13,fontWeight:700}}>Start new project from template</div>
              <button onClick={()=>{setCloning(null);setCloneForm({clientName:'',clientEmail:'',address:'',sqft:'',tier:'good'})}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:3,padding:'10px 12px',marginBottom:'1.25rem',fontSize:12,color:'rgba(255,255,255,.65)'}}>
                <strong style={{color:'rgba(255,255,255,.75)'}}>Template:</strong> {cloning.name}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Client name *</label>
                  <input value={cloneForm.clientName} onChange={e=>setCloneForm({...cloneForm,clientName:e.target.value})} placeholder="First & Last name" style={S.input}/>
                </div>
                <div>
                  <label style={S.label}>Client email</label>
                  <input value={cloneForm.clientEmail} onChange={e=>setCloneForm({...cloneForm,clientEmail:e.target.value})} placeholder="client@email.com" style={S.input}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>Project address</label>
                <input value={cloneForm.address} onChange={e=>setCloneForm({...cloneForm,address:e.target.value})} placeholder="Street address, City, GA ZIP" style={S.input}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Square footage</label>
                  <input value={cloneForm.sqft || cloning.sqft} onChange={e=>setCloneForm({...cloneForm,sqft:e.target.value})} style={S.input}/>
                </div>
                <div>
                  <label style={S.label}>Starting tier</label>
                  <select value={cloneForm.tier} onChange={e=>setCloneForm({...cloneForm,tier:e.target.value})} style={{...S.input,background:'#161616'}}>
                    {Object.entries(cloning.tiers).map(([t,v])=>(
                      <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)} — {fmt(v)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{background:'#1a1a1a',borderRadius:3,padding:'10px 12px',marginBottom:'1.25rem',fontSize:11,color:'rgba(255,255,255,.35)'}}>
                Creates project {new Date().getFullYear()}-XXX, pre-fills the estimate with all {cloning.divisions} divisions, and sets up the client portal.
              </div>
              <div style={{display:'flex',gap:8}}>
                <button
                  disabled={!cloneForm.clientName.trim()}
                  onClick={function(){
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem('sb_template', JSON.stringify({ template: cloning, client: cloneForm }))
                    }
                    window.location.href = '/contractor/leads'
                  }}
                  style={{background:cloneForm.clientName.trim()?'#D06830':'#e8e6e0',color:cloneForm.clientName.trim()?'#fff':'#9a9690',border:'none',padding:'10px 24px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:cloneForm.clientName.trim()?'pointer':'default',borderRadius:3,fontFamily:'Poppins,sans-serif',flex:1}}>
                  Create project →
                </button>
                <button onClick={()=>{setCloning(null);setCloneForm({clientName:'',clientEmail:'',address:'',sqft:'',tier:'good'})}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'10px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New / edit template modal */}
      {showNew && (
        <div style={{...S.overlay,alignItems:'flex-start',paddingTop:'2rem'}}>
          <div style={{background:'#161616',borderRadius:4,maxWidth:620,width:'100%',overflow:'hidden',border:'3px solid #D06830',marginBottom:'2rem'}}>
            <div style={{background:'#0a0a0a',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D06830'}}>
              <div style={{color:'#D06830',fontSize:13,fontWeight:700}}>{editing ? 'Edit template' : 'New template'}</div>
              <button onClick={()=>{setShowNew(false);setEditing(null)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'80px 1fr',gap:12,marginBottom:12}}>
                <div>
                  <label style={S.label}>Type</label>
                  <select value={newForm.code} onChange={e=>setNewForm({...newForm,code:e.target.value})} style={{...S.input,background:'#161616'}}>
                    {['BSM','KIT','BTH','ADD','CHB'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Template name *</label>
                  <input value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})} placeholder="e.g. Full basement renovation — 600 sf" style={S.input}/>
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>Description</label>
                <input value={newForm.desc} onChange={e=>setNewForm({...newForm,desc:e.target.value})} placeholder="Brief description of scope and market" style={S.input}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
                {[['Sq ft','sqft'],['Duration','duration'],['Phases','phases'],['Divisions','divisions']].map(([l,k])=>(
                  <div key={k}>
                    <label style={S.label}>{l}</label>
                    <input value={newForm[k]} onChange={e=>setNewForm({...newForm,[k]:e.target.value})} placeholder={k==='duration'?'8–10 wks':''} style={S.input}/>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Tier pricing</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
                {[['Good','tierGood'],['Better','tierBetter'],['Best','tierBest'],['Luxury','tierLuxury']].map(([l,k])=>(
                  <div key={k}>
                    <label style={S.label}>{l}</label>
                    <input type="number" value={newForm[k]} onChange={e=>setNewForm({...newForm,[k]:e.target.value})} placeholder="0" style={S.input}/>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:'1.25rem'}}>
                <label style={S.label}>Scope of work (one item per line)</label>
                <textarea value={newForm.scope} onChange={e=>setNewForm({...newForm,scope:e.target.value})} rows={6} placeholder={'Demo existing finishes\nConcrete floor prep\n...'} style={{...S.input,resize:'vertical'}}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={saveTemplate} disabled={!newForm.name.trim()} style={{flex:1,background:'#D06830',color:'#fff',border:'none',padding:'10px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.08em',textTransform:'uppercase',opacity:!newForm.name.trim()?.6:1}}>
                  {editing ? 'Save changes' : 'Create template'} →
                </button>
                <button onClick={()=>{setShowNew(false);setEditing(null)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'10px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src='/logo.png' alt='SpanglerBuilt' style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#D06830',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>&nbsp;· Project Templates</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'1.5rem'}}>

        <div style={{display:'flex',gap:10,marginBottom:'1.25rem',flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search templates — basement, kitchen, 665sf, bar..."
            style={{flex:1,minWidth:220,padding:'9px 12px',border:'1px solid rgba(255,255,255,.09)',borderRadius:3,fontSize:13,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(208,104,48,.1)'}}/>
          <div style={{display:'flex',gap:4}}>
            {types.map(t=>(
              <button key={t} onClick={()=>setFilterType(t)} style={{
                padding:'6px 14px',fontSize:11,border:'1px solid',fontFamily:'Poppins,sans-serif',fontWeight:500,cursor:'pointer',borderRadius:3,
                borderColor:filterType===t?'#0a0a0a':'#e8e6e0',
                background:filterType===t?'#0a0a0a':'#fff',
                color:filterType===t?'#D06830':'#9a9690',
              }}>{t==='All'?'All types':t}</button>
            ))}
          </div>
          <button onClick={openNew} style={{background:'#D06830',color:'#fff',border:'none',padding:'8px 16px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',whiteSpace:'nowrap'}}>
            + New template
          </button>
        </div>

        <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:'1rem'}}>{filtered.length} template{filtered.length!==1?'s':''} · {templates.reduce((s,t)=>s+t.uses,0)} total uses</div>

        <div style={{display:'grid',gap:10}}>
          {filtered.map(tmpl => {
            const tc  = TYPE_COLORS[tmpl.code] || TYPE_COLORS.BSM
            const exp = expanded === tmpl.id
            return (
              <div key={tmpl.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',borderLeft:'4px solid #0a0a0a'}}>

                <div style={{padding:'1rem 1.25rem',display:'flex',gap:12,alignItems:'flex-start',cursor:'pointer'}} onClick={()=>setExpanded(exp?null:tmpl.id)}>
                  <div style={{flexShrink:0}}>
                    <span style={{background:tc.bg,color:tc.color,fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:3,display:'block',textAlign:'center',letterSpacing:'.06em'}}>{tmpl.code}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,.75)',marginBottom:3}}>{tmpl.name}</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:6}}>{tmpl.desc}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {tmpl.tags.map(tag=>(
                        <span key={tag} style={{background:'#1a1a1a',color:'rgba(255,255,255,.5)',fontSize:10,padding:'1px 7px',borderRadius:3}}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:16,flexShrink:0,alignItems:'flex-start'}}>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>Good tier est.</div>
                      <div style={{fontSize:15,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{fmt(tmpl.tiers.good)}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.06em'}}>Used</div>
                      <div style={{fontSize:15,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{tmpl.uses}×</div>
                    </div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginTop:2}}>{exp?'▲':'▼'}</div>
                  </div>
                </div>

                {exp && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,.07)'}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:1,background:'rgba(255,255,255,.08)'}}>
                      {Object.entries(tmpl.tiers).map(([tier,val])=>{
                        const tc2 = {good:{c:'#3B6D11',bg:'#eaf3de'},better:{c:'#185FA5',bg:'#e6f1fb'},best:{c:'#534AB7',bg:'#eeedfe'},luxury:{c:'#854F0B',bg:'#faeeda'}}[tier]
                        return (
                          <div key={tier} style={{background:'#161616',padding:'10px 14px',textAlign:'center'}}>
                            <div style={{fontSize:9,fontWeight:700,color:tc2.c,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{tier}</div>
                            <div style={{fontSize:16,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{fmt(val)}</div>
                          </div>
                        )
                      })}
                    </div>

                    <div style={{display:'flex',gap:0,background:'#1a1a1a',borderTop:'1px solid #e8e6e0',borderBottom:'1px solid #e8e6e0'}}>
                      {[['Sq footage',tmpl.sqft+' sf'],['Duration',tmpl.duration],['Phases',tmpl.phases],['Divisions',tmpl.divisions]].map(([l,v])=>(
                        <div key={l} style={{flex:1,padding:'8px 14px',borderRight:'1px solid #e8e6e0'}}>
                          <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>{l}</div>
                          <div style={{fontSize:12,fontWeight:500,color:'rgba(255,255,255,.75)'}}>{v}</div>
                        </div>
                      ))}
                      <div style={{flex:2,padding:'8px 14px'}}>
                        <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Last used</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{tmpl.lastUsed}</div>
                      </div>
                    </div>

                    <div style={{padding:'1rem 1.25rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 24px'}}>
                      {tmpl.scope.map((item,i)=>(
                        <div key={i} style={{display:'flex',gap:8,alignItems:'flex-start',padding:'3px 0',fontSize:12,color:'rgba(255,255,255,.65)'}}>
                          <span style={{color:'#D06830',fontSize:11,flexShrink:0,marginTop:1}}>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{padding:'0 1.25rem 1rem',display:'flex',gap:8}}>
                      <button onClick={function(){setCloning(tmpl)}} style={{background:'#D06830',color:'#fff',border:'none',padding:'9px 20px',fontSize:11,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                        Use template →
                      </button>
                      <button onClick={function(){openEdit(tmpl)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.75)',padding:'9px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                        Edit
                      </button>
                      <button onClick={function(){duplicate(tmpl)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'9px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                        Duplicate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{marginTop:'1.5rem',fontSize:10,color:'rgba(255,255,255,.35)',textAlign:'center'}}>
          SpanglerBuilt Inc. · Project template library · michael@spanglerbuilt.com · (404) 492-7650
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
