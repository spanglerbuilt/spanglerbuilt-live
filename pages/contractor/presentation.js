var PRODUCTS = {
  good: {
    flooring: {
      category: 'Flooring',
      selected: 'LVP',
      options: ['LVP','Carpet','Tile'],
      detail: {
        brand: 'Shaw Floors — Resilient',
        product: 'Floorte Pro Series',
        color: 'Natural Biscuit',
        spec: '6mm · Waterproof · Click-lock',
        price: '$3.49/sf installed',
        link: 'https://www.shawfloors.com',
        swatches: [{name:'Natural Biscuit',hex:'#D4C4A8'},{name:'Gunstock',hex:'#8B6914'},{name:'Storm',hex:'#7A7A7A'}],
        photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      }
    },
    countertops: {
      category: 'Countertops',
      selected: 'Laminate',
      options: ['Laminate','Butcher Block','Tile'],
      detail: {
        brand: 'Wilsonart',
        product: 'HD Laminate',
        color: 'Calcutta Marble',
        spec: '1.5" post-form edge · Easy clean',
        price: '$28/sf installed',
        link: 'https://www.wilsonart.com',
        swatches: [{name:'Calcutta Marble',hex:'#F5F0E8'},{name:'Black Fusion',hex:'#2C2C2C'},{name:'Ash Elm',hex:'#B5956A'}],
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      }
    },
    cabinets: {
      category: 'Cabinets',
      selected: 'Stock',
      options: ['Stock','Pre-assembled','RTA'],
      detail: {
        brand: 'Hampton Bay (Home Depot)',
        product: 'Shaker Style — Stock',
        color: 'Unfinished / Ready to paint',
        spec: 'Plywood box · Soft-close hinges',
        price: 'Included in allowance',
        link: 'https://www.homedepot.com',
        swatches: [{name:'White',hex:'#FFFFFF'},{name:'Gray',hex:'#9A9A9A'},{name:'Navy',hex:'#002147'}],
        photo: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
      }
    },
    fixtures: {
      category: 'Fixtures & Hardware',
      selected: 'Brushed Nickel',
      options: ['Brushed Nickel','Chrome','Matte Black'],
      detail: {
        brand: 'Moen — Align Series',
        product: 'Single-handle faucet',
        color: 'Brushed Nickel',
        spec: 'Lifetime warranty · ADA compliant',
        price: 'Included in allowance',
        link: 'https://www.moen.com',
        swatches: [{name:'Brushed Nickel',hex:'#C0C0B0'},{name:'Chrome',hex:'#E8E8E8'},{name:'Matte Black',hex:'#2C2C2C'}],
        photo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&q=80',
      }
    },
    tile: {
      category: 'Tile',
      selected: 'Ceramic',
      options: ['Ceramic','Porcelain','Mosaic'],
      detail: {
        brand: 'Daltile',
        product: 'Restore — 12x24',
        color: 'Bright White',
        spec: '12x24 · Rectified · Frost resistant',
        price: '$4.99/sf installed',
        link: 'https://www.daltile.com',
        swatches: [{name:'Bright White',hex:'#F5F5F5'},{name:'Silver',hex:'#C0C0C0'},{name:'Almond',hex:'#EFDECD'}],
        photo: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      }
    },
  },
  better: {
    flooring: {
      category: 'Flooring',
      selected: 'Premium LVP',
      options: ['Premium LVP','Engineered','Porcelain'],
      detail: {
        brand: 'COREtec Plus',
        product: 'Enhanced XL Series',
        color: 'Vero Beach Oak',
        spec: '9" wide · 8mm · Cork underlayment',
        price: '$5.49/sf installed',
        link: 'https://www.coretecfloors.com',
        swatches: [{name:'Vero Beach Oak',hex:'#C4A882'},{name:'Driftwood',hex:'#9E8B6F'},{name:'Coastal Pine',hex:'#8B7355'}],
        photo: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
      }
    },
    countertops: {
      category: 'Countertops',
      selected: 'Quartz',
      options: ['Quartz','Granite','Quartzite'],
      detail: {
        brand: 'Silestone by Cosentino',
        product: 'Eternal Calacatta Gold',
        color: 'White with gold veining',
        spec: '3cm · Eased edge · NSF certified',
        price: '$65/sf installed',
        link: 'https://www.silestone.com',
        swatches: [{name:'Calacatta Gold',hex:'#F5F0E0'},{name:'Charcoal Soapstone',hex:'#4A4A4A'},{name:'White Storm',hex:'#F0F0F0'}],
        photo: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
      }
    },
    cabinets: {
      category: 'Cabinets',
      selected: 'Semi-custom',
      options: ['Semi-custom','Shaker','Flat-panel'],
      detail: {
        brand: 'KraftMaid',
        product: 'Dovetail Shaker',
        color: 'Dove White / Flagstone',
        spec: 'Dovetail drawers · Soft-close · Plywood',
        price: 'Included in allowance',
        link: 'https://www.kraftmaid.com',
        swatches: [{name:'Dove White',hex:'#F0EDE8'},{name:'Flagstone',hex:'#8B8070'},{name:'Espresso',hex:'#3C2415'}],
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      }
    },
    fixtures: {
      category: 'Fixtures & Hardware',
      selected: 'Matte Black',
      options: ['Matte Black','Satin Brass','Gunmetal'],
      detail: {
        brand: 'Delta — Trinsic Series',
        product: 'Pull-down kitchen faucet',
        color: 'Matte Black',
        spec: 'Touch2O technology · Magnetic docking',
        price: 'Included in allowance',
        link: 'https://www.deltafaucet.com',
        swatches: [{name:'Matte Black',hex:'#2C2C2C'},{name:'Satin Brass',hex:'#C8A84B'},{name:'Gunmetal',hex:'#5C5C5C'}],
        photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
      }
    },
    tile: {
      category: 'Tile',
      selected: 'Porcelain',
      options: ['Porcelain','Large format','Wood-look'],
      detail: {
        brand: 'MSI Surfaces',
        product: 'Carrara White — 24x24',
        color: 'Carrara White',
        spec: '24x24 · Polished · Rectified',
        price: '$8.99/sf installed',
        link: 'https://www.msisurfaces.com',
        swatches: [{name:'Carrara White',hex:'#F0EDE8'},{name:'Nero Marquina',hex:'#1A1A1A'},{name:'Crema Marfil',hex:'#E8D5B0'}],
        photo: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      }
    },
  },
  best: {
    flooring: {
      category: 'Flooring',
      selected: 'Engineered Hardwood',
      options: ['Engineered Hardwood','Wide Plank','Herringbone'],
      detail: {
        brand: 'Anderson Tuftex',
        product: 'Bernina Oak — 7" Wide Plank',
        color: 'Glacier',
        spec: '7" wide · 3/8" · Wire-brushed · CARB2',
        price: '$9.49/sf installed',
        link: 'https://www.andersontuftex.com',
        swatches: [{name:'Glacier',hex:'#E8E0D0'},{name:'Cognac',hex:'#8B4513'},{name:'Graphite',hex:'#5A5A5A'}],
        photo: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80',
      }
    },
    countertops: {
      category: 'Countertops',
      selected: 'Quartz',
      options: ['Quartz','Quartzite','Dekton'],
      detail: {
        brand: 'Cambria',
        product: 'Brittanicca Warm',
        color: 'Warm white with dramatic veining',
        spec: '3cm · Waterfall edge · NSF certified',
        price: '$95/sf installed',
        link: 'https://www.cambriausa.com',
        swatches: [{name:'Brittanicca Warm',hex:'#F5EDD8'},{name:'Blackpool',hex:'#2A2A2A'},{name:'Berwyn',hex:'#F0F0F0'}],
        photo: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
      }
    },
    cabinets: {
      category: 'Cabinets',
      selected: 'Semi-custom Inset',
      options: ['Inset','Full overlay','Beaded inset'],
      detail: {
        brand: 'Dura Supreme',
        product: 'Inset Shaker — Maple',
        color: 'Alabaster / Graphite',
        spec: 'Inset doors · Dovetail · Soft-close',
        price: 'Included in allowance',
        link: 'https://www.durasupreme.com',
        swatches: [{name:'Alabaster',hex:'#F0EDE0'},{name:'Graphite',hex:'#4A4A4A'},{name:'Sage',hex:'#7A8C6A'}],
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      }
    },
    fixtures: {
      category: 'Fixtures & Hardware',
      selected: 'Unlacquered Brass',
      options: ['Unlacquered Brass','Oil-rubbed Bronze','Polished Nickel'],
      detail: {
        brand: 'Brizo — Litze Series',
        product: 'Articulating kitchen faucet',
        color: 'Unlacquered Brass',
        spec: 'SmartTouch · DIAMOND seal · Lifetime',
        price: 'Included in allowance',
        link: 'https://www.brizo.com',
        swatches: [{name:'Unlacquered Brass',hex:'#C8A84B'},{name:'Oil-rubbed Bronze',hex:'#4A2E0A'},{name:'Polished Nickel',hex:'#D4D4C0'}],
        photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
      }
    },
    tile: {
      category: 'Tile',
      selected: 'Large Format Porcelain',
      options: ['Large Format','Book-matched','Stone-look'],
      detail: {
        brand: 'Porcelanosa',
        product: 'Marmol Calacatta — 32x32',
        color: 'Calacatta',
        spec: '32x32 · Polished · Rectified · Continuous veining',
        price: '$14.99/sf installed',
        link: 'https://www.porcelanosa-usa.com',
        swatches: [{name:'Calacatta',hex:'#F5F0E8'},{name:'Reno Noir',hex:'#1C1C1C'},{name:'Crema',hex:'#E8D5B0'}],
        photo: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      }
    },
  },
  luxury: {
    flooring: {
      category: 'Flooring',
      selected: 'Wide Plank Hardwood',
      options: ['Wide Plank Hardwood','Stone','Custom'],
      detail: {
        brand: 'Hakwood',
        product: 'European Oak — 9.5" Wide',
        color: 'Smoked Pearl',
        spec: '9.5" wide · 5/8" · Hand-scraped · Live sawn',
        price: '$18/sf installed',
        link: 'https://www.hakwood.com',
        swatches: [{name:'Smoked Pearl',hex:'#D4C8B0'},{name:'Ebony',hex:'#1C1008'},{name:'Ash',hex:'#E8E0D0'}],
        photo: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600&q=80',
      }
    },
    countertops: {
      category: 'Countertops',
      selected: 'Natural Stone',
      options: ['Marble','Quartzite','Onyx'],
      detail: {
        brand: 'Antolini Luigi',
        product: 'Calacatta Borghini Book-matched',
        color: 'White with dramatic gold veining',
        spec: '3cm · Waterfall · Leathered or polished',
        price: '$180+/sf installed',
        link: 'https://www.antolini.com',
        swatches: [{name:'Calacatta Borghini',hex:'#F5EDD8'},{name:'Black Marquina',hex:'#1A1A1A'},{name:'Verde Guatemala',hex:'#2D5A3D'}],
        photo: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
      }
    },
    cabinets: {
      category: 'Cabinets',
      selected: 'Full Custom',
      options: ['Full Custom','Lacquered','Cerused Oak'],
      detail: {
        brand: 'Plain and Fancy Cabinetry',
        product: 'Full custom — any style',
        color: 'Bespoke finish — client specified',
        spec: 'Full custom · Any wood · Any finish · Any hardware',
        price: 'Per quote — included in allowance',
        link: 'https://www.plainfancycabinetry.com',
        swatches: [{name:'Lacquered White',hex:'#FAFAFA'},{name:'Cerused Oak',hex:'#C8B89A'},{name:'Charcoal',hex:'#3C3C3C'}],
        photo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
      }
    },
    fixtures: {
      category: 'Fixtures & Hardware',
      selected: 'Polished Gold',
      options: ['Polished Gold','Vintage Nickel','Custom'],
      detail: {
        brand: 'Waterworks',
        product: 'Custom faucet collection',
        color: 'Polished Gold / Unlacquered Brass',
        spec: 'Handcrafted · Ceramic disc · Lifetime',
        price: 'Per quote — included in allowance',
        link: 'https://www.waterworks.com',
        swatches: [{name:'Polished Gold',hex:'#D4AF37'},{name:'Vintage Nickel',hex:'#B8B8A0'},{name:'Matte White',hex:'#F0F0F0'}],
        photo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
      }
    },
    tile: {
      category: 'Tile',
      selected: 'Natural Stone',
      options: ['Natural Marble','Travertine','Onyx'],
      detail: {
        brand: 'Ann Sacks',
        product: 'Bianco Dolomite — Honed',
        color: 'White with soft grey veining',
        spec: '24x48 · Honed · Book-matched slabs',
        price: '$28+/sf installed',
        link: 'https://www.annsacks.com',
        swatches: [{name:'Bianco Dolomite',hex:'#F0EDE8'},{name:'Calacatta',hex:'#F5F0E0'},{name:'Black Slate',hex:'#2C2C2C'}],
        photo: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=80',
      }
    },
  },
}

var TIER_INFO = {
  good:   {label:'Good',    price:53000, color:'#3B6D11', mult:'1.0x'},
  better: {label:'Better',  price:62500, color:'#185FA5', mult:'1.18x'},
  best:   {label:'Best',    price:73000, color:'#534AB7', mult:'1.38x'},
  luxury: {label:'Luxury',  price:87500, color:'#854F0B', mult:'1.65x'},
}

var TIER_ORDER = ['good','better','best','luxury']
var CAT_ORDER  = ['flooring','countertops','cabinets','fixtures','tile']

function fmt(n){ return '$'+Math.round(n).toLocaleString('en-US') }

export default function Presentation() {
  var [tierKey, setTierKey] = useState('good')
  var [catKey,  setCatKey]  = useState('flooring')
  var [optIdx,  setOptIdx]  = useState(0)

  var tier   = TIER_INFO[tierKey]
  var prods  = PRODUCTS[tierKey]
  var prod   = prods[catKey]
  var detail = prod.detail

  function nextTier() {
    var i = TIER_ORDER.indexOf(tierKey)
    if (i < TIER_ORDER.length-1) { setTierKey(TIER_ORDER[i+1]); setOptIdx(0) }
  }
  function prevTier() {
    var i = TIER_ORDER.indexOf(tierKey)
    if (i > 0) { setTierKey(TIER_ORDER[i-1]); setOptIdx(0) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#002147',fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
      <div style={{background:'rgba(0,0,0,.4)',padding:'.75rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="SpanglerBuilt" style={{height:30,width:'auto'}}/>
          <span style={{fontSize:11,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase'}}>Material Selections Presentation</span>
        </div>
        <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.4)',textDecoration:'none'}}>Back to dashboard</a>
      </div>
      <div style={{display:'flex',gap:6,justifyContent:'center',padding:'.75rem',flexShrink:0}}>
        {TIER_ORDER.map(function(t){
          var ti = TIER_INFO[t]
          return (
            <button key={t} onClick={function(){setTierKey(t);setOptIdx(0)}} style={{padding:'6px 18px',fontSize:12,fontWeight:700,border:'2px solid '+(t===tierKey?ti.color:'rgba(255,255,255,.2)'),background:t===tierKey?ti.color:'transparent',color:t===tierKey?'#fff':'rgba(255,255,255,.5)',cursor:'pointer',borderRadius:20,fontFamily:'sans-serif',letterSpacing:'.06em',textTransform:'uppercase'}}>
              {ti.label} · {fmt(ti.price)}
            </button>
          )
        })}
      </div>
      <div style={{display:'flex',gap:4,justifyContent:'center',padding:'0 1rem .75rem',flexShrink:0,flexWrap:'wrap'}}>
        {CAT_ORDER.map(function(c){
          var p = prods[c]
          return (
            <button key={c} onClick={function(){setCatKey(c);setOptIdx(0)}} style={{padding:'5px 14px',fontSize:11,fontWeight:500,border:'1px solid '+(c===catKey?'#FF8C00':'rgba(255,255,255,.15)'),background:c===catKey?'#FF8C00':'transparent',color:c===catKey?'#fff':'rgba(255,255,255,.5)',cursor:'pointer',borderRadius:3,fontFamily:'sans-serif',letterSpacing:'.04em',textTransform:'uppercase'}}>
              {p.category}
            </button>
          )
        })}
      </div>
      <div style={{flex:1,display:'flex',gap:0,maxWidth:1100,margin:'0 auto',width:'100%',padding:'0 1.5rem 1.5rem'}}>
        <div style={{flex:'0 0 45%',marginRight:'1.5rem'}}>
          <div style={{borderRadius:8,overflow:'hidden',height:280,background:'#001530',position:'relative'}}>
            <img src={detail.photo} alt={detail.product} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.9}} onError={function(e){e.target.style.display='none'}}/>
            <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,.7))',padding:'1rem'}}>
              <div style={{fontSize:13,fontWeight:700,color:'#fff'}}>{detail.product}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.7)'}}>{detail.brand}</div>
            </div>
          </div>
          <div style={{marginTop:12}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Available finishes</div>
            <div style={{display:'flex',gap:8}}>
              {detail.swatches.map(function(sw,i){return(
                <div key={i} style={{textAlign:'center',cursor:'pointer'}}>
                  <div style={{width:44,height:44,borderRadius:4,background:sw.hex,border:i===0?'2px solid #FF8C00':'2px solid rgba(255,255,255,.2)',marginBottom:4}}/>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.5)',maxWidth:44,lineHeight:1.3}}>{sw.name}</div>
                </div>
              )})}
            </div>
          </div>
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{prod.category}</div>
            <div style={{fontSize:22,fontWeight:600,color:'#fff',marginBottom:2}}>{detail.product}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>{detail.brand}</div>
          </div>
          <div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Material type</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {prod.options.map(function(opt,i){return(
                <button key={i} onClick={function(){setOptIdx(i)}} style={{padding:'8px 16px',fontSize:12,fontWeight:500,border:'2px solid '+(i===optIdx?'#FF8C00':'rgba(255,255,255,.2)'),background:i===optIdx?'rgba(255,140,0,.15)':'transparent',color:i===optIdx?'#FF8C00':'rgba(255,255,255,.6)',cursor:'pointer',borderRadius:4,fontFamily:'sans-serif'}}>
                  {opt}
                </button>
              )})}
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,.06)',borderRadius:6,padding:'1rem',border:'1px solid rgba(255,255,255,.1)'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[['Selected color',detail.color],['Specification',detail.spec],['Pricing',detail.price],['Tier',tier.label+' ('+tier.mult+')']].map(function(item){return(
                <div key={item[0]}>
                  <div style={{fontSize:9,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>{item[0]}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.85)',lineHeight:1.5}}>{item[1]}</div>
                </div>
              )})}
            </div>
          </div>
          <a href={detail.link} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:8,background:'transparent',border:'1px solid rgba(255,255,255,.2)',color:'rgba(255,255,255,.6)',padding:'8px 14px',borderRadius:4,textDecoration:'none',fontSize:11,fontWeight:500,width:'fit-content'}}>
            View at manufacturer website
          </a>
          <div style={{marginTop:'auto',background:'rgba(255,140,0,.1)',border:'1px solid rgba(255,140,0,.3)',borderRadius:6,padding:'10px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{tier.label} tier — total project</div>
              <div style={{fontSize:22,color:'#FF8C00',fontWeight:600}}>{fmt(tier.price)}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={prevTier} disabled={TIER_ORDER.indexOf(tierKey)===0} style={{background:'transparent',border:'1px solid rgba(255,255,255,.2)',color:TIER_ORDER.indexOf(tierKey)===0?'rgba(255,255,255,.2)':'rgba(255,255,255,.7)',padding:'7px 14px',fontSize:11,cursor:TIER_ORDER.indexOf(tierKey)===0?'default':'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Previous tier</button>
              <button onClick={nextTier} disabled={TIER_ORDER.indexOf(tierKey)===TIER_ORDER.length-1} style={{background:TIER_ORDER.indexOf(tierKey)===TIER_ORDER.length-1?'transparent':'#FF8C00',border:'1px solid '+(TIER_ORDER.indexOf(tierKey)===TIER_ORDER.length-1?'rgba(255,255,255,.2)':'#FF8C00'),color:TIER_ORDER.indexOf(tierKey)===TIER_ORDER.length-1?'rgba(255,255,255,.2)':'#fff',padding:'7px 14px',fontSize:11,cursor:TIER_ORDER.indexOf(tierKey)===TIER_ORDER.length-1?'default':'pointer',borderRadius:3,fontFamily:'sans-serif'}}>Next tier</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
