import Layout from '../../components/Layout'
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
    cabinets:      { brand:'Hampton Bay (Home Depot)',        product:'Shaker Stock · Plywood box · Soft-close',       swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Navy',hex:'#0a0a0a'}] },
    countertops:   { brand:'Wilsonart HD Laminate',          product:'1.5" post-form edge · Easy clean',              swatches:[{name:'Calcutta Marble',hex:'#F5F0E8'},{name:'Black Fusion',hex:'#2C2C2C'},{name:'Ash Elm',hex:'#B5956A'}] },
    lighting:      { brand:'Halo 6" LED Recessed',           product:'2700K warm white · Dimmable · 20 fixtures',     swatches:[{name:'White Trim',hex:'#F5F5F5'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Black Trim',hex:'#2C2C2C'}] },
    paint:         { brand:'Sherwin-Williams / Behr',         product:'2 coats walls + ceiling · Semi-gloss trim',     swatches:[{name:'SW Agreeable Gray',hex:'#C2BAA6'},{name:'SW Repose Gray',hex:'#B4B0AA'},{name:'SW Accessible Beige',hex:'#D2C5B0'},{name:'SW Sea Salt',hex:'#B5C8BF'},{name:'SW Alabaster',hex:'#F0EDE0'},{name:'SW Pure White',hex:'#F5F5F0'},{name:'SW Naval',hex:'#2A3A52'},{name:'SW Urbane Bronze',hex:'#595248'},{name:'Behr Swiss Coffee',hex:'#F0E8D8'},{name:'Behr Cracked Pepper',hex:'#3C3C38'}] },
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
    paint:         { brand:'Sherwin-Williams Emerald / Benjamin Moore',product:'Premium 2 coats · Low VOC · Excellent hide',swatches:[{name:'BM White Dove',hex:'#F5F0E8'},{name:'BM Chantilly Lace',hex:'#F8F6F0'},{name:'BM Revere Pewter',hex:'#C0B8A8'},{name:'BM Pale Oak',hex:'#D8CFC0'},{name:'BM Hale Navy',hex:'#2A3C50'},{name:'BM Kendall Charcoal',hex:'#5A5A58'},{name:'SW Evergreen Fog',hex:'#8A9E80'},{name:'SW Caviar',hex:'#2C2C2A'},{name:'SW Creamy',hex:'#F0E8CC'},{name:'BM Classic Gray',hex:'#E0DDD8'}] },
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
    paint:         { brand:'Benjamin Moore Aura / Farrow & Ball',product:'Premium paint · Rich depth · Designer palette',swatches:[{name:"F&B Elephant's Breath",hex:'#B8B0A4'},{name:'F&B Hague Blue',hex:'#2A4052'},{name:'F&B Shaded White',hex:'#E8E4DC'},{name:'F&B Skimming Stone',hex:'#D8D0C0'},{name:"F&B Mole's Breath",hex:'#7A7068'},{name:'F&B All White',hex:'#F5F5F0'},{name:'BM Simply White',hex:'#F5F2EC'},{name:'BM Gray Owl',hex:'#C8C8C0'},{name:'BM Newburyport Blue',hex:'#3A5068'},{name:'F&B Setting Plaster',hex:'#C8A89A'}] },
    doors:         { brand:'TruStile / Craftsman MDF',       product:'Flush inset · Paintable · Upgraded profile',     swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Painted Custom',hex:'#0a0a0a'}] },
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
    paint:         { brand:'Farrow & Ball Dead Flat / Bespoke',product:'Color consultation included · Dead Flat or Lacquer finish',swatches:[{name:'F&B Off-Black',hex:'#2C2C2C'},{name:'F&B Pavilion Gray',hex:'#B4B0A8'},{name:'F&B Dead Salmon',hex:'#D4B0A0'},{name:'F&B Calke Green',hex:'#5A7868'},{name:'F&B Card Room Green',hex:'#6A8070'},{name:'F&B Studio Green',hex:'#3A5040'},{name:'F&B Sulking Room Pink',hex:'#C8A090'},{name:'F&B Inchyra Blue',hex:'#4A6070'},{name:'F&B Pitch Black',hex:'#1C1C1C'},{name:'Bespoke (any color)',hex:'#D06830'}] },
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
  var [customItems, setCustomItems] = useState([])
  var [customForm,  setCustomForm]  = useState({ item:'', brand:'', color:'', notes:'' })
  var [customSaved, setCustomSaved] = useState(false)

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
    try {
      var customs = JSON.parse(localStorage.getItem('sb_custom_selections') || '[]')
      if (customs.length > 0) setCustomItems(customs)
    } catch(e) {}
  }, [])

  function addCustomSelection() {
    if (!customForm.item.trim()) return
    var newItem = {
      id:     'custom-' + Date.now(),
      item:   customForm.item.trim(),
      brand:  customForm.brand.trim(),
      color:  customForm.color.trim(),
      notes:  customForm.notes.trim(),
      addedAt: new Date().toISOString(),
    }
    var updated = customItems.concat([newItem])
    setCustomItems(updated)
    localStorage.setItem('sb_custom_selections', JSON.stringify(updated))
    // Also merge into sb_selections so project book picks it up
    try {
      var existing = JSON.parse(localStorage.getItem('sb_selections') || '{}')
      existing[newItem.id] = { value: newItem.item, brand: newItem.brand, hex: '#9a9690', tier: 'custom', notes: newItem.notes + (newItem.color ? ' · ' + newItem.color : '') }
      localStorage.setItem('sb_selections', JSON.stringify(existing))
    } catch(e) {}
    setCustomForm({ item:'', brand:'', color:'', notes:'' })
    setCustomSaved(true)
    setTimeout(function(){ setCustomSaved(false) }, 2500)
  }

  function removeCustomItem(id) {
    var updated = customItems.filter(function(c){ return c.id !== id })
    setCustomItems(updated)
    localStorage.setItem('sb_custom_selections', JSON.stringify(updated))
  }

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
    <Layout>

      {savedMsg && <div style={{background:'rgba(59,109,17,.15)',borderBottom:'1px solid rgba(59,109,17,.3)',padding:'6px 1.5rem',fontSize:12,color:'#7BC67A',fontWeight:600}}>✓ {savedMsg}</div>}

      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem',display:'grid',gridTemplateColumns:'180px 1fr',gap:20}}>

        {/* Left: room nav */}
        <div>
          <div style={{fontSize:9,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Rooms</div>
          <div style={{border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',marginBottom:12}}>
            {ROOMS.map(function(r) {
              var isActive = r.id === activeRoom
              var roomCats = r.categories.map(function(c){ return c.id })
              var done = roomCats.filter(function(c){ return picks[c] }).length
              return (
                <div key={r.id} onClick={function(){ setActiveRoom(r.id); setExpanding(null) }}
                  style={{padding:'10px 14px',borderBottom:'1px solid rgba(255,255,255,.06)',cursor:'pointer',background:isActive?'#0a0a0a':'#161616',borderLeft:'3px solid '+(isActive?'#D06830':'transparent')}}>
                  <div style={{fontSize:13,fontWeight:600,color:isActive?'#D06830':'rgba(255,255,255,.7)'}}>{r.label}</div>
                  <div style={{fontSize:10,color:isActive?'rgba(255,255,255,.5)':'#9a9690',marginTop:1}}>
                    {done}/{roomCats.length} selected
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{background:'#0a0a0a',borderRadius:4,padding:'10px 14px'}}>
            <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.6)',marginBottom:4}}>Progress</div>
            <div style={{fontSize:16,fontWeight:700,color:'#D06830'}}>{confirmedCount}<span style={{fontSize:11,color:'rgba(255,255,255,.4)',fontWeight:400}}>/{allCats.length}</span></div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginBottom:8}}>selections made</div>
            <div style={{height:4,background:'rgba(255,255,255,.1)',borderRadius:2}}>
              <div style={{height:4,width:Math.round(confirmedCount/allCats.length*100)+'%',background:'#D06830',borderRadius:2}}/>
            </div>
            {pendingCount === 0 && (
              <a href="/client/project-book" style={{display:'block',marginTop:10,background:'#D06830',color:'#fff',padding:'7px',fontSize:10,fontWeight:700,textDecoration:'none',borderRadius:3,textAlign:'center',textTransform:'uppercase',letterSpacing:'.06em'}}>
                View project book →
              </a>
            )}
          </div>
        </div>

        {/* Right: categories with tier grid */}
        <div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
            <div>
              <div style={{fontFamily:'Poppins,sans-serif',fontSize:20,color:'#fff',fontWeight:700}}>{room.label}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)',marginTop:2}}>SB-2026-001 · Mendel Basement Renovation</div>
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
              <div key={catId} style={{marginBottom:10,border:'1px solid '+(pick?'rgba(59,109,17,.4)':'rgba(255,255,255,.09)'),borderRadius:6,overflow:'hidden',borderLeft:'4px solid '+(pick?'#3B6D11':'#D06830')}}>

                {/* Category header */}
                <div style={{padding:'10px 14px',background:pick?'rgba(59,109,17,.08)':'#161616',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    {pick && <div style={{width:18,height:18,borderRadius:'50%',background:pick.hex||'#ccc',border:'2px solid rgba(255,255,255,.2)',flexShrink:0}}/>}
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.85)'}}>{cat.label}</div>
                      {pick
                        ? <div style={{fontSize:11,color:'#3B6D11',marginTop:1}}>✓ {pick.swatchName} — <span style={{color:'rgba(255,255,255,.35)'}}>{PRODUCTS[pick.tier][catId] ? PRODUCTS[pick.tier][catId].brand : ''}</span></div>
                        : <div style={{fontSize:11,color:'#e65100',marginTop:1}}>Select a tier and finish below</div>
                      }
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {pick && <span style={{background:'#eaf3de',color:'#3B6D11',fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:3,textTransform:'uppercase',border:'1px solid #c8dfc0'}}>
                      {TIERS.find(function(t){return t.key===pick.tier}).label}
                    </span>}
                    <button onClick={function(){ setExpanding(isExpanded?null:catId) }}
                      style={{background:'transparent',border:'1px solid rgba(255,255,255,.15)',color:'rgba(255,255,255,.65)',padding:'4px 12px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                      {isExpanded ? 'Close ▲' : (pick ? 'Change ▼' : 'Select ▼')}
                    </button>
                  </div>
                </div>

                {/* Expanded: 4-tier grid */}
                {isExpanded && (
                  <div style={{borderTop:'1px solid rgba(255,255,255,.07)',padding:'14px',background:'#111'}}>

                    {/* Tier selector row */}
                    <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Choose your tier</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
                      {TIERS.map(function(tier) {
                        var prod = PRODUCTS[tier.key][catId]
                        var isSelected = pick && pick.tier === tier.key
                        if (!prod) return null
                        return (
                          <div key={tier.key}
                            onClick={function(){ selectTier(catId, tier.key) }}
                            style={{border:isSelected?'2px solid '+tier.color:'1px solid rgba(255,255,255,.1)',borderRadius:4,padding:'10px',cursor:'pointer',background:isSelected?'rgba(0,0,0,.4)':'#1a1a1a',transition:'all .1s'}}>
                            <div style={{fontSize:10,fontWeight:700,color:tier.color,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>{tier.label} · {fmt(tier.price)}</div>
                            <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,.85)',marginBottom:2,lineHeight:1.3}}>{prod.brand}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',lineHeight:1.4,marginBottom:8}}>{prod.product}</div>
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
                        <div style={{background:'#1a1a1a',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,padding:'12px'}}>
                          <div style={{fontSize:10,fontWeight:600,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:10}}>Choose your finish / color</div>
                          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:12}}>
                            {prod.swatches.map(function(sw) {
                              var isSel = pendingSw === sw.name
                              return (
                                <div key={sw.name}
                                  onClick={function(){ setPendingSwatch(function(prev){ return Object.assign({},prev,{[catId]:sw.name}) }) }}
                                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'10px 14px',border:isSel?'2px solid #D06830':'1px solid rgba(255,255,255,.1)',borderRadius:4,cursor:'pointer',background:isSel?'rgba(208,104,48,.12)':'#222',minWidth:90}}>
                                  <div style={{width:36,height:36,borderRadius:'50%',background:sw.hex,border:'2px solid rgba(255,255,255,.15)'}}/>
                                  <div style={{fontSize:10,fontWeight:isSel?700:400,color:'rgba(255,255,255,.75)',textAlign:'center',lineHeight:1.3}}>{sw.name}</div>
                                </div>
                              )
                            })}
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={function(){ confirmSwatch(catId) }}
                              disabled={!pendingSw}
                              style={{background:pendingSw?'#D06830':'rgba(255,255,255,.06)',color:pendingSw?'#fff':'rgba(255,255,255,.3)',border:'none',padding:'9px 24px',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:pendingSw?'pointer':'default',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                              Confirm selection →
                            </button>
                            <button onClick={function(){setExpanding(null)}}
                              style={{background:'transparent',border:'1px solid rgba(255,255,255,.09)',color:'rgba(255,255,255,.35)',padding:'9px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
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

        {/* ── Custom / unlisted selection ─────────────────────────────────── */}
        <div style={{gridColumn:'1 / -1',marginTop:'2rem',border:'2px dashed rgba(255,255,255,.12)',borderRadius:6,padding:'1.5rem',background:'#161616'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(208,104,48,.15)',border:'1px solid rgba(208,104,48,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#D06830',flexShrink:0}}>+</div>
            <div style={{fontFamily:'Poppins,sans-serif',fontSize:16,fontWeight:600,color:'rgba(255,255,255,.85)'}}>Do you have another selection not listed?</div>
          </div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.35)',marginBottom:'1.25rem',marginLeft:38}}>Add any material, finish, or fixture not shown above — it will appear in your project book.</div>

          {/* Existing custom items */}
          {customItems.length > 0 && (
            <div style={{marginBottom:'1rem',marginLeft:38}}>
              {customItems.map(function(c){ return (
                <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'rgba(59,109,17,.12)',border:'1px solid rgba(59,109,17,.3)',borderRadius:4,marginBottom:6}}>
                  <div>
                    <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.85)'}}>{c.item}</span>
                    {c.brand && <span style={{fontSize:11,color:'rgba(255,255,255,.5)',marginLeft:8}}>{c.brand}</span>}
                    {c.color && <span style={{fontSize:11,color:'rgba(255,255,255,.35)',marginLeft:8}}>· {c.color}</span>}
                    {c.notes && <span style={{fontSize:10,color:'rgba(255,255,255,.35)',marginLeft:8}}>· {c.notes}</span>}
                  </div>
                  <button onClick={function(){ removeCustomItem(c.id) }}
                    style={{background:'transparent',border:'none',color:'rgba(255,255,255,.35)',fontSize:14,cursor:'pointer',padding:'0 4px',lineHeight:1}}>✕</button>
                </div>
              )})}
            </div>
          )}

          {/* Form */}
          <div style={{marginLeft:38}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Item / description *</div>
                <input
                  value={customForm.item}
                  onChange={function(e){ setCustomForm(function(p){ return Object.assign({},p,{item:e.target.value}) }) }}
                  placeholder="e.g. Laundry room tile, stair railing, accent wall"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid rgba(255,255,255,.12)',borderRadius:3,fontSize:12,fontFamily:'Poppins,sans-serif',outline:'none',boxSizing:'border-box',background:'#1a1a1a',color:'rgba(255,255,255,.85)'}}
                />
              </div>
              <div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Brand / manufacturer</div>
                <input
                  value={customForm.brand}
                  onChange={function(e){ setCustomForm(function(p){ return Object.assign({},p,{brand:e.target.value}) }) }}
                  placeholder="e.g. Sherwin-Williams, Kohler, Home Depot"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid rgba(255,255,255,.12)',borderRadius:3,fontSize:12,fontFamily:'Poppins,sans-serif',outline:'none',boxSizing:'border-box',background:'#1a1a1a',color:'rgba(255,255,255,.85)'}}
                />
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1rem'}}>
              <div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Color / finish / model #</div>
                <input
                  value={customForm.color}
                  onChange={function(e){ setCustomForm(function(p){ return Object.assign({},p,{color:e.target.value}) }) }}
                  placeholder="e.g. SW Agreeable Gray, matte black, #SKU-1234"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid rgba(255,255,255,.12)',borderRadius:3,fontSize:12,fontFamily:'Poppins,sans-serif',outline:'none',boxSizing:'border-box',background:'#1a1a1a',color:'rgba(255,255,255,.85)'}}
                />
              </div>
              <div>
                <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Notes or link (optional)</div>
                <input
                  value={customForm.notes}
                  onChange={function(e){ setCustomForm(function(p){ return Object.assign({},p,{notes:e.target.value}) }) }}
                  placeholder="Any details for your contractor"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid rgba(255,255,255,.12)',borderRadius:3,fontSize:12,fontFamily:'Poppins,sans-serif',outline:'none',boxSizing:'border-box',background:'#1a1a1a',color:'rgba(255,255,255,.85)'}}
                />
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <button
                onClick={addCustomSelection}
                disabled={!customForm.item.trim()}
                style={{background:customForm.item.trim()?'#D06830':'rgba(255,255,255,.06)',color:customForm.item.trim()?'#fff':'rgba(255,255,255,.3)',border:'none',padding:'9px 24px',fontSize:12,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',cursor:customForm.item.trim()?'pointer':'default',borderRadius:3,fontFamily:'Poppins,sans-serif'}}>
                Add to my selections →
              </button>
              {customSaved && <span style={{fontSize:12,color:'#3B6D11',fontWeight:600}}>✓ Added to your project book</span>}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
