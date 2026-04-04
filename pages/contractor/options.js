import Layout from '../../components/Layout'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

// ─── Shared option groups data ───────────────────────────────────────────────
// Each group has a "standard" option (delta: 0) and 2-3 upgrades
// delta = total cost difference vs. standard option
export var INIT_OPTION_GROUPS = [
  {
    id: 'flooring', label: 'Flooring', room: 'Main area', div: '09',
    qty: 600, unit: 'SF',
    options: [
      { id:'fl-1', tier:'good',   badge:'Included',  name:'Shaw Floorté Pro LVP',        brand:'Shaw Floors',      spec:'6mm · Waterproof · Click-lock',           rate:6.25, delta:0,    photo:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', hex:'#D4C4A8' },
      { id:'fl-2', tier:'better', badge:'Upgrade',   name:'COREtec Plus Enhanced LVP',   brand:'COREtec',          spec:'9" wide · 8mm · Cork underlayment',       rate:7.85, delta:960,  photo:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80', hex:'#C4A882' },
      { id:'fl-3', tier:'best',   badge:'Upgrade',   name:'Anderson Tuftex Eng. Hardwood',brand:'Anderson Tuftex', spec:'7" wide · Wire-brushed · CARB2',          rate:9.49, delta:1944, photo:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80', hex:'#8B4513' },
      { id:'fl-4', tier:'luxury', badge:'Premium',   name:'Hakwood European Oak 9.5"',   brand:'Hakwood',          spec:'Hand-scraped · Live sawn · Custom stain', rate:18,   delta:7050, photo:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80', hex:'#D4C8B0' },
    ]
  },
  {
    id: 'tile', label: 'Bathroom tile', room: 'Bathroom floor & shower walls', div: '09',
    qty: 185, unit: 'SF',
    options: [
      { id:'ti-1', tier:'good',   badge:'Included', name:'Daltile Restore Ceramic 12×24',  brand:'Daltile',         spec:'Rectified · Frost resistant',                rate:4.99, delta:0,    photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#F5F5F5' },
      { id:'ti-2', tier:'better', badge:'Upgrade',  name:'MSI Carrara White Porcelain 24×24',brand:'MSI Surfaces',  spec:'Polished · Rectified · Large format',        rate:8.99, delta:740,  photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#F0EDE8' },
      { id:'ti-3', tier:'best',   badge:'Upgrade',  name:'Porcelanosa Marmol 32×32',        brand:'Porcelanosa',    spec:'Large format · Continuous veining',          rate:14.99, delta:1848, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#E8D5B0' },
      { id:'ti-4', tier:'luxury', badge:'Premium',  name:'Natural Marble — Calacatta',      brand:'Antolini Luigi', spec:'Book-matched · Honed or polished · Custom',  rate:28,   delta:4255, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#F5EDD8' },
    ]
  },
  {
    id: 'cabinets', label: 'Bar cabinets', room: 'Bar area', div: '12',
    qty: 1, unit: 'LS',
    options: [
      { id:'ca-1', tier:'good',   badge:'Included', name:'Hampton Bay Shaker Stock',      brand:'Hampton Bay (HD)', spec:'Plywood box · Soft-close hinges',           rate:2400, delta:0,    photo:'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80', hex:'#FFFFFF' },
      { id:'ca-2', tier:'better', badge:'Upgrade',  name:'KraftMaid Dovetail Shaker',     brand:'KraftMaid',        spec:'Dovetail drawers · Soft-close · Semi-custom',rate:4200, delta:1800, photo:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', hex:'#F0EDE8' },
      { id:'ca-3', tier:'best',   badge:'Upgrade',  name:'Dura Supreme Inset Shaker',     brand:'Dura Supreme',     spec:'Inset doors · Dovetail · Any finish',        rate:7800, delta:5400, photo:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', hex:'#F0EDE0' },
      { id:'ca-4', tier:'luxury', badge:'Premium',  name:'Plain & Fancy Full Custom',     brand:'Plain & Fancy',    spec:'Any wood · Any finish · Any hardware',       rate:12000,delta:9600, photo:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', hex:'#FAFAFA' },
    ]
  },
  {
    id: 'countertops', label: 'Bar countertop', room: 'Bar area (~30 sf)', div: '12',
    qty: 30, unit: 'SF',
    options: [
      { id:'co-1', tier:'good',   badge:'Included', name:'Wilsonart HD Laminate',           brand:'Wilsonart',           spec:'1.5" post-form edge · Easy clean',           rate:28,  delta:0,    photo:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', hex:'#F5F0E8' },
      { id:'co-2', tier:'better', badge:'Upgrade',  name:'Silestone Eternal Calacatta',     brand:'Silestone/Cosentino', spec:'Quartz 3cm · Eased edge · NSF certified',    rate:65,  delta:1110, photo:'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', hex:'#F5F0E0' },
      { id:'co-3', tier:'best',   badge:'Upgrade',  name:'Cambria Brittanicca Warm',        brand:'Cambria',             spec:'Quartz 3cm · Waterfall edge option',         rate:95,  delta:2010, photo:'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', hex:'#F5EDD8' },
      { id:'co-4', tier:'luxury', badge:'Premium',  name:'Calacatta Borghini Natural Stone',brand:'Antolini Luigi',      spec:'Book-matched · Leathered or polished',       rate:180, delta:4560, photo:'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', hex:'#F5EDD8' },
    ]
  },
  {
    id: 'fixtures', label: 'Fixtures & hardware', room: 'Bathroom + bar area', div: '15',
    qty: 1, unit: 'LS',
    options: [
      { id:'fx-1', tier:'good',   badge:'Included', name:'Moen Align — Brushed Nickel',  brand:'Moen',      spec:'Lifetime warranty · ADA compliant',            rate:850,  delta:0,    photo:'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80', hex:'#C0C0B0' },
      { id:'fx-2', tier:'better', badge:'Upgrade',  name:'Delta Trinsic — Matte Black',  brand:'Delta',     spec:'Touch2O · Magnetic docking · Premium feel',   rate:1350, delta:500,  photo:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', hex:'#2C2C2C' },
      { id:'fx-3', tier:'best',   badge:'Upgrade',  name:'Brizo Litze — Unlacquered Brass',brand:'Brizo',   spec:'SmartTouch · DIAMOND seal · Lifetime',        rate:2100, delta:1250, photo:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', hex:'#C8A84B' },
      { id:'fx-4', tier:'luxury', badge:'Premium',  name:'Waterworks Custom Collection', brand:'Waterworks', spec:'Handcrafted · Ceramic disc · Polished gold',  rate:3800, delta:2950, photo:'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80', hex:'#D4AF37' },
    ]
  },
  {
    id: 'shower', label: 'Shower enclosure', room: 'Bathroom', div: '08',
    qty: 1, unit: 'EA',
    options: [
      { id:'sh-1', tier:'good',   badge:'Included', name:'DreamLine Flex — Semi-frameless',   brand:'DreamLine', spec:'3/8" glass · Chrome',                          rate:850,  delta:0,    photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#E8E8E8' },
      { id:'sh-2', tier:'better', badge:'Upgrade',  name:'DreamLine Enigma-X — Frameless',    brand:'DreamLine', spec:'Full frameless · 3/8" glass · Brushed nickel',  rate:1250, delta:400,  photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#C0C0B0' },
      { id:'sh-3', tier:'best',   badge:'Upgrade',  name:'DreamLine Elegance Plus — Frameless',brand:'DreamLine',spec:'Full frameless · 1/2" glass · Any finish',      rate:1850, delta:1000, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#C8A84B' },
      { id:'sh-4', tier:'luxury', badge:'Premium',  name:'Custom Frameless — Steam-ready',    brand:'Waterworks',spec:'Custom glass · Steam · Designer hardware',       rate:3200, delta:2350, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#D4AF37' },
    ]
  },
  {
    id: 'vanity', label: 'Bathroom vanity', room: 'Bathroom', div: '12',
    qty: 1, unit: 'EA',
    options: [
      { id:'va-1', tier:'good',   badge:'Included', name:'Glacier Bay 30" Single Vanity',    brand:'Glacier Bay (HD)',    spec:'With mirror · Soft-close door',           rate:875,  delta:0,    photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#FFFFFF' },
      { id:'va-2', tier:'better', badge:'Upgrade',  name:'Style Selections 36" Double',      brand:'Style Selections',    spec:'Quartz top · Soft-close · Double sink',   rate:1450, delta:575,  photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#9A9A9A' },
      { id:'va-3', tier:'best',   badge:'Upgrade',  name:'RH Floating Double Vanity',        brand:'Restoration Hardware',spec:'Stone top · Floating · Custom finish',     rate:3200, delta:2325, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#D4C4A8' },
      { id:'va-4', tier:'luxury', badge:'Premium',  name:'Waterworks Studio Custom Vanity',  brand:'Waterworks',          spec:'Custom · Stone top · Any finish',         rate:5800, delta:4925, photo:'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80', hex:'#C4A882' },
    ]
  },
  {
    id: 'lighting', label: 'Lighting package', room: 'All areas (20 fixtures)', div: '16',
    qty: 1, unit: 'LS',
    options: [
      { id:'li-1', tier:'good',   badge:'Included', name:'Halo 6" LED Recessed — White trim',    brand:'Halo',           spec:'2700K · Dimmable · 20 fixtures',           rate:1900, delta:0,    photo:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', hex:'#F5F5F5' },
      { id:'li-2', tier:'better', badge:'Upgrade',  name:'Halo 6" LED — Matte black trim',       brand:'Halo',           spec:'2700K · Dimmable · 20 + 2 pendants',       rate:2600, delta:700,  photo:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', hex:'#2C2C2C' },
      { id:'li-3', tier:'best',   badge:'Upgrade',  name:'Visual Comfort / circa — Designer',    brand:'Visual Comfort',  spec:'Pendants + recessed · 2700K · Custom',    rate:4200, delta:2300, photo:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', hex:'#C8A84B' },
      { id:'li-4', tier:'luxury', badge:'Premium',  name:'Kelly Wearstler Statement Package',    brand:'Kelly Wearstler', spec:'Statement fixtures · Custom spec',         rate:7500, delta:5600, photo:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80', hex:'#D4AF37' },
    ]
  },
]

var TIER_COLORS = {
  good:   { color:'#3B6D11', bg:'#eaf3de' },
  better: { color:'#185FA5', bg:'#e6f1fb' },
  best:   { color:'#534AB7', bg:'#eeedfe' },
  luxury: { color:'#854F0B', bg:'#faeeda' },
}

var BADGE_STYLE = {
  'Included': { bg:'#0a0a0a', color:'#fff' },
  'Upgrade':  { bg:'#D06830', color:'#fff' },
  'Premium':  { bg:'#854F0B', color:'#fff' },
}

var BASE_PRICE = 53000

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }
function fmtDelta(n) { return n === 0 ? 'Included' : '+' + fmt(n) }

export default function OptionsBuilder() {
  var { data: session } = useSession()
  var [groups,    setGroups]    = useState(INIT_OPTION_GROUPS)
  var [activeGrp, setActiveGrp] = useState('flooring')
  var [showPreview, setShowPreview] = useState(false)
  var [editOpt,   setEditOpt]   = useState(null) // {groupId, optIndex}
  var [editForm,  setEditForm]  = useState({})

  var grp = groups.find(function(g){ return g.id === activeGrp })

  function saveOpt() {
    if (!editOpt) return
    setGroups(function(prev) {
      return prev.map(function(g) {
        if (g.id !== editOpt.groupId) return g
        var opts = g.options.map(function(o, i) {
          if (i !== editOpt.optIndex) return o
          return Object.assign({}, o, {
            name: editForm.name || o.name,
            brand: editForm.brand || o.brand,
            spec: editForm.spec || o.spec,
            rate: parseFloat(editForm.rate) || o.rate,
            delta: parseInt(editForm.delta) || o.delta,
            photo: editForm.photo || o.photo,
          })
        })
        return Object.assign({}, g, { options: opts })
      })
    })
    setEditOpt(null)
  }

  var S = {
    label: { fontSize:10, color:'rgba(255,255,255,.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:5, display:'block' },
    input: { width:'100%', padding:'7px 10px', border:'1px solid rgba(255,255,255,.09)', borderRadius:3, fontSize:12, fontFamily:'Poppins,sans-serif', outline:'none', background:'rgba(208,104,48,.1)', boxSizing:'border-box' },
    overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,.85)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', overflowY:'auto' },
  }

  return (
    <Layout>

      {/* Edit option modal */}
      {editOpt && (
        <div style={S.overlay}>
          <div style={{background:'#161616',borderRadius:4,maxWidth:500,width:'100%',border:'3px solid #D06830',overflow:'hidden'}}>
            <div style={{background:'#0a0a0a',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D06830'}}>
              <span style={{color:'#D06830',fontSize:13,fontWeight:700}}>Edit option</span>
              <button onClick={function(){setEditOpt(null)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem',display:'grid',gap:12}}>
              {[['Product name','name'],['Brand','brand'],['Spec / description','spec'],['Rate (per unit)','rate'],['Price delta vs. included ($)','delta'],['Photo URL','photo']].map(function([lbl,key]){return(
                <div key={key}>
                  <label style={S.label}>{lbl}</label>
                  <input value={editForm[key]||''} onChange={function(e){setEditForm(function(p){return Object.assign({},p,{[key]:e.target.value})})}} style={S.input}/>
                </div>
              )})}
              <div style={{display:'flex',gap:8,marginTop:4}}>
                <button onClick={saveOpt} style={{flex:1,background:'#D06830',color:'#fff',border:'none',padding:'9px',fontSize:12,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',textTransform:'uppercase',letterSpacing:'.06em'}}>Save →</button>
                <button onClick={function(){setEditOpt(null)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'9px 16px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client preview modal */}
      {showPreview && (
        <div style={{...S.overlay,alignItems:'flex-start',paddingTop:'2rem'}}>
          <div style={{background:'#161616',borderRadius:4,maxWidth:800,width:'100%',border:'3px solid #D06830',overflow:'hidden',marginBottom:'2rem'}}>
            <div style={{background:'#0a0a0a',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'2px solid #D06830'}}>
              <div>
                <div style={{color:'#D06830',fontSize:13,fontWeight:700}}>Client preview — Options & Upgrades</div>
                <div style={{color:'rgba(255,255,255,.5)',fontSize:10,marginTop:2}}>This is exactly what your client sees at /client/options</div>
              </div>
              <button onClick={function(){setShowPreview(false)}} style={{background:'transparent',border:'none',color:'rgba(255,255,255,.5)',fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{padding:'1.5rem',maxHeight:'80vh',overflowY:'auto'}}>
              <div style={{background:'rgba(208,104,48,.1)',border:'1px solid #D06830',borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',fontSize:12,color:'rgba(255,255,255,.65)'}}>
                <strong style={{color:'rgba(255,255,255,.75)'}}>SB-2026-001 · Mendel Basement Renovation</strong><br/>
                Base estimate: {fmt(BASE_PRICE)} (Good tier) · Select any upgrades below to see the impact on your total.
              </div>
              {groups.map(function(g) {
                return (
                  <div key={g.id} style={{marginBottom:'1.25rem',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
                    <div style={{background:'#0a0a0a',padding:'8px 14px'}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#fff'}}>{g.label}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,.5)'}}>{g.room}</div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,background:'rgba(255,255,255,.08)'}}>
                      {g.options.map(function(opt) {
                        var bs = BADGE_STYLE[opt.badge]
                        var tc = TIER_COLORS[opt.tier]
                        return (
                          <div key={opt.id} style={{background:'#161616',padding:'12px',margin:'1px'}}>
                            <div style={{height:70,background:'#1a1a1a',borderRadius:3,overflow:'hidden',marginBottom:8}}>
                              <img src={opt.photo} alt={opt.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={function(e){e.target.style.display='none'}}/>
                            </div>
                            <div style={{display:'inline-block',background:bs.bg,color:bs.color,fontSize:8,fontWeight:700,padding:'1px 5px',borderRadius:2,marginBottom:4,textTransform:'uppercase'}}>{opt.badge}</div>
                            <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.75)',marginBottom:2,lineHeight:1.3}}>{opt.name}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:4}}>{opt.brand}</div>
                            <div style={{fontSize:12,fontWeight:700,color:opt.delta===0?'#3B6D11':'#e65100'}}>{fmtDelta(opt.delta)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:34,width:'auto'}}/>
          <span style={{fontSize:11,color:'#D06830',letterSpacing:'.12em',textTransform:'uppercase',fontWeight:500}}>&nbsp;· Options &amp; Upgrades</span>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button onClick={function(){setShowPreview(true)}} style={{background:'transparent',border:'1px solid rgba(255,255,255,.3)',color:'rgba(255,255,255,.7)',padding:'5px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>Preview client view</button>
          <a href="/contractor/presentation" style={{background:'#D06830',color:'#fff',padding:'5px 14px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3}}>Open presentation →</a>
          <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
        </div>
      </div>

      <div style={{maxWidth:1900,margin:'0 auto',padding:'1.5rem',display:'grid',gridTemplateColumns:'240px 1fr',gap:16}}>

        {/* Left: group list */}
        <div>
          <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Option categories</div>
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden'}}>
            {groups.map(function(g) {
              var isActive = g.id === activeGrp
              return (
                <div key={g.id} onClick={function(){setActiveGrp(g.id)}}
                  style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.07)',cursor:'pointer',background:isActive?'#0a0a0a':'#fff',borderLeft:'3px solid '+(isActive?'#D06830':'transparent')}}>
                  <div style={{fontSize:12,fontWeight:500,color:isActive?'#D06830':'#0a0a0a'}}>{g.label}</div>
                  <div style={{fontSize:10,color:isActive?'rgba(255,255,255,.5)':'#9a9690'}}>{g.options.length} options · {g.room}</div>
                </div>
              )
            })}
          </div>
          <div style={{marginTop:12,background:'#0a0a0a',borderRadius:4,padding:'12px 14px'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,.7)',marginBottom:8,lineHeight:1.5}}>Share options with client:</div>
            <a href="/client/options" target="_blank" rel="noopener noreferrer"
              style={{display:'block',background:'#D06830',color:'#fff',padding:'8px',fontSize:11,fontWeight:700,textDecoration:'none',borderRadius:3,textAlign:'center',letterSpacing:'.06em',textTransform:'uppercase'}}>
              Client options link →
            </a>
          </div>
        </div>

        {/* Right: active group editor */}
        {grp && (
          <div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
              <div>
                <div style={{fontFamily:'Poppins,sans-serif',fontSize:18,color:'rgba(255,255,255,.75)'}}>{grp.label}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>{grp.room} · Div {grp.div} · {grp.unit}</div>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
              {grp.options.map(function(opt, optIdx) {
                var bs = BADGE_STYLE[opt.badge]
                var tc = TIER_COLORS[opt.tier]
                return (
                  <div key={opt.id} style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',borderTop:'3px solid '+(opt.delta===0?'#3B6D11':'#D06830')}}>
                    {/* Photo */}
                    <div style={{height:160,background:'#1a1a1a',position:'relative',overflow:'hidden'}}>
                      <img src={opt.photo} alt={opt.name} style={{width:'100%',height:'100%',objectFit:'cover'}} onError={function(e){e.target.style.display='none'}}/>
                      <div style={{position:'absolute',top:8,left:8,display:'flex',gap:4}}>
                        <span style={{background:bs.bg,color:bs.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase'}}>{opt.badge}</span>
                        <span style={{background:tc.bg,color:tc.color,fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase'}}>{opt.tier}</span>
                      </div>
                      <div style={{position:'absolute',bottom:8,right:8}}>
                        <div style={{width:20,height:20,borderRadius:'50%',background:opt.hex,border:'2px solid #fff',boxShadow:'0 1px 3px rgba(0,0,0,.3)'}}/>
                      </div>
                    </div>
                    {/* Info */}
                    <div style={{padding:'12px 14px'}}>
                      <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,.75)',marginBottom:3}}>{opt.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:2}}>{opt.brand}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginBottom:10}}>{opt.spec}</div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                        <div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Rate</div>
                          <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,.75)'}}>${opt.rate}{grp.unit==='LS'?'':'/'+grp.unit}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Client price impact</div>
                          <div style={{fontSize:16,fontWeight:700,color:opt.delta===0?'#3B6D11':'#e65100'}}>
                            {opt.delta===0?'Included':'+'+fmt(opt.delta)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={function(){
                          setEditOpt({groupId:grp.id, optIndex:optIdx})
                          setEditForm({ name:opt.name, brand:opt.brand, spec:opt.spec, rate:String(opt.rate), delta:String(opt.delta), photo:opt.photo })
                        }}
                        style={{width:'100%',background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.75)',padding:'7px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',textAlign:'center'}}>
                        Edit this option
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
