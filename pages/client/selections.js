import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

var TIER_INFO = {
  good:    { label:'Good',    price:53000, color:'#3B6D11', bg:'#eaf3de', desc:'Quality materials, proven brands' },
  better:  { label:'Better',  price:62000, color:'#185FA5', bg:'#e6f1fb', desc:'Upgraded finishes, semi-custom' },
  best:    { label:'Best',    price:73000, color:'#534AB7', bg:'#eeedfe', desc:'Premium selections, designer grade' },
  luxury:  { label:'Luxury',  price:89000, color:'#854F0B', bg:'#faeeda', desc:'Full custom, top-of-market' },
}

var PRODUCTS = {
  good: {
    flooring:     { brand:'Shaw Floorté Pro Series', product:'LVP 6mm · Waterproof · Click-lock', swatches:[{name:'Natural Biscuit',hex:'#D4C4A8'},{name:'Gunstock Oak',hex:'#8B6914'},{name:'Storm Gray',hex:'#7A7A7A'}] },
    tile:         { brand:'Daltile Restore 12×24', product:'Ceramic · Rectified · Frost resistant', swatches:[{name:'Bright White',hex:'#F5F5F5'},{name:'Silver Gray',hex:'#C0C0C0'},{name:'Almond',hex:'#EFDECD'}] },
    cabinets:     { brand:'Hampton Bay (Home Depot)', product:'Shaker Stock · Plywood box · Soft-close', swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Navy',hex:'#002147'}] },
    countertops:  { brand:'Wilsonart HD Laminate', product:'1.5" post-form edge · Easy clean', swatches:[{name:'Calcutta Marble',hex:'#F5F0E8'},{name:'Black Fusion',hex:'#2C2C2C'},{name:'Ash Elm',hex:'#B5956A'}] },
    fixtures:     { brand:'Moen Align Series', product:'Single-handle · Lifetime warranty · ADA', swatches:[{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Chrome',hex:'#E8E8E8'},{name:'Matte Black',hex:'#2C2C2C'}] },
    vanity:       { brand:'Glacier Bay (Home Depot)', product:'30" Single vanity with mirror · Soft-close', swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Espresso',hex:'#3C2415'}] },
    shower:       { brand:'DreamLine Flex', product:'Semi-frameless · 3/8" glass · Chrome', swatches:[{name:'Chrome',hex:'#E8E8E8'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Black',hex:'#2C2C2C'}] },
    lighting:     { brand:'Halo 6" LED Recessed', product:'2700K warm white · Dimmable · 20 fixtures', swatches:[{name:'Brushed Nickel Trim',hex:'#C0C0B0'},{name:'White Trim',hex:'#F5F5F5'},{name:'Black Trim',hex:'#2C2C2C'}] },
    paint:        { brand:'Sherwin-Williams', product:'2 coats walls + ceiling · Semi-gloss trim', swatches:[{name:'Agreeable Gray SW7029',hex:'#C2BAA6'},{name:'Accessible Beige SW7036',hex:'#D2C5B0'},{name:'Repose Gray SW7015',hex:'#B4B0AA'}] },
    doors:        { brand:'Masonite Interior', product:'Primed hollow-core · Ready to paint', swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Barn Stain',hex:'#8B6914'}] },
  },
  better: {
    flooring:     { brand:'COREtec Plus Enhanced XL', product:'Premium LVP 9" wide · 8mm · Cork underlayment', swatches:[{name:'Vero Beach Oak',hex:'#C4A882'},{name:'Driftwood',hex:'#9E8B6F'},{name:'Coastal Pine',hex:'#8B7355'}] },
    tile:         { brand:'MSI Carrara White 24×24', product:'Porcelain · Polished · Rectified', swatches:[{name:'Carrara White',hex:'#F0EDE8'},{name:'Nero Marquina',hex:'#1A1A1A'},{name:'Crema Marfil',hex:'#E8D5B0'}] },
    cabinets:     { brand:'KraftMaid Dovetail Shaker', product:'Semi-custom · Soft-close · Plywood box', swatches:[{name:'Dove White',hex:'#F0EDE8'},{name:'Flagstone',hex:'#8B8070'},{name:'Espresso',hex:'#3C2415'}] },
    countertops:  { brand:'Silestone Eternal Calacatta', product:'Quartz 3cm · Eased edge · NSF certified', swatches:[{name:'Calacatta Gold',hex:'#F5F0E0'},{name:'Charcoal Soapstone',hex:'#4A4A4A'},{name:'White Storm',hex:'#F0F0F0'}] },
    fixtures:     { brand:'Delta Trinsic Series', product:'Matte Black · Touch2O · Magnetic docking', swatches:[{name:'Matte Black',hex:'#2C2C2C'},{name:'Satin Brass',hex:'#C8A84B'},{name:'Gunmetal',hex:'#5C5C5C'}] },
    vanity:       { brand:'Style Selections (Lowes)', product:'36" Double vanity · Quartz top · Soft-close', swatches:[{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Wood tone',hex:'#C4A47C'}] },
    shower:       { brand:'DreamLine Enigma-X', product:'Frameless · 3/8" glass · Brushed Nickel', swatches:[{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Chrome',hex:'#E8E8E8'}] },
    lighting:     { brand:'Halo 6" LED + Pendants', product:'2700K dimmable recessed + 2 pendant lights', swatches:[{name:'Matte Black',hex:'#2C2C2C'},{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Brass',hex:'#C8A84B'}] },
    paint:        { brand:'Sherwin-Williams Emerald', product:'Premium 2 coats · Excellent hide · Low VOC', swatches:[{name:'Agreeable Gray SW7029',hex:'#C2BAA6'},{name:'Sea Salt SW6204',hex:'#B5C8BF'},{name:'Naval SW6244',hex:'#2A3A52'}] },
    doors:        { brand:'Masonite Solid Core', product:'Solid-core primed · Upgraded feel', swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Barn Stain',hex:'#8B6914'}] },
  },
  best: {
    flooring:     { brand:'Anderson Tuftex Bernina Oak', product:'Engineered hardwood 7" wide · Wire-brushed', swatches:[{name:'Glacier',hex:'#E8E0D0'},{name:'Cognac',hex:'#8B4513'},{name:'Graphite',hex:'#5A5A5A'}] },
    tile:         { brand:'Porcelanosa Marmol 32×32', product:'Large format porcelain · Polished · Rectified', swatches:[{name:'Calacatta',hex:'#F5F0E8'},{name:'Reno Noir',hex:'#1C1C1C'},{name:'Crema',hex:'#E8D5B0'}] },
    cabinets:     { brand:'Dura Supreme Inset Shaker', product:'Semi-custom inset · Dovetail · Soft-close', swatches:[{name:'Alabaster',hex:'#F0EDE0'},{name:'Graphite',hex:'#4A4A4A'},{name:'Sage',hex:'#7A8C6A'}] },
    countertops:  { brand:'Cambria Brittanicca Warm', product:'Quartz 3cm · Waterfall edge · NSF certified', swatches:[{name:'Brittanicca Warm',hex:'#F5EDD8'},{name:'Blackpool',hex:'#2A2A2A'},{name:'Berwyn',hex:'#F0F0F0'}] },
    fixtures:     { brand:'Brizo Litze Series', product:'Unlacquered brass · SmartTouch · Lifetime', swatches:[{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Oil-rubbed Bronze',hex:'#4A2E0A'},{name:'Polished Nickel',hex:'#D4D4C0'}] },
    vanity:       { brand:'Restoration Hardware / RH', product:'Floating double vanity · Stone top · Custom finish', swatches:[{name:'Whitewash Oak',hex:'#D4C4A8'},{name:'Graphite',hex:'#4A4A4A'},{name:'White',hex:'#F5F5F5'}] },
    shower:       { brand:'DreamLine Elegance Plus', product:'Full frameless · 3/8" glass · Unlacquered brass', swatches:[{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Oil-rubbed Bronze',hex:'#4A2E0A'},{name:'Matte Black',hex:'#2C2C2C'}] },
    lighting:     { brand:'Visual Comfort / circa lighting', product:'Designer pendants + recessed · 2700K', swatches:[{name:'Antique Brass',hex:'#C8A84B'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Polished Nickel',hex:'#D4D4C0'}] },
    paint:        { brand:'Farrow & Ball / Benjamin Moore', product:'Premium paint · Rich depth · Designer palette', swatches:[{name:'Elephant\'s Breath',hex:'#B8B0A4'},{name:'Hague Blue',hex:'#2A4052'},{name:'Shaded White',hex:'#E8E4DC'}] },
    doors:        { brand:'TruStile / Craftsman', product:'MDF flush inset · Paintable · Upgraded profile', swatches:[{name:'White',hex:'#F5F5F5'},{name:'Off-White',hex:'#F0EDE8'},{name:'Painted Custom',hex:'#002147'}] },
  },
  luxury: {
    flooring:     { brand:'Hakwood European Oak 9.5"', product:'Wide plank · Hand-scraped · Live sawn · Custom', swatches:[{name:'Smoked Pearl',hex:'#D4C8B0'},{name:'Ebony',hex:'#1C1008'},{name:'Ash White',hex:'#E8E0D0'}] },
    tile:         { brand:'Antolini / Natural Stone', product:'Book-matched marble · Leathered or polished', swatches:[{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Black Marquina',hex:'#1A1A1A'},{name:'Verde Guatemala',hex:'#2D5A3D'}] },
    cabinets:     { brand:'Plain & Fancy / Brookhaven', product:'Full custom · Any wood · Any finish · Any hardware', swatches:[{name:'Lacquered White',hex:'#FAFAFA'},{name:'Cerused Oak',hex:'#C8B89A'},{name:'Charcoal',hex:'#3C3C3C'}] },
    countertops:  { brand:'Antolini Calacatta Borghini', product:'Book-matched natural stone · Waterfall · Custom edge', swatches:[{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Black Marquina',hex:'#1A1A1A'},{name:'Verde Guatemala',hex:'#2D5A3D'}] },
    fixtures:     { brand:'Waterworks / Kallista', product:'Custom collection · Handcrafted · Polished gold', swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Vintage Nickel',hex:'#B8B8A0'},{name:'Matte White',hex:'#F0F0F0'}] },
    vanity:       { brand:'Waterworks Studio', product:'Custom floating vanity · Natural stone top · Any finish', swatches:[{name:'Natural Oak',hex:'#C4A882'},{name:'Lacquered White',hex:'#FAFAFA'},{name:'Ebony',hex:'#1C1008'}] },
    shower:       { brand:'Waterworks / Mr Steam', product:'Custom frameless · Steam-ready · Designer hardware', swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Matte Black',hex:'#2C2C2C'}] },
    lighting:     { brand:'Kelly Wearstler / Apparatus', product:'Statement lighting · Custom spec · 2700K', swatches:[{name:'Polished Gold',hex:'#D4AF37'},{name:'Matte Black',hex:'#2C2C2C'},{name:'Nickel',hex:'#D4D4C0'}] },
    paint:        { brand:'Farrow & Ball Dead Flat', product:'Bespoke color consultation · Lacquer finish option', swatches:[{name:'Off-Black',hex:'#2C2C2C'},{name:'Pavilion Gray',hex:'#B4B0A8'},{name:'All White',hex:'#F5F5F0'}] },
    doors:        { brand:'Simpson Door / Custom', product:'Full custom profile · Solid wood · Any finish', swatches:[{name:'Natural Oak',hex:'#C4A882'},{name:'Lacquered White',hex:'#FAFAFA'},{name:'Ebony',hex:'#1C1008'}] },
  },
}

var ROOMS = [
  {
    id: 'main', label: 'Main Area', icon: '◻',
    categories: ['flooring','lighting','paint','doors'],
    catLabels:  { flooring:'Flooring', lighting:'Lighting', paint:'Paint colors', doors:'Interior doors' },
  },
  {
    id: 'bathroom', label: 'Bathroom', icon: '◧',
    categories: ['tile','fixtures','vanity','shower'],
    catLabels:  { tile:'Floor & wall tile', fixtures:'Fixtures & hardware', vanity:'Vanity', shower:'Shower enclosure' },
  },
  {
    id: 'bar', label: 'Bar Area', icon: '▭',
    categories: ['cabinets','countertops'],
    catLabels:  { cabinets:'Bar cabinets', countertops:'Bar countertop' },
  },
]

function fmt(n) { return '$' + Math.round(n).toLocaleString('en-US') }

export default function ClientSelections() {
  var { data: session } = useSession()
  var [activeTier, setActiveTier] = useState('better')
  var [picks,      setPicks]      = useState({})       // catId → swatchName
  var [confirmed,  setConfirmed]  = useState({})       // catId → swatchName
  var [expanded,   setExpanded]   = useState(null)     // 'roomId:catId'
  var [savedMsg,   setSavedMsg]   = useState('')

  var clientName = session ? session.user.name : 'Ryan and Dori Mendel'

  var allCats = ROOMS.flatMap(function(r){ return r.categories })
  var confirmedCount = allCats.filter(function(c){ return confirmed[c] }).length
  var pendingCount   = allCats.length - confirmedCount

  function pick(catId, swatchName) {
    setPicks(function(prev){ return Object.assign({}, prev, { [catId]: swatchName }) })
  }

  function confirmPick(catId) {
    if (!picks[catId]) return
    var newConfirmed = Object.assign({}, confirmed, { [catId]: picks[catId] })
    setConfirmed(newConfirmed)
    if (typeof window !== 'undefined') {
      var existing = {}
      try { existing = JSON.parse(localStorage.getItem('sb_selections') || '{}') } catch(e) {}
      var prod = PRODUCTS[activeTier][catId]
      var swatch = prod ? prod.swatches.find(function(s){ return s.name === picks[catId] }) : null
      existing[catId] = { value: picks[catId], tier: activeTier, brand: prod ? prod.brand : '', hex: swatch ? swatch.hex : '#ccc' }
      localStorage.setItem('sb_selections', JSON.stringify(existing))
    }
    setExpanded(null)
    setSavedMsg('Confirmed!')
    setTimeout(function(){ setSavedMsg('') }, 2500)
  }

  var ti = TIER_INFO[activeTier]

  return (
    <div style={{minHeight:'100vh',background:'#fff',fontFamily:'sans-serif'}}>

      {/* Topbar */}
      <div style={{background:'#002147',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #FF8C00'}}>
        <img src="/logo.png" alt="SpanglerBuilt" style={{height:32,width:'auto'}}/>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <span style={{fontSize:11,color:'rgba(255,255,255,.6)'}}>{clientName}</span>
          {session
            ? <button onClick={function(){signOut({callbackUrl:'/login'})}} style={{fontSize:11,color:'#FF8C00',background:'transparent',border:'1px solid #FF8C00',padding:'3px 10px',borderRadius:3,cursor:'pointer',fontFamily:'sans-serif'}}>Sign out</button>
            : <a href="/login" style={{fontSize:11,color:'#FF8C00',textDecoration:'none',border:'1px solid #FF8C00',padding:'3px 10px',borderRadius:3}}>Sign in</a>
          }
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'1.5rem'}}>

        {/* Header row */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1.25rem',flexWrap:'wrap',gap:8}}>
          <div>
            <a href="/client/dashboard" style={{fontSize:11,color:'#9a9690',textDecoration:'none'}}>← Dashboard</a>
            <div style={{fontFamily:'Georgia,serif',fontSize:20,color:'#002147',marginTop:4}}>Material selections</div>
            <div style={{fontSize:11,color:'#9a9690',marginTop:2}}>SB-2026-001 · Basement Renovation</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',marginTop:4}}>
            {savedMsg && <span style={{background:'#eaf3de',color:'#3B6D11',fontSize:11,padding:'4px 12px',borderRadius:3,fontWeight:500}}>✓ {savedMsg}</span>}
            <div style={{background:'#fff',border:'1px solid #e8e6e0',borderRadius:3,padding:'6px 14px',fontSize:11}}>
              <span style={{fontWeight:700,color:'#3B6D11'}}>{confirmedCount}</span>&nbsp;confirmed &nbsp;·&nbsp; <span style={{fontWeight:700,color:'#e65100'}}>{pendingCount}</span>&nbsp;pending
            </div>
          </div>
        </div>

        {/* Tier selector — 4 boxes */}
        <div style={{fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Your project tier</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:'1.5rem'}}>
          {Object.entries(TIER_INFO).map(function([key, t]) {
            var isActive = activeTier === key
            return (
              <div key={key} onClick={function(){setActiveTier(key)}}
                style={{background:isActive?t.bg:'#fff',border:isActive?'2px solid '+t.color:'1px solid #e8e6e0',borderRadius:4,padding:'12px 14px',cursor:'pointer',transition:'all .15s'}}>
                <div style={{fontSize:10,fontWeight:700,color:t.color,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{t.label}</div>
                <div style={{fontSize:17,fontWeight:500,color:'#002147',marginBottom:4}}>{fmt(t.price)}</div>
                <div style={{fontSize:10,color:'#9a9690',lineHeight:1.4}}>{t.desc}</div>
                {isActive && <div style={{marginTop:6,fontSize:9,fontWeight:700,color:t.color,textTransform:'uppercase',letterSpacing:'.08em'}}>✓ Active tier</div>}
              </div>
            )
          })}
        </div>

        {/* Active tier banner */}
        <div style={{background:ti.bg,border:'1px solid '+ti.color,borderRadius:4,padding:'10px 14px',marginBottom:'1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <div style={{fontSize:12,color:'#3d3b37'}}>
            Showing <strong style={{color:ti.color}}>{ti.label}</strong> tier selections — {fmt(ti.price)} total estimate.
            {pendingCount > 0 && <span style={{color:'#e65100'}}> {pendingCount} selection{pendingCount!==1?'s':''} still need your confirmation.</span>}
          </div>
          {pendingCount === 0 && (
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:11,fontWeight:700,color:'#3B6D11'}}>All selections confirmed ✓</span>
              <a href="/client/project-book" style={{background:'#3B6D11',color:'#fff',padding:'5px 14px',fontSize:10,fontWeight:700,textDecoration:'none',borderRadius:3,letterSpacing:'.06em',textTransform:'uppercase'}}>View project book →</a>
            </div>
          )}
        </div>

        {/* Rooms */}
        {ROOMS.map(function(room) {
          return (
            <div key={room.id} style={{marginBottom:'1.25rem'}}>
              <div style={{fontSize:10,fontWeight:500,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
                <span style={{color:'#002147'}}>{room.icon}</span> {room.label}
              </div>
              <div style={{display:'grid',gap:8}}>
                {room.categories.map(function(catId) {
                  var catLabel = room.catLabels[catId]
                  var prod     = PRODUCTS[activeTier][catId]
                  var isDone   = !!confirmed[catId]
                  var chosen   = picks[catId] || null
                  var expKey   = room.id + ':' + catId
                  var isExp    = expanded === expKey

                  return (
                    <div key={catId} style={{background:'#fff',border:isDone?'1px solid #c8dfc0':'1px solid #e8e6e0',borderRadius:4,overflow:'hidden',borderLeft:'4px solid '+(isDone?'#3B6D11':'#FF8C00')}}>

                      <div style={{padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={function(){setExpanded(isExp?null:expKey)}}>
                        {/* Swatch preview */}
                        <div style={{display:'flex',gap:4,flexShrink:0}}>
                          {prod.swatches.map(function(sw) {
                            var isPicked = (confirmed[catId]||chosen) === sw.name
                            return (
                              <div key={sw.name} style={{width:20,height:20,borderRadius:'50%',background:sw.hex,border:isPicked?'2px solid #FF8C00':'1px solid rgba(0,0,0,.12)',flexShrink:0}}/>
                            )
                          })}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,color:'#002147',marginBottom:2}}>{catLabel}</div>
                          <div style={{fontSize:11,color:'#9a9690'}}>{prod.brand}</div>
                          {(confirmed[catId]||chosen) && (
                            <div style={{fontSize:11,color:isDone?'#3B6D11':'#FF8C00',marginTop:2,fontWeight:500}}>
                              {isDone?'✓ ':''}{confirmed[catId]||chosen}
                            </div>
                          )}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                          <span style={{background:isDone?'#eaf3de':'#fff3e0',color:isDone?'#3B6D11':'#e65100',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:3,textTransform:'uppercase',letterSpacing:'.06em'}}>
                            {isDone?'Confirmed':'Pending'}
                          </span>
                          <span style={{fontSize:11,color:'#9a9690'}}>{isExp?'▲':'▼'}</span>
                        </div>
                      </div>

                      {isExp && (
                        <div style={{borderTop:'1px solid #f5f4f1',padding:'1rem 1.25rem'}}>
                          <div style={{fontSize:11,color:'#9a9690',marginBottom:12}}>{prod.product}</div>
                          <div style={{fontSize:10,color:'#9a9690',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Choose a color / finish</div>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:'1rem'}}>
                            {prod.swatches.map(function(sw) {
                              var isSel = chosen === sw.name
                              return (
                                <div key={sw.name} onClick={function(){pick(catId,sw.name)}}
                                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:'10px 14px',border:isSel?'2px solid #FF8C00':'1px solid #e8e6e0',borderRadius:4,cursor:'pointer',background:isSel?'#FFFCEB':'#fff',minWidth:100}}>
                                  <div style={{width:40,height:40,borderRadius:'50%',background:sw.hex,border:'1px solid rgba(0,0,0,.12)'}}/>
                                  <div style={{fontSize:11,fontWeight:isSel?600:400,color:'#002147',textAlign:'center',lineHeight:1.3}}>{sw.name}</div>
                                  {isSel && <div style={{width:10,height:10,borderRadius:'50%',background:'#FF8C00'}}/>}
                                </div>
                              )
                            })}
                          </div>
                          <div style={{display:'flex',gap:8}}>
                            <button onClick={function(){confirmPick(catId)}} disabled={!chosen}
                              style={{background:chosen?'#FF8C00':'#e8e6e0',color:chosen?'#fff':'#9a9690',border:'none',padding:'9px 24px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:chosen?'pointer':'default',borderRadius:3,fontFamily:'sans-serif'}}>
                              Confirm selection →
                            </button>
                            <button onClick={function(){setExpanded(null)}}
                              style={{background:'transparent',border:'1px solid #e8e6e0',color:'#9a9690',padding:'9px 14px',fontSize:11,cursor:'pointer',borderRadius:3,fontFamily:'sans-serif'}}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Footer */}
        <div style={{marginTop:'.5rem',background:'#002147',borderRadius:4,padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:8}}>
          <div>
            <div style={{fontSize:12,color:'rgba(255,255,255,.6)',marginBottom:2}}>Questions about material selections?</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.4)'}}>Michael can walk you through any option in person or by phone.</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <a href="tel:4044927650" style={{background:'#FF8C00',color:'#fff',padding:'8px 16px',fontSize:12,fontWeight:700,textDecoration:'none',borderRadius:3}}>(404) 492-7650</a>
            <a href="mailto:michael@spanglerbuilt.com" style={{background:'transparent',border:'1px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.7)',padding:'8px 16px',fontSize:12,textDecoration:'none',borderRadius:3}}>Email</a>
          </div>
        </div>

      </div>
    </div>
  )
}

export async function getServerSideProps() { return { props: {} } }
