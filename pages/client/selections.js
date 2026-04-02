import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// ─── Tier info ────────────────────────────────────────────────────────────────
var TIERS = [
  { key:'good',    label:'Good',    price:53000, color:'#3B6D11', bg:'#eaf3de' },
  { key:'better',  label:'Better',  price:62000, color:'#185FA5', bg:'#e6f1fb' },
  { key:'best',    label:'Best',    price:73000, color:'#534AB7', bg:'#eeedfe' },
  { key:'luxury',  label:'Luxury',  price:89000, color:'#854F0B', bg:'#faeeda' },
]

// ─── Product catalog by tier → category ───────────────────────────────────────
var PRODUCTS = {
  good: {
    flooring:      { brand:'Shaw Floorté Pro LVP',          product:'6mm · Waterproof · Click-lock',                 swatches:[{name:'Natural Biscuit',hex:'#D4C4A8'},{name:'Gunstock Oak',hex:'#8B6914'},{name:'Storm Gray',hex:'#7A7A7A'}] },
    bath_floor:    { brand:'Daltile Restore 12×24 Ceramic', product:'Rectified · Slip-resistant · Frost resistant',  swatches:[{name:'Bright White',hex:'#F5F5F5'},{name:'Silver Gray',hex:'#C0C0C0'},{name:'Almond',hex:'#EFDECD'}] },
    shower_wall:   { brand:'Daltile City Lights 4×12',      product:'Subway tile · Ceramic · Easy clean',            swatches:[{name:'White',hex:'#F5F5F5'},{name:'Dove Gray',hex:'#B0B0B0'},{name:'Biscuit',hex:'#E8D5B0'}] },
    shower_floor:  { brand:'Daltile Keystones 2×2 Mosaic',  product:'Slip-resistant · Ceramic · Coordinating grout', swatches:[{name:'White',hex:'#F5F5F5'},{name:'Almond',hex:'#EFDECD'},{name:'Gray',hex:'#B0B0B0'}] },
    shower_bench:  { brand:'Custom tile bench',              product:'Tile-topped bench niche · Coordinating tile',   swatches:[{name:'Match floor',hex:'#F5F5F5'},{name:'Match wall',hex:'#E0E0E0'},{name:'Accent tile',hex:'#D4C4A8'}] },
    toilet:        { brand:'American Standard Cadet 3',      product:'Right height · ADA · 1.28 gpf · WaterSense',   swatches:[{name:'White',hex:'#F5F5F5'},{name:'Linen',hex:'#F0EDE0'},{name:'Bone',hex:'#E8DCC8'}] },
    fixtures:      { brand:'Moen Align Series',              product:'Single-handle · Lifetime warranty · ADA',       swatches:[{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Chrome',hex:'#E8E8E8'},{name:'Matte Black',hex:'#2C2C2C'}] },
    vanity:        { brand:'Glacier Bay 30" Single',         product:'With mirror · Soft-close door',                 swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Espresso',hex:'#3C2415'}] },
    shower_door:   { brand:'DreamLine Flex Semi-frameless',  product:'3/8" glass · Chrome · Adjustable fit',          swatches:[{name:'Chrome',hex:'#E8E8E8'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Black',hex:'#2C2C2C'}] },
    cabinets:      { brand:'Hampton Bay (Home Depot)',        product:'Shaker Stock · Plywood box · Soft-close',       swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Navy',hex:'#002147'}] },
    countertops:   { brand:'Wilsonart HD Laminate',          product:'1.5" post-form edge · Easy clean',              swatches:[{name:'Calcutta Marble',hex:'#F5F0E8'},{name:'Black Fusion',hex:'#2C2C2C'},{name:'Ash Elm',hex:'#B5956A'}] },
    lighting:      { brand:'Halo 6" LED Recessed',           product:'2700K warm white · Dimmable · 20 fixtures',     swatches:[{name:'White Trim',hex:'#F5F5F5'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Black Trim',hex:'#2C2C2C'}] },
    paint:         { brand:'Sherwin-Williams',                product:'2 coats walls + ceiling · Semi-gloss trim',     swatches:[{name:'Agreeable Gray',hex:'#C2BAA6'},{name:'Accessible Beige',hex:'#D2C5B0'},{name:'Repose Gray',hex:'#B4B0AA'}] },
    doors:         { brand:'Masonite Interior',               product:'Primed hollow-core · Ready to paint',           swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Barn Stain',hex:'#8B6914'}] },
  },
  better: {
    flooring:      { brand:'COREtec Plus Enhanced XL',       product:'9" wide LVP · 8mm · Cork underlayment',         swatches:[{name:'Vero Beach Oak',hex:'#C4A882'},{name:'Driftwood',hex:'#9E8B6F'},{name:'Coastal Pine',hex:'#8B7355'}] },
    bath_floor:    { brand:'MSI Carrara White 24×24',        product:'Porcelain · Polished · Rectified',               swatches:[{name:'Carrara White',hex:'#F0EDE8'},{name:'Nero Marquina',hex:'#1A1A1A'},{name:'Crema Marfil',hex:'#E8D5B0'}] },
    shower_wall:   { brand:'MSI Metro 3×12 Subway',          product:'Porcelain · Glossy · Easy clean',                swatches:[{name:'White',hex:'#F5F5F5'},{name:'Misty Gray',hex:'#B8B8B0'},{name:'Sage',hex:'#8A9E80'}] },
    shower_floor:  { brand:'MSI Caspian 2×2 Porcelain',     product:'Mosaic · Slip-resistant · Coordinating',         swatches:[{name:'White',hex:'#F5F5F5'},{name:'Carrara',hex:'#F0EDE8'},{name:'Gray',hex:'#B8B8B0'}] },
    shower_bench:  { brand:'Tile-clad floating bench',       product:'Porcelain-topped · Niche included',              swatches:[{name:'Match floor',hex:'#F0EDE8'},{name:'Contrasting',hex:'#1A1A1A'},{name:'Accent mosaic',hex:'#C4A882'}] },
    toilet:        { brand:'TOTO Drake II',                  product:'Elongated · 1.28 gpf · Universal height',        swatches:[{name:'Cotton White',hex:'#F5F5F5'},{name:'Sedona Beige',hex:'#D4C4A0'},{name:'Colonial White',hex:'#F0EDE0'}] },
    fixtures:      { brand:'Delta Trinsic Series',           product:'Matte Black · Touch2O · Magnetic docking',       swatches:[{name:'Matte Black',hex:'#2C2C2C'},{name:'Satin Brass',hex:'#C8A84B'},{name:'Gunmetal',hex:'#5C5C5C'}] },
    vanity:        { brand:'Style Selections 36" Double',    product:'Quartz top · Soft-close · Double sink',          swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Wood tone',hex:'#C4A47C'}] },
    shower_door:   { brand:'DreamLine Enigma-X Frameless',   product:'Full frameless · 3/8" glass · Brushed Nickel',   swatches:[{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Chrome',hex:'#E8E8E8'}] },
    cabinets:      { brand:'KraftMaid Dovetail Shaker',      product:'Semi-custom · Soft-close · Plywood box',         swatches:[{name:'Dove White',hex:'#F0EDE8'},{name:'Flagstone',hex:'#8B8070'},{name:'Espresso',hex:'#3C2415'}] },
    countertops:   { brand:'Silestone Eternal Calacatta',    product:'Quartz 3cm · Eased edge · NSF certified',        swatches:[{name:'Calacatta Gold',hex:'#F5F0E0'},{name:'Charcoal',hex:'#4A4A4A'},{name:'White Storm',hex:'#F0F0F0'}] },
    lighting:      { brand:'Halo 6" LED + Pendants',         product:'2700K dimmable recessed + 2 pendant lights',     swatches:[{name:'Matte Black',hex:'#2C2C2C'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Brass',hex:'#C8A84B'}] },
    paint:         { brand:'Sherwin-Williams Emerald',        product:'Premium 2 coats · Low VOC · Excellent hide',     swatches:[{name:'Agreeable Gray',hex:'#C2BAA6'},{name:'Sea Salt',hex:'#B5C8BF'},{name:'Naval',hex:'#2A3A52'}] },
    doors:         { brand:'Masonite Solid Core',             product:'Solid-core primed · Upgraded feel',              swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Barn Stain',hex:'#8B6914'}] },
  },
  best: {
    flooring:      { brand:'Anderson Tuftex Eng. Hardwood',  product:'7" wide · Wire-brushed · CARB2',                 swatches:[{name:'Glacier',hex:'#E8E0D0'},{name:'Cognac',hex:'#8B4513'},{name:'Graphite',hex:'#5A5A5A'}] },
    bath_floor:    { brand:'Porcelanosa Marmol 32×32',       product:'Large format porcelain · Polished · Rectified',  swatches:[{name:'Calacatta',hex:'#F5F0E8'},{name:'Reno Noir',hex:'#1C1C1C'},{name:'Crema',hex:'#E8D5B0'}] },
    shower_wall:   { brand:'Porcelanosa Nantes 12×36',       product:'Large format wall tile · Matte finish',          swatches:[{name:'White',hex:'#F5F5F5'},{name:'Taupe',hex:'#B8A898'},{name:'Charcoal',hex:'#4A4A4A'}] },
    shower_floor:  { brand:'Porcelanosa Mosaico 2×2',        product:'Porcelain mosaic · Slip-resistant · Premium',    swatches:[{name:'Calacatta',hex:'#F5F0E8'},{name:'Nero',hex:'#1C1C1C'},{name:'Taupe',hex:'#B8A898'}] },
    shower_bench:  { brand:'Custom floating stone bench',    product:'Natural stone top · Niche + grab bar rough-in',  swatches:[{name:'Calacatta',hex:'#F5F0E8'},{name:'Nero Marquina',hex:'#1C1C1C'},{name:'Crema Marfil',hex:'#E8D5B0'}] },
    toilet:        { brand:'TOTO Aquia IV Dual Flush',       product:'Wall-hung option · 0.8/1.28 gpf · Skirted',      swatches:[{name:'Cotton White',hex:'#F5F5F5'},{name:'Bone',hex:'#E8DCC8'},{name:'Ebony',hex:'#3C3C3C'}] },
    fixtures:      { brand:'Brizo Litze Series',             product:'Unlacquered brass · SmartTouch · Lifetime',      swatches:[{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Oil-rubbed Bronze',hex:'#4A2E0A'},{name:'Polished Nickel',hex:'#D4D4C0'}] },
    vanity:        { brand:'Restoration Hardware Floating',  product:'Double vanity · Stone top · Custom finish',      swatches:[{name:'Whitewash Oak',hex:'#D4C4A8'},{name:'Graphite',hex:'#4A4A4A'},{name:'White',hex:'#F5F5F5'}] },
    shower_door:   { brand:'DreamLine Elegance Plus',        product:'Full frameless · 1/2" glass · Any finish',       swatches:[{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Oil-rubbed Bronze',hex:'#4A2E0A'},{name:'Matte Black',hex:'#2C2C2C'}] },
    cabinets:      { brand:'Dura Supreme Inset Shaker',      product:'Semi-custom inset · Dovetail · Soft-close',      swatches:[{name:'Alabaster',hex:'#F0EDE0'},{name:'Graphite',hex:'#4A4A4A'},{name:'Sage',hex:'#7A8C6A'}] },
    countertops:   { brand:'Cambria Brittanicca Warm',       product:'Quartz 3cm · Waterfall edge option',             swatches:[{name:'Brittanicca Warm',hex:'#F5EDD8'},{name:'Blackpool',hex:'#2A2A2A'},{name:'Berwyn',hex:'#F0F0F0'}] },
    lighting:      { brand:'Visual Comfort / circa lighting',product:'Designer pendants + recessed · 2700K',           swatches:[{name:'Antique Brass',hex:'#C8A84B'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Polished Nickel',hex:'#D4D4C0'}] },
    paint:         { brand:'Farrow & Ball / Benjamin Moore', product:'Premium paint · Rich depth · Designer palette',  swatches:[{name:"Elephant's Breath",hex:'#B8B0A4'},{name:'Hague Blue',hex:'#2A4052'},{name:'Shaded White',hex:'#E8E4DC'}] },
    doors:         { brand:'TruStile / Craftsman MDF',       product:'Flush inset · Paintable · Upgraded profile',     swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Painted Custom',hex:'#002147'}] },
  },
  luxury: {
    flooring:      { brand:'Hakwood European Oak 9.5"',      product:'Wide plank · Hand-scraped · Live sawn · Custom', swatches:[{name:'Smoked Pearl',hex:'#D4C8B0'},{name:'Ebony',hex:'#1C1008'},{name:'Ash White',hex:'#E8E0D0'}] },
    bath_floor:    { brand:'Antolini Calacatta Natural Stone',product:'Book-matched marble · Honed or polished',        swatches:[{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Black Marquina',hex:'#1A1A1A'},{name:'Verde Guatemala',hex:'#2D5A3D'}] },
    shower_wall:   { brand:'Antolini Book-matched Marble',   product:'Continuous veining · Custom panel sizing',       swatches:[{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Statuario',hex:'#F0EDEA'},{name:'Black Marquina',hex:'#1A1A1A'}] },
    shower_floor:  { brand:'Antolini Waterjet Medallion',    product:'Custom pattern · Natural stone · Hand-cut',      swatches:[{name:'Calacatta + Nero',hex:'#F5EDD8'},{name:'All Marble',hex:'#F0EDEA'},{name:'Custom Mix',hex:'#D4C8B0'}] },
    shower_bench:  { brand:'Custom marble floating bench',   product:'Waterfall stone bench · Steam niche · Any stone',swatches:[{name:'Calacatta',hex:'#F5EDD8'},{name:'Nero Marquina',hex:'#1A1A1A'},{name:'Travertine',hex:'#D4C4A0'}] },
    toilet:        { brand:'TOTO Neorest RH Bidet',          product:'Integrated bidet · Auto flush · Heated seat',    swatches:[{name:'Cotton White',hex:'#F5F5F5'},{name:'Bone',hex:'#E8DCC8'},{name:'Ebony',hex:'#3C3C3C'}] },
    fixtures:      { brand:'Waterworks / Kallista Custom',   product:'Handcrafted · Ceramic disc · Polished gold',     swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Vintage Nickel',hex:'#B8B8A0'},{name:'Matte White',hex:'#F0F0F0'}] },
    vanity:        { brand:'Waterworks Studio Custom',       product:'Custom floating · Natural stone top · Any finish',swatches:[{name:'Natural Oak',hex:'#C4A882'},{name:'Lacquered White',hex:'#FAFAFA'},{name:'Ebony',hex:'#1C1008'}] },
    shower_door:   { brand:'Custom Frameless Steam-ready',   product:'Custom glass · Steam · Designer hardware',       swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Matte Black',hex:'#2C2C2C'}] },
    cabinets:      { brand:'Plain & Fancy Full Custom',      product:'Any wood · Any finish · Any hardware',           swatches:[{name:'Lacquered White',hex:'#FAFAFA'},{name:'Cerused Oak',hex:'#C8B89A'},{name:'Charcoal',hex:'#3C3C3C'}] },
    countertops:   { brand:'Antolini Calacatta Borghini',    product:'Book-matched natural stone · Waterfall · Custom',swatches:[{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Black Marquina',hex:'#1A1A1A'},{name:'Verde Guatemala',hex:'#2D5A3D'}] },
    lighting:      { brand:'Kelly Wearstler / Apparatus',    product:'Statement lighting · Custom spec · 2700K',       swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Nickel',hex:'#D4D4C0'}] },
    paint:         { brand:'Farrow & Ball Dead Flat + Lacquer',product:'Bespoke color consultation · Lacquer option', swatches:[{name:'Off-Black',hex:'#2C2C2C'},{name:'Pavilion Gray',hex:'#B4B0A8'},{name:'All White',hex:'#F5F5F0'}] },
    doors:         { brand:'Simpson Door / Full Custom',     product:'Solid wood · Custom profile · Any finish',       swatches:[{name:'Natural Oak',hex:'#C4A882'},{name:'Lacquered White',hex:'#FAFAFA'},{name:'Ebony',hex:'#1C1008'}] },
  },
}

// ─── Rooms ─────────────────────────────────────────────────────────────────────
var ROOMS = [
  {
    id:'main', label:'Main Area', icon:'◻',
    categories:[
      {id:'flooring',     label:'Flooring'},
      {id:'lighting',     label:'Lighting'},
      {id:'paint',        label:'Paint colors'},
      {id:'doors',        label:'Interior doors'},
    ]
  },
  {
    id:'bathroom', label:'Bathroom', icon:'◧',
    categories:[
      {id:'bath_floor',   label:'Floor tile'},
      {id:'shower_wall',  label:'Shower wall tile'},
      {id:'shower_floor', label:'Shower floor tile'},
      {id:'shower_bench', label:'Shower bench & niche'},
      {id:'shower_door',  label:'Shower door / enclosure'},
      {id:'toilet',       label:'Toilet'},
      {id:'fixtures',     label:'Faucets & hardware'},
      {id:'vanity',       label:'Vanity'},
    ]
  },
  {
    id:'bar', label:'Bar Area', icon:'▭',
    categories:[
      {id:'cabinets',     label:'Bar cabinets'},
      {id:'countertops',  label:'Bar countertop'},
    ]
  },
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function ClientSelections() {
  var { data: session } = useSession()
  var [activeRoom,  setActiveRoom]  = useState('bathroom')
  var [picks,       setPicks]       = useState({})   // catId → { tier, swatchName }
  var [expanding,   setExpanding]   = useState(null) // catId with open swatch picker
  var [pendingSwatch, setPendingSwatch] = useState({}) // catId → swatchName (before confirm)
  var [savedMsg,    setSavedMsg]    = useState('')

  // Load saved picks from localStorage
  useEffect(function() {
    try {
      var saved = JSON.parse(localStorage.getItem('sb_selections') || '{}')
      var loaded = {}
      Object.keys(saved).forEach(function(catId) {
        var s = saved[catId]
        if (s.tier && s.value) loaded[catId] = { tier: s.tier, swatchName: s.value, hex: s.hex, brand: s.brand }
      })
      if (Object.keys(loaded).length > 0) setPicks(loaded)
    } catch(e) {}
  }, [])

  var clientName = session ? session.user.name : 'Ryan and Dori Mendel'
  var room = ROOMS.find(function(r){ return r.id === activeRoom })

  var allCats = ROOMS.flatMap(function(r){ return r.categories.map(function(c){ return c.id }) })
  var confirmedCount = allCats.filter(function(c){ return picks[c] }).length
  var pendingCount   = allCats.length - confirmedCount

  function selectTier(catId, tierKey) {
    // Set tier for this category, clear pending swatch
    setPicks(function(prev) {
      var existing = prev[catId] || {}
      return Object.assign({}, prev, { [catId]: { tier: tierKey, swatchName: existing.swatchName || null } })
    })
    setExpanding(catId)
    setPendingSwatch(function(prev){ return Object.assign({}, prev, { [catId]: null }) })
  }

  function confirmSwatch(catId) {
    var pick = picks[catId]
    if (!pick || !pick.tier) return
    var swatch = pendingSwatch[catId] || (pick.swatchName)
    var prod = PRODUCTS[pick.tier][catId]
    var sw = prod ? prod.swatches.find(function(s){ return s.name === swatch }) : null

    var updated = Object.assign({}, pick, { swatchName: swatch, hex: sw ? sw.hex : '#ccc', brand: prod ? prod.brand : '' })
    setPicks(function(prev){ return Object.assign({}, prev, { [catId]: updated }) })

    // Save to localStorage
    try {
      var existing = JSON.parse(localStorage.getItem('sb_selections') || '{}')
      existing[catId] = { value: swatch, tier: pick.tier, brand: prod ? prod.brand : '', hex: sw ? sw.hex : '#ccc' }
      localStorage.setItem('sb_selections', JSON.stringify(existing))
      // Also persist to Supabase if a project_id was passed in the URL
      try {
        var projectId = new URLSearchParams(window.location.search).get('id')
        if (projectId) {
          fetch('/api/projects/' + projectId + '/selections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selections: existing }),
          }).catch(function(){})
        }
      } catch(e2) {}
    } catch(e) {}

    setExpanding(null)
    setSavedMsg('Saved!')
    setTimeout(function(){ setSavedMsg('') }, 2000)
  }

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>

      {/* Topbar */}
      <div style={{background:'#002147',padding:'0.85rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:30,width:'auto'}}/>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase'}}>Material Selections</span>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          {savedMsg && <span style={{background:'#eaf3de',color:'#3B6D11',fontSize:11,padding:'3px 10px',borderRadius:3,fontWeight:600}}>✓ {savedMsg}</span>}
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)'}}>{clientName}</span>
          <a href="/client/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.6)',textDecoration:'none'}}>← Dashboard</a>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem',display:'grid',gridTemplateColumns:'180px 1fr',gap:20}}>

        {/* Left: room nav */}
        <div>
          <div style={{fontSize:9,fontWeight:600,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Rooms</div>
          <div style={{border:'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',marginBottom:12}}>
            {ROOMS.map(function(r) {
              var isActive = r.id === activeRoom
              var roomCats = r.categories.map(function(c){ return c.id })
              var done = roomCats.filter(function(c){ return picks[c] }).length
              return (
                <div key={r.id} onClick={function(){ setActiveRoom(r.id); setExpanding(null) }}
                  style={{padding:'10px 14px',borderBottom:'1px solid #f0efec',cursor:'pointer',background:isActive?'#002147':'#fff',borderLeft:'3px solid '+(isActive?'#FF8C00':'transparent')}}>
                  <div style={{fontSize:13,fontWeight:600,color:isActive?'#FF8C00':'#002147'}}>{r.label}</div>
                  <div style={{fontSize:10,color:isActive?'rgba(255,255,255,.5)':'#9a9690',marginTop:1}}>
                    {done}/{roomCats.length} selected
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{background:'#002147',borderRadius:4,padding:'10px 14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.6)',marginBottom:4}}>Progress</div>
            <div style={{fontSize:16,fontWeight:700,color:'#FF8C00'}}>{confirmedCount}<span style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:400}}>/{allCats.length}</span></div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:8}}>selections made</div>
            <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2}}>
              <div style={{height:4,width:Math.round(confirmedCount/allCats.length*100)+'%',background:'#FF8C00',borderRadius:2}}/>
            </div>
            {pendingCount === 0 && (
              <a href="/client/project-book" style={{display:'block',marginTop:10,background:'#FF8C00',color:'#fff',padding:'7px',fontSize:10,fontWeight:700,textDecoration:'none',borderRadius:3,textAlign:'center',textTransform:'uppercase',letterSpacing:'.06em'}}>
                View project book →
              </a>
            )}
          </div>
        </div>

        {/* Right: categories with tier grid */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:20,color:'#002147'}}>{room.label}</div>
              <div style={{fontSize:11,color:'#9a9690',marginTop:2}}>SB-2026-001 · Mendel Basement Renovation</div>
            </div>
            {/* Tier legend */}
            <div style={{display:'flex',gap:6}}>
              {TIERS.map(function(t){return(
                <div key={t.key} style={{background:t.bg,color:t.color,fontSize:9,fontWeight:700,padding:'3px 8px',borderRadius:3,border:'1px solid '+t.color,textTransform:'uppercase',letterSpacing:'.06em'}}>{t.label}</div>
              )})}
            </div>
          </div>

          {room.categories.map(function(cat) {
            var catId    = cat.id
            var pick     = picks[catId]
            var isExpanded = expanding === catId

            return (
              <div key={catId} style={{marginBottom:10,border:'1px solid '+(pick?'#c8dfc0':'#e8e6e0'),borderRadius:6,overflow:'hidden',borderLeft:'4px solid '+(pick?'#3B6D11':'#FF8C00')}}>

                {/* Category header */}
                <div style={{padding:'10px 14px',background:pick?'#f8fff5':'#fafafa',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {pick && <div style={{width:18,height:18,borderRadius:'50%',background:pick.hex||'#ccc',border:'2px solid rgba(0,0,0,.1)',flexShrink:0}}/>}
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#002147'}}>{cat.label}</div>
                      {pick
                        ? <div style={{fontSize:11,color:'#3B6D11',marginTop:1}}>✓ {pick.swatchName} — <span style={{color:'#9a9690'}}>{PRODUCTS[pick.tier][catId] ? PRODUCTS[pick.tier][catId].brand : ''}</span></div>
                        : <div style={{fontSize:11,color:'#e65100',marginTop:1}}>Select a tier and finish below</div>
                      }
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {pick && <span style={{background:'#eaf3de',color:'#3B6D11',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:3,textTransform:'uppercase',border:'1px solid #c8dfc0'}}>
                      {TIERS.find(function(t){return t.key===pick.tier}).label}
                    </span>}
                    <button onClick={function(){ setExpanding(isExpanded?null:catId) }}
                      style={{background:'transparent',border:'1px solid #e8e6e0',color:'#002147',padding:'4px 12px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                      {isExpanded ? 'Close ▲' : (pick ? 'Change ▼' : 'Select ▼')}
                    </button>
                  </div>
                </div>

                {/* Expanded: 4-tier grid */}
                {isExpanded && (
                  <div style={{borderTop:'1px solid #e8e6e0',padding:'14px'}}>

                    {/* Tier selector row */}
                    <div style={{fontSize:10,fontWeight:600,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Choose your tier</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                      {TIERS.map(function(tier) {
                        var prod = PRODUCTS[tier.key][catId]
                        var isSelected = pick && pick.tier === tier.key
                        if (!prod) return null
                        return (
                          <div key={tier.key}
                            onClick={function(){ selectTier(catId, tier.key) }}
                            style={{border:isSelected?'2px solid '+tier.color:'1px solid #e8e6e0',borderRadius:4,padding:'10px',cursor:'pointer',background:isSelected?tier.bg:'#fff',transition:'all .1s'}}>
                            <div style={{fontSize:10,fontWeight:700,color:tier.color,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{tier.label} · {fmt(tier.price)}</div>
                            <div style={{fontSize:11,fontWeight:600,color:'#002147',marginBottom:2,lineHeight:1.3}}>{prod.brand}</div>
                            <div style={{fontSize:10,color:'#9a9690',lineHeight:1.4,marginBottom:8}}>{prod.product}</div>
                            {/* Swatches preview */}
                            <div style={{display:'flex',gap:3}}>
                              {prod.swatches.map(function(sw){return(
                                <div key={sw.name} title={sw.name} style={{width:14,height:14,borderRadius:'50%',background:sw.hex,border:'1px solid rgba(0,0,0,.15)'}}/>
                              )})}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Swatch picker — shows when tier is picked */}
                    {pick && pick.tier && (function(){
                      var prod = PRODUCTS[pick.tier][catId]
                      var pendingSw = pendingSwatch[catId] || pick.swatchName
                      return (
                        <div style={{background:'#f8f8f8',border:'1px solid #e8e6e0',borderRadius:4,padding:'12px'}}>
                          <div style={{fontSize:10,fontWeight:600,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Choose your finish / color</div>
                          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:12}}>
                            {prod.swatches.map(function(sw) {
                              var isSel = pendingSw === sw.name
                              return (
                                <div key={sw.name}
                                  onClick={function(){ setPendingSwatch(function(prev){ return Object.assign({},prev,{[catId]:sw.name}) }) }}
                                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'10px 14px',border:isSel?'2px solid #FF8C00':'1px solid #e8e6e0',borderRadius:4,cursor:'pointer',background:isSel?'#FFFCEB':'#fff',minWidth:90}}>
                                  <div style={{width:36,height:36,borderRadius:'50%',background:sw.hex,border:'2px solid rgba(0,0,0,.1)'}}/>
                                  <div style={{fontSize:10,fontWeight:isSel?700:400,color:'#002147',textAlign:'center',lineHeight:1.3}}>{sw.name}</div>
                                </div>
                              )
                            })}
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={function(){ confirmSwatch(catId) }}
                              disabled={!pendingSw}
                              style={{background:pendingSw?'#002147':'#e8e6e0',color:pendingSw?'#fff':'#9a9690',border:pendingSw?'2px solid #FF8C00':'none',padding:'9px 24px',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:pendingSw?'pointer':'default',borderRadius:3,fontFamily:'sans-serif'}}>
                              Confirm selection →
                            </button>
                            <button onClick={function(){setExpanding(null)}}
                              style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'9px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
