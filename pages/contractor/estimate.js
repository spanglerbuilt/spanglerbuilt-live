import Layout from '../../components/Layout'
import { useState } from 'react'

// ─── Tier multipliers ───────────────────────────────────────────────────────
const TIER_MULT   = { good: 1.0, better: 1.18, best: 1.38, luxury: 1.65 }
const TIER_LABELS = { good: 'Good', better: 'Better', best: 'Best', luxury: 'Luxury' }

// ─── CSI Divisions ──────────────────────────────────────────────────────────
const INIT_DIVISIONS = [
  { num: '01', name: 'General requirements', items: [
    { id:'d01-1', desc: 'Project management & supervision',    qty: 1,   unit: 'LS', rate: 3200 },
    { id:'d01-2', desc: 'Building permit',                     qty: 1,   unit: 'LS', rate: 1850 },
    { id:'d01-3', desc: 'Temporary facilities & site protection', qty: 1, unit: 'LS', rate: 650 },
    { id:'d01-4', desc: 'Dumpster / waste removal (2 pulls)',  qty: 2,   unit: 'EA', rate: 525 },
    { id:'d01-5', desc: 'Final cleaning & punch list',         qty: 1,   unit: 'LS', rate: 475 },
  ]},
  { num: '02', name: 'Existing conditions', items: [
    { id:'d02-1', desc: 'Selective demo — existing framing/drywall', qty: 665, unit: 'SF', rate: 1.85 },
    { id:'d02-2', desc: 'Concrete floor prep & grinding',      qty: 665, unit: 'SF', rate: 1.25 },
    { id:'d02-3', desc: 'Moisture testing & vapor barrier',    qty: 665, unit: 'SF', rate: 0.95 },
    { id:'d02-4', desc: 'Egress window assessment',            qty: 1,   unit: 'LS', rate: 350 },
    { id:'d02-5', desc: 'Haul-off & disposal',                 qty: 1,   unit: 'LS', rate: 750 },
  ]},
  { num: '03', name: 'Concrete', items: [
    { id:'d03-1', desc: 'Concrete crack repair & patching',    qty: 1,   unit: 'LS', rate: 850 },
    { id:'d03-2', desc: 'Floor leveling compound',             qty: 665, unit: 'SF', rate: 1.75 },
    { id:'d03-3', desc: 'Bathroom rough-in saw cut & patch',   qty: 1,   unit: 'LS', rate: 1200 },
  ]},
  { num: '04', name: 'Masonry', items: [
    { id:'d04-1', desc: 'Masonry wall waterproofing seal',     qty: 1,   unit: 'LS', rate: 1100 },
    { id:'d04-2', desc: 'CMU block repair / tuckpointing',     qty: 1,   unit: 'LS', rate: 650,  allowance: true },
  ]},
  { num: '05', name: 'Metals', items: [
    { id:'d05-1', desc: 'Steel lally column wrap',             qty: 2,   unit: 'EA', rate: 425 },
    { id:'d05-2', desc: 'Metal stair stringers',               qty: 1,   unit: 'LS', rate: 600,  allowance: true },
  ]},
  { num: '06', name: 'Wood & plastics', items: [
    { id:'d06-1', desc: 'Pressure-treated bottom plate',       qty: 200, unit: 'LF', rate: 3.25 },
    { id:'d06-2', desc: 'Stud framing — perimeter & interior', qty: 665, unit: 'SF', rate: 4.50 },
    { id:'d06-3', desc: 'Soffit & beam box framing',           qty: 1,   unit: 'LS', rate: 1250 },
    { id:'d06-4', desc: 'Custom bar framing & rough carpentry',qty: 1,   unit: 'LS', rate: 2200 },
    { id:'d06-5', desc: 'Bathroom backing & blocking',         qty: 1,   unit: 'LS', rate: 450 },
    { id:'d06-6', desc: 'Stair handrail & guardrail',          qty: 1,   unit: 'LS', rate: 1100 },
  ]},
  { num: '07', name: 'Thermal & moisture', items: [
    { id:'d07-1', desc: 'Closed-cell spray foam — rim joists', qty: 120, unit: 'LF', rate: 8.50 },
    { id:'d07-2', desc: 'Rigid foam insulation — perimeter walls', qty: 665, unit: 'SF', rate: 2.25 },
    { id:'d07-3', desc: 'Batt insulation — interior partitions', qty: 400, unit: 'SF', rate: 1.65 },
    { id:'d07-4', desc: 'Bathroom waterproofing membrane',     qty: 85,  unit: 'SF', rate: 6.50 },
  ]},
  { num: '08', name: 'Openings', items: [
    { id:'d08-1', desc: 'Prehung interior door — hollow core', qty: 3,   unit: 'EA', rate: 385 },
    { id:'d08-2', desc: 'Prehung bathroom door w/ privacy hardware', qty: 1, unit: 'EA', rate: 425 },
    { id:'d08-3', desc: 'Barn door / bypass — bar room',       qty: 1,   unit: 'EA', rate: 650,  allowance: true },
    { id:'d08-4', desc: 'Door hardware — passage & privacy sets', qty: 4, unit: 'EA', rate: 95 },
    { id:'d08-5', desc: 'Egress window',                       qty: 1,   unit: 'EA', rate: 2200, allowance: true },
  ]},
  { num: '09', name: 'Finishes', items: [
    { id:'d09-1', desc: 'LVP flooring — main areas',           qty: 600, unit: 'SF', rate: 6.25, allowance: true },
    { id:'d09-2', desc: 'LVP installation labor',              qty: 600, unit: 'SF', rate: 2.75 },
    { id:'d09-3', desc: 'Tile flooring — bathroom',            qty: 65,  unit: 'SF', rate: 8.50, allowance: true },
    { id:'d09-4', desc: 'Tile installation labor — bathroom',  qty: 65,  unit: 'SF', rate: 7.00 },
    { id:'d09-5', desc: 'Shower tile — walls',                 qty: 120, unit: 'SF', rate: 9.00, allowance: true },
    { id:'d09-6', desc: 'Shower tile installation labor',      qty: 120, unit: 'SF', rate: 9.50 },
    { id:'d09-7', desc: 'Drywall — hang & finish (level 4)',   qty: 665, unit: 'SF', rate: 4.75 },
    { id:'d09-8', desc: 'Moisture-resistant drywall — bathroom', qty: 150, unit: 'SF', rate: 5.50 },
    { id:'d09-9', desc: 'Ceiling drywall — hang & finish',     qty: 665, unit: 'SF', rate: 3.85 },
    { id:'d09-10',desc: 'Paint — walls, ceilings, trim (2 coats)', qty: 665, unit: 'SF', rate: 2.50 },
    { id:'d09-11',desc: 'Bathroom paint',                      qty: 1,   unit: 'LS', rate: 450 },
    { id:'d09-12',desc: 'Schluter / trim strips & transitions', qty: 1,  unit: 'LS', rate: 325 },
  ]},
  { num: '10', name: 'Specialties', items: [
    { id:'d10-1', desc: 'Bath accessories',                    qty: 1,   unit: 'LS', rate: 425,  allowance: true },
    { id:'d10-2', desc: 'Shower niche',                        qty: 1,   unit: 'EA', rate: 350 },
    { id:'d10-3', desc: 'Medicine cabinet',                    qty: 1,   unit: 'EA', rate: 275,  allowance: true },
  ]},
  { num: '11', name: 'Equipment', items: [
    { id:'d11-1', desc: 'Bar sink rough-in & fixture',         qty: 1,   unit: 'LS', rate: 485,  allowance: true },
    { id:'d11-2', desc: 'Wet bar refrigerator rough-in',       qty: 1,   unit: 'LS', rate: 225 },
  ]},
  { num: '12', name: 'Furnishings', items: [
    { id:'d12-1', desc: 'Bar base cabinets — 3 ea',            qty: 3,   unit: 'EA', rate: 400,  allowance: true },
    { id:'d12-2', desc: 'Bar upper cabinets — 3 ea',           qty: 3,   unit: 'EA', rate: 400,  allowance: true },
    { id:'d12-3', desc: 'Bar countertop — solid surface',      qty: 1,   unit: 'LS', rate: 1850, allowance: true },
    { id:'d12-4', desc: 'Vanity cabinet & top',                qty: 1,   unit: 'LS', rate: 875,  allowance: true },
  ]},
  { num: '14', name: 'Conveying equipment', items: [
    { id:'d14-1', desc: 'Stair nosing & landing strip',        qty: 1,   unit: 'LS', rate: 285 },
  ]},
  { num: '15', name: 'Mechanical', items: [
    { id:'d15-1', desc: 'Bathroom plumbing rough-in (DWV)',    qty: 1,   unit: 'LS', rate: 2200 },
    { id:'d15-2', desc: 'Plumbing fixtures — toilet, vanity, shower', qty: 1, unit: 'LS', rate: 1850, allowance: true },
    { id:'d15-3', desc: 'HVAC extension — ductwork & 2 registers', qty: 1, unit: 'LS', rate: 1650 },
    { id:'d15-4', desc: 'Exhaust fan — bathroom',              qty: 1,   unit: 'EA', rate: 385 },
    { id:'d15-5', desc: 'Bar sink plumbing rough-in',          qty: 1,   unit: 'LS', rate: 850 },
    { id:'d15-6', desc: 'Laundry hookup / utility rough-in',   qty: 1,   unit: 'LS', rate: 550 },
  ]},
  { num: '16', name: 'Electrical', items: [
    { id:'d16-1', desc: 'Panel capacity review & circuit additions', qty: 1, unit: 'LS', rate: 850 },
    { id:'d16-2', desc: 'LED recessed lights — 4" (20 fixtures)', qty: 20, unit: 'EA', rate: 95 },
    { id:'d16-3', desc: 'Dimmer switches',                     qty: 4,   unit: 'EA', rate: 65 },
    { id:'d16-4', desc: 'Electrical outlets — 15 amp',         qty: 12,  unit: 'EA', rate: 85 },
    { id:'d16-5', desc: 'GFCI outlets (wet areas)',            qty: 6,   unit: 'EA', rate: 95 },
    { id:'d16-6', desc: 'Bathroom vanity light rough-in',      qty: 1,   unit: 'LS', rate: 185 },
    { id:'d16-7', desc: 'Bar area under-cabinet lighting',     qty: 1,   unit: 'LS', rate: 425 },
    { id:'d16-8', desc: 'Smoke & CO detectors',                qty: 2,   unit: 'EA', rate: 125 },
    { id:'d16-9', desc: 'Electrical panel schedule update',    qty: 1,   unit: 'LS', rate: 275 },
  ]},
]

// ─── Material catalog ────────────────────────────────────────────────────────
const CATALOG = [
  // ── Flooring ──
  { id:'c01', div:'09', cat:'Flooring', types:['basement','kitchen','addition','bath'],
    desc:'Shaw Floorté Pro LVP', brand:'Shaw Floors', spec:'6mm · Waterproof · Click-lock', qty:600, unit:'SF', rate:6.25, allowance:true,
    link:'https://www.shawfloors.com' },
  { id:'c02', div:'09', cat:'Flooring', types:['basement','kitchen','addition'],
    desc:'COREtec Plus Enhanced LVP', brand:'COREtec', spec:'9" wide · 8mm · Cork underlay', qty:600, unit:'SF', rate:7.85, allowance:true,
    link:'https://www.coretecfloors.com' },
  { id:'c03', div:'09', cat:'Flooring', types:['kitchen','addition'],
    desc:'Anderson Tuftex Bernina Oak', brand:'Anderson Tuftex', spec:'Engineered hardwood · 7" wide', qty:400, unit:'SF', rate:9.49, allowance:true,
    link:'https://www.andersontuftex.com' },
  { id:'c04', div:'09', cat:'Flooring', types:['basement','kitchen','bath'],
    desc:'LVP installation labor', brand:'In-house', spec:'Click-lock · Glue-down option', qty:600, unit:'SF', rate:2.75,
    link:null },
  { id:'c05', div:'09', cat:'Flooring', types:['kitchen','addition','bath'],
    desc:'Hardwood installation labor', brand:'In-house', spec:'Nail-down or float', qty:400, unit:'SF', rate:4.25,
    link:null },
  // ── Tile ──
  { id:'c06', div:'09', cat:'Tile', types:['basement','bath'],
    desc:'Daltile Restore 12×24 ceramic', brand:'Daltile', spec:'Rectified · Frost resistant', qty:65, unit:'SF', rate:4.99, allowance:true,
    link:'https://www.daltile.com' },
  { id:'c07', div:'09', cat:'Tile', types:['basement','bath','kitchen'],
    desc:'MSI Carrara White 24×24', brand:'MSI Surfaces', spec:'Porcelain · Polished · Rectified', qty:65, unit:'SF', rate:8.99, allowance:true,
    link:'https://www.msisurfaces.com' },
  { id:'c08', div:'09', cat:'Tile', types:['bath','basement'],
    desc:'Tile installation labor — floor', brand:'In-house', spec:'Thinset · Grout · Sealed', qty:65, unit:'SF', rate:7.00,
    link:null },
  { id:'c09', div:'09', cat:'Tile', types:['bath','basement'],
    desc:'Shower wall tile installation labor', brand:'In-house', spec:'Large format capable', qty:120, unit:'SF', rate:9.50,
    link:null },
  { id:'c10', div:'07', cat:'Tile', types:['bath','basement'],
    desc:'Schluter Kerdi waterproofing membrane', brand:'Schluter Systems', spec:'Sheet membrane · Full coverage', qty:85, unit:'SF', rate:6.50,
    link:'https://www.schluter.com' },
  // ── Cabinets & countertops ──
  { id:'c11', div:'12', cat:'Cabinets', types:['kitchen','basement'],
    desc:'Hampton Bay shaker stock — base', brand:'Hampton Bay (Home Depot)', spec:'Plywood box · Soft-close hinges', qty:3, unit:'EA', rate:400, allowance:true,
    link:'https://www.homedepot.com' },
  { id:'c12', div:'12', cat:'Cabinets', types:['kitchen','basement'],
    desc:'KraftMaid dovetail shaker — semi-custom', brand:'KraftMaid', spec:'Dovetail drawers · Soft-close', qty:1, unit:'LS', rate:4200, allowance:true,
    link:'https://www.kraftmaid.com' },
  { id:'c13', div:'12', cat:'Cabinets', types:['kitchen'],
    desc:'Dura Supreme inset shaker — best', brand:'Dura Supreme', spec:'Inset doors · Soft-close · Any finish', qty:1, unit:'LS', rate:7800, allowance:true,
    link:'https://www.durasupreme.com' },
  { id:'c14', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Wilsonart HD laminate', brand:'Wilsonart', spec:'1.5" post-form · Easy clean', qty:30, unit:'SF', rate:28, allowance:true,
    link:'https://www.wilsonart.com' },
  { id:'c15', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Silestone quartz — Eternal Calacatta', brand:'Silestone by Cosentino', spec:'3cm · Eased edge · NSF certified', qty:30, unit:'SF', rate:65, allowance:true,
    link:'https://www.silestone.com' },
  { id:'c16', div:'12', cat:'Countertops', types:['kitchen','basement'],
    desc:'Cambria Brittanicca Warm quartz', brand:'Cambria', spec:'3cm · Waterfall edge option', qty:30, unit:'SF', rate:95, allowance:true,
    link:'https://www.cambriausa.com' },
  // ── Plumbing fixtures ──
  { id:'c17', div:'15', cat:'Plumbing', types:['bath','basement','kitchen'],
    desc:'Moen Align faucet — brushed nickel', brand:'Moen', spec:'Lifetime warranty · ADA compliant', qty:1, unit:'EA', rate:245, allowance:true,
    link:'https://www.moen.com' },
  { id:'c18', div:'15', cat:'Plumbing', types:['bath','basement'],
    desc:'Delta Trinsic faucet — matte black', brand:'Delta', spec:'Touch2O · Magnetic docking', qty:1, unit:'EA', rate:385, allowance:true,
    link:'https://www.deltafaucet.com' },
  { id:'c19', div:'15', cat:'Plumbing', types:['bath'],
    desc:'Toilet — Kohler Cimarron elongated', brand:'Kohler', spec:'1.28 gpf · Right-height · ADA', qty:1, unit:'EA', rate:285, allowance:true,
    link:'https://www.us.kohler.com' },
  { id:'c20', div:'15', cat:'Plumbing', types:['bath','basement'],
    desc:'Shower valve — Moen Posi-Temp', brand:'Moen', spec:'Pressure-balance · Lifetime', qty:1, unit:'EA', rate:225, allowance:true,
    link:'https://www.moen.com' },
  { id:'c21', div:'15', cat:'Plumbing', types:['bath'],
    desc:'Bathtub — Kohler freestanding soaker', brand:'Kohler', spec:'67" cast iron · Floor mount', qty:1, unit:'EA', rate:1850, allowance:true,
    link:'https://www.us.kohler.com' },
  // ── Lighting ──
  { id:'c22', div:'16', cat:'Lighting', types:['basement','kitchen','bath','addition'],
    desc:'Halo 6" LED recessed (per fixture)', brand:'Halo', spec:'2700K · Dimmable · Airtight', qty:1, unit:'EA', rate:95,
    link:'https://www.acuitybrands.com' },
  { id:'c23', div:'16', cat:'Lighting', types:['kitchen','bath'],
    desc:'Pendant light rough-in (per fixture)', brand:'In-house', spec:'Canopy, wire, j-box', qty:1, unit:'EA', rate:145,
    link:null },
  { id:'c24', div:'16', cat:'Lighting', types:['kitchen','basement'],
    desc:'Under-cabinet LED strip lighting', brand:'In-house', spec:'Low-voltage · Dimmer included', qty:1, unit:'LS', rate:425,
    link:null },
  // ── Drywall ──
  { id:'c25', div:'09', cat:'Drywall', types:['basement','kitchen','bath','addition'],
    desc:'Drywall hang & finish (level 4)', brand:'In-house', spec:'Blueboard · Level 4 taping', qty:665, unit:'SF', rate:4.75,
    link:null },
  { id:'c26', div:'09', cat:'Drywall', types:['bath','basement'],
    desc:'Moisture-resistant drywall', brand:'Georgia-Pacific DensArmor', spec:'Mold/moisture resistant', qty:150, unit:'SF', rate:5.50,
    link:null },
  // ── Paint ──
  { id:'c27', div:'09', cat:'Paint', types:['basement','kitchen','bath','addition'],
    desc:'Sherwin-Williams Emerald — interior', brand:'Sherwin-Williams', spec:'2 coats · Low VOC · Excellent hide', qty:665, unit:'SF', rate:2.50,
    link:'https://www.sherwin-williams.com' },
  { id:'c28', div:'09', cat:'Paint', types:['bath'],
    desc:'Bathroom paint — full room', brand:'Sherwin-Williams', spec:'Moisture-resistant formula', qty:1, unit:'LS', rate:450,
    link:'https://www.sherwin-williams.com' },
  // ── Insulation ──
  { id:'c29', div:'07', cat:'Insulation', types:['basement','addition'],
    desc:'Closed-cell spray foam — rim joists', brand:'Demilec / Icynene', spec:'2" min · R-13 per inch', qty:120, unit:'LF', rate:8.50,
    link:null },
  { id:'c30', div:'07', cat:'Insulation', types:['basement','addition'],
    desc:'Rigid foam board — perimeter walls', brand:'Owens Corning FOAMULAR', spec:'R-10 · Continuous coverage', qty:665, unit:'SF', rate:2.25,
    link:'https://www.owenscorning.com' },
  // ── Vanity / Bath ──
  { id:'c31', div:'12', cat:'Vanity', types:['bath','basement'],
    desc:'Glacier Bay 30" vanity w/ mirror', brand:'Glacier Bay (Home Depot)', spec:'Soft-close door · Integrated top', qty:1, unit:'EA', rate:875, allowance:true,
    link:'https://www.homedepot.com' },
  { id:'c32', div:'12', cat:'Vanity', types:['bath'],
    desc:'Style Selections 36" double vanity', brand:'Style Selections (Lowes)', spec:'Quartz top · Soft-close', qty:1, unit:'EA', rate:1450, allowance:true,
    link:'https://www.lowes.com' },
  // ── Shower enclosure ──
  { id:'c33', div:'08', cat:'Shower', types:['bath','basement'],
    desc:'DreamLine Flex semi-frameless shower door', brand:'DreamLine', spec:'Semi-frameless · 3/8" glass', qty:1, unit:'EA', rate:850, allowance:true,
    link:'https://www.dreamline.com' },
  { id:'c34', div:'08', cat:'Shower', types:['bath'],
    desc:'DreamLine Enigma-X frameless door', brand:'DreamLine', spec:'Full frameless · 3/8" glass · Brushed nickel', qty:1, unit:'EA', rate:1250, allowance:true,
    link:'https://www.dreamline.com' },
  // ── Kitchen appliances ──
  { id:'c35', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Range hood — 30" under-cabinet', brand:'Broan', spec:'400 CFM · 3-speed · LED', qty:1, unit:'EA', rate:425, allowance:true,
    link:'https://www.broan-nutone.com' },
  { id:'c36', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Dishwasher rough-in & supply', brand:'In-house', spec:'240V circuit · water supply + drain', qty:1, unit:'LS', rate:385,
    link:null },
  { id:'c37', div:'11', cat:'Appliances', types:['kitchen'],
    desc:'Gas line rough-in — range', brand:'In-house', spec:'3/4" black iron · Tested', qty:1, unit:'LS', rate:650,
    link:null },
]

const CAT_ORDER = ['Flooring','Tile','Drywall','Paint','Cabinets','Countertops','Vanity','Shower','Plumbing','Lighting','Insulation','Appliances']
const PROJECT_TYPES = ['all','basement','kitchen','bath','addition']
const TYPE_LABELS   = { all:'All types', basement:'Basement', kitchen:'Kitchen', bath:'Bathroom', addition:'Addition' }

function fmt(n)  { return '$' + Math.round(parseFloat(n) || 0).toLocaleString('en-US') }
function fmtD(n) { return '$' + (parseFloat(n) || 0).toFixed(2) }

function divSubtotal(div) {
  return div.items.reduce(function(s,i){ return s + i.qty * i.rate }, 0)
}

function calcTotals(divisions, tier) {
  var direct = divisions.reduce(function(s,d){ return s + divSubtotal(d) }, 0)
  var mult   = TIER_MULT[tier]
  var tiered = direct * mult
  var cont   = tiered * 0.05
  var op     = (tiered + cont) * 0.10
  var tax    = (tiered + cont + op) * 0.08
  return { direct, tiered, cont, op, tax, grand: tiered + cont + op + tax }
}

const TIER_STYLES = {
  good:   { borderColor:'#3B6D11', background:'#eaf3de', color:'#3B6D11' },
  better: { borderColor:'#185FA5', background:'#e6f1fb', color:'#185FA5' },
  best:   { borderColor:'#534AB7', background:'#eeedfe', color:'#534AB7' },
  luxury: { borderColor:'#854F0B', background:'#faeeda', color:'#854F0B' },
}

const PAYMENTS = [
  { label:'Deposit — contract signing',       pct:25 },
  { label:'Demo & framing complete',           pct:25 },
  { label:'Drywall & rough-ins complete',      pct:25 },
  { label:'Paint, flooring & trim complete',   pct:20 },
  { label:'Final punch list & CO',             pct:5  },
]

export default function EstimatePage() {
  var [tier,       setTier]       = useState('good')
  var [openDivs,   setOpenDivs]   = useState({})
  var [divisions,  setDivisions]  = useState(INIT_DIVISIONS)
  var [catSearch,  setCatSearch]  = useState('')
  var [catType,    setCatType]    = useState('all')
  var [catExpand,  setCatExpand]  = useState({})   // category name → expanded
  var [added,        setAdded]        = useState({})   // catalogId → true (visual indicator)
  var [excludedDivs, setExcludedDivs] = useState({})   // divNum → true (division turned off)
  var [excludedItems,setExcludedItems]= useState({})   // itemId → true (item turned off)
  var [savedMsg,     setSavedMsg]     = useState('')

  // Only count active divisions/items in totals
  var activeDivisions = divisions
    .filter(function(d){ return !excludedDivs[d.num] })
    .map(function(d){
      return Object.assign({}, d, {
        items: d.items.filter(function(i){ return !excludedItems[i.id] && i.qty * i.rate > 0 })
      })
    })

  var totals = calcTotals(activeDivisions, tier)
  var mult   = TIER_MULT[tier]

  function toggleDiv(num) {
    setOpenDivs(function(prev){ return Object.assign({}, prev, { [num]: !prev[num] }) })
  }

  function toggleCat(cat) {
    setCatExpand(function(prev){ return Object.assign({}, prev, { [cat]: !prev[cat] }) })
  }

  function addItem(catItem) {
    var newItem = {
      id:        'cat-' + catItem.id + '-' + Date.now(),
      desc:      catItem.desc,
      qty:       catItem.qty,
      unit:      catItem.unit,
      rate:      catItem.rate,
      allowance: catItem.allowance || false,
      fromCatalog: true,
    }
    setDivisions(function(prev) {
      return prev.map(function(d) {
        if (d.num !== catItem.div) return d
        return Object.assign({}, d, { items: [...d.items, newItem] })
      })
    })
    setOpenDivs(function(prev){ return Object.assign({}, prev, { [catItem.div]: true }) })
    setAdded(function(prev){ return Object.assign({}, prev, { [catItem.id]: true }) })
  }

  function removeItem(divNum, itemId) {
    setDivisions(function(prev) {
      return prev.map(function(d) {
        if (d.num !== divNum) return d
        return Object.assign({}, d, { items: d.items.filter(function(i){ return i.id !== itemId }) })
      })
    })
  }

  function toggleExcludeDiv(num) {
    setExcludedDivs(function(prev){ return Object.assign({}, prev, { [num]: !prev[num] }) })
  }

  function toggleExcludeItem(itemId) {
    setExcludedItems(function(prev){ return Object.assign({}, prev, { [itemId]: !prev[itemId] }) })
  }

  function fmtQBDate(dt) {
    var m = String(dt.getMonth()+1).padStart(2,'0')
    var d = String(dt.getDate()).padStart(2,'0')
    return m + '/' + d + '/' + dt.getFullYear()
  }

  function downloadFile(content, filename, mime) {
    var blob = new Blob([content], { type: mime })
    var a    = document.createElement('a')
    a.href   = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function exportIIF() {
    var today    = fmtQBDate(new Date())
    var projNum  = 'SB-EXPORT'
    var client   = 'SpanglerBuilt Client'
    try {
      var params  = new URLSearchParams(window.location.search)
      if (params.get('pn'))   projNum = params.get('pn')
      if (params.get('name')) client  = params.get('name')
    } catch(e) {}

    var mult      = TIER_MULT[tier]
    var divLines  = []
    var baseTotal = 0

    activeDivisions.forEach(function(div) {
      if (!div.items || div.items.length === 0) return
      var raw    = div.items.reduce(function(s,i){ return s + i.qty*i.rate }, 0)
      var tiered = raw * mult
      baseTotal += tiered
      divLines.push({ name: 'Div ' + div.num + ' — ' + div.name, amount: tiered })
    })

    var cont  = baseTotal * 0.05
    var op    = (baseTotal + cont) * 0.10
    var tax   = (baseTotal + cont + op) * 0.08
    var grand = baseTotal + cont + op + tax

    var lines = [
      '!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tDOCNUM\tMEMO',
      '!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO',
      '!ENDTRNS',
      'TRNS\t\tINVOICE\t'+today+'\tAccounts Receivable\t'+client+'\t'+grand.toFixed(2)+'\t'+projNum+'\t'+TIER_LABELS[tier]+' Tier',
    ]
    divLines.forEach(function(d) {
      lines.push('SPL\t\tINVOICE\t'+today+'\tConstruction Income\t'+client+'\t-'+d.amount.toFixed(2)+'\t'+d.name)
    })
    lines.push('SPL\t\tINVOICE\t'+today+'\tConstruction Income\t'+client+'\t-'+cont.toFixed(2)+'\tContingency (5%)')
    lines.push('SPL\t\tINVOICE\t'+today+'\tConstruction Income\t'+client+'\t-'+op.toFixed(2)+'\tOverhead & Profit (10%)')
    lines.push('SPL\t\tINVOICE\t'+today+'\tSales Tax Payable\t'+client+'\t-'+tax.toFixed(2)+'\tSales Tax (8%)')
    lines.push('ENDTRNS')

    downloadFile(lines.join('\r\n') + '\r\n', 'SpanglerBuilt_'+projNum+'_Invoice.iif', 'application/octet-stream')
  }

  function exportCSV() {
    var today   = fmtQBDate(new Date())
    var projNum = 'SB-EXPORT'
    var client  = 'SpanglerBuilt Client'
    try {
      var params = new URLSearchParams(window.location.search)
      if (params.get('pn'))   projNum = params.get('pn')
      if (params.get('name')) client  = params.get('name')
    } catch(e) {}

    var mult = TIER_MULT[tier]
    var rows = [['Customer','Date','Invoice#','Division','Description','Qty','Unit','Rate','Amount','Tier','Tiered Amount']]

    activeDivisions.forEach(function(div) {
      if (!div.items || div.items.length === 0) return
      div.items.forEach(function(item) {
        var raw    = item.qty * item.rate
        var tiered = raw * mult
        rows.push([client, today, projNum, 'Div '+div.num+' — '+div.name, item.desc, item.qty, item.unit||'LS', item.rate.toFixed(2), raw.toFixed(2), TIER_LABELS[tier], tiered.toFixed(2)])
      })
    })

    var direct = totals.direct
    rows.push(['','','','','Contingency (5%)','','','','','',totals.cont.toFixed(2)])
    rows.push(['','','','','Overhead & Profit (10%)','','','','','',totals.op.toFixed(2)])
    rows.push(['','','','','Sales Tax (8%)','','','','','',totals.tax.toFixed(2)])
    rows.push(['','','','','GRAND TOTAL — '+TIER_LABELS[tier],'','','','','',totals.grand.toFixed(2)])

    var csv = rows.map(function(r){ return r.map(function(c){ return '"'+String(c).replace(/"/g,'""')+'"' }).join(',') }).join('\r\n') + '\r\n'
    downloadFile(csv, 'SpanglerBuilt_'+projNum+'_Estimate.csv', 'text/csv')
  }

  function saveToProjectBook() {
    var exportDivs = activeDivisions
      .filter(function(d){ return d.items.length > 0 })
      .map(function(d){
        return {
          num: d.num,
          name: d.name,
          items: d.items.map(function(i){
            return { desc: i.desc, qty: i.qty, unit: i.unit, rate: i.rate, total: Math.round(i.qty * i.rate) }
          })
        }
      })
    var payload = {
      tier, label: TIER_LABELS[tier],
      grand: Math.round(totals.grand),
      direct: Math.round(totals.direct),
      cont: Math.round(totals.cont),
      op: Math.round(totals.op),
      tax: Math.round(totals.tax),
      confirmedAt: new Date().toISOString(),
      activeDivisions: exportDivs,
    }
    localStorage.setItem('sb_estimate', JSON.stringify(payload))
    // Also persist to Supabase if a project_id was passed in the URL
    try {
      var projectId = new URLSearchParams(window.location.search).get('id')
      if (projectId) {
        fetch('/api/projects/' + projectId + '/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(function(){})
      }
    } catch(e) {}
    setSavedMsg('Saved to project book!')
    setTimeout(function(){ setSavedMsg('') }, 3000)
  }

  // Filter catalog
  var filteredCatalog = CATALOG.filter(function(item) {
    var matchType = catType === 'all' || item.types.includes(catType)
    var q = catSearch.toLowerCase()
    var matchSearch = !q || item.desc.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q) || item.cat.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  // Group by category
  var catalogGroups = {}
  CAT_ORDER.forEach(function(cat) {
    var items = filteredCatalog.filter(function(i){ return i.cat === cat })
    if (items.length > 0) catalogGroups[cat] = items
  })

  var tierBtn = function(t) {
    return (
      <button key={t} onClick={function(){ setTier(t) }} style={{
        padding:'5px 14px', fontSize:11, fontFamily:'inherit', fontWeight:500, cursor:'pointer', borderRadius:3,
        border:'1px solid',
        ...(tier === t ? TIER_STYLES[t] : { borderColor:'rgba(255,255,255,.1)', background:'#1a1a1a', color:'rgba(255,255,255,.35)' }),
      }}>{TIER_LABELS[t]}</button>
    )
  }

  return (
    <Layout>

      {/* Topbar */}
      <div style={{background:'#0a0a0a',padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'3px solid #D06830'}}>
        <div style={{fontFamily:'Poppins,sans-serif',fontSize:16,color:'#fff',fontWeight:700,letterSpacing:'.08em'}}>
          SPANGLERBUILT <span style={{fontSize:11,color:'#c9a96e',fontWeight:400}}> · ESTIMATING</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{position:'relative',display:'inline-block'}}>
            <button
              onClick={exportIIF}
              title="File → Utilities → Import → IIF Files in QuickBooks"
              style={{background:'rgba(208,104,48,.15)',border:'1px solid rgba(208,104,48,.4)',color:'#D06830',fontSize:11,fontWeight:700,padding:'6px 13px',borderRadius:3,cursor:'pointer',fontFamily:'inherit',letterSpacing:'.04em'}}>
              Export to QuickBooks
            </button>
          </div>
          <button
            onClick={exportCSV}
            style={{background:'transparent',border:'1px solid rgba(255,255,255,.12)',color:'rgba(255,255,255,.5)',fontSize:11,padding:'6px 13px',borderRadius:3,cursor:'pointer',fontFamily:'inherit'}}>
            Export CSV
          </button>
          <a href="/contractor/catalog" style={{fontSize:11,color:'rgba(255,255,255,.35)',textDecoration:'none',marginLeft:4}}>Catalog ↗</a>
          <a href="/dashboard" style={{fontSize:11,color:'rgba(255,255,255,.35)',textDecoration:'none'}}>← Dashboard</a>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="sb-split" style={{maxWidth:2100,margin:'0 auto',padding:'1.5rem'}}>

        {/* ── LEFT: Material catalog ────────────────────────────────────────── */}
        <div className="sb-split-aside" style={{width:300,position:'sticky',top:'1.5rem'}}>

          <div style={{background:'#0a0a0a',borderRadius:'4px 4px 0 0',padding:'10px 14px',borderBottom:'2px solid #D06830'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#D06830',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:8}}>Material catalog</div>
            <input
              value={catSearch} onChange={function(e){setCatSearch(e.target.value)}}
              placeholder="Search materials..."
              style={{width:'100%',padding:'6px 10px',border:'1px solid rgba(255,255,255,.15)',borderRadius:3,fontSize:11,fontFamily:'Poppins,sans-serif',outline:'none',background:'rgba(255,255,255,.08)',color:'#fff',boxSizing:'border-box'}}
            />
          </div>

          {/* Project type filter */}
          <div style={{display:'flex',background:'#001838',borderBottom:'1px solid rgba(255,255,255,.08)',overflowX:'auto'}}>
            {PROJECT_TYPES.map(function(t){ return (
              <button key={t} onClick={function(){setCatType(t)}} style={{
                flex:1,padding:'6px 2px',fontSize:9,fontWeight:700,fontFamily:'Poppins,sans-serif',cursor:'pointer',
                letterSpacing:'.04em',textTransform:'uppercase',border:'none',whiteSpace:'nowrap',
                background: catType===t ? '#D06830' : 'transparent',
                color: catType===t ? '#fff' : 'rgba(255,255,255,.45)',
                borderBottom: catType===t ? '2px solid #D06830' : '2px solid transparent',
              }}>{TYPE_LABELS[t]}</button>
            )})}
          </div>

          {/* Catalog items */}
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderTop:'none',borderRadius:'0 0 4px 4px',maxHeight:'calc(100vh - 220px)',overflowY:'auto'}}>
            {Object.keys(catalogGroups).length === 0 && (
              <div style={{padding:'2rem',textAlign:'center',fontSize:11,color:'rgba(255,255,255,.35)'}}>No items match your search.</div>
            )}
            {Object.entries(catalogGroups).map(function([cat, items]) {
              var isExp = catExpand[cat] !== false // default open
              return (
                <div key={cat} style={{borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                  <div onClick={function(){toggleCat(cat)}} style={{padding:'7px 12px',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                    <span style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.75)',textTransform:'uppercase',letterSpacing:'.06em'}}>{cat}</span>
                    <span style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>{isExp?'▲':'▼'} {items.length}</span>
                  </div>
                  {isExp && items.map(function(item) {
                    var isAdded = !!added[item.id]
                    return (
                      <div key={item.id} style={{padding:'9px 12px',borderBottom:'1px solid #f9f8f6',background:isAdded?'rgba(208,104,48,.1)':'#fff'}}>
                        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:6,marginBottom:4}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,fontWeight:500,color:'rgba(255,255,255,.75)',lineHeight:1.3,marginBottom:1}}>{item.desc}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>{item.brand}</div>
                            <div style={{fontSize:10,color:'rgba(255,255,255,.35)'}}>{item.spec}</div>
                          </div>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={function(e){e.stopPropagation()}}
                              style={{fontSize:9,color:'#185FA5',textDecoration:'none',flexShrink:0,marginTop:2}}>↗ link</a>
                          )}
                        </div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:5}}>
                          <div>
                            <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.75)'}}>{fmtD(item.rate)}</span>
                            <span style={{fontSize:9,color:'rgba(255,255,255,.35)',marginLeft:3}}>/{item.unit} · DIV {item.div}</span>
                            {item.allowance && <span style={{marginLeft:5,background:'#fff3e0',color:'#e65100',fontSize:8,fontWeight:700,padding:'1px 4px',borderRadius:2}}>allowance</span>}
                          </div>
                          <button onClick={function(){addItem(item)}}
                            style={{background:isAdded?'#eaf3de':'#D06830',color:isAdded?'#3B6D11':'#fff',border:'none',padding:'3px 10px',fontSize:9,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.04em',textTransform:'uppercase',whiteSpace:'nowrap'}}>
                            {isAdded ? '✓ Added' : '+ Add'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── RIGHT: Estimate ───────────────────────────────────────────────── */}
        <div className="sb-split-main">

          <div style={{marginBottom:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
            <div>
              <div style={{fontSize:18,fontWeight:500,fontFamily:'Poppins,sans-serif'}}>Mendel Basement Renovation</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>SB-2026-001 · 4995 Shadow Glen Ct, Dunwoody GA · 665 sf</div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
              {['good','better','best','luxury'].map(tierBtn)}
              <button onClick={saveToProjectBook}
                style={{background:'#0a0a0a',color:'#D06830',border:'2px solid #D06830',padding:'5px 14px',fontSize:11,fontWeight:700,cursor:'pointer',borderRadius:3,fontFamily:'Poppins,sans-serif',letterSpacing:'.06em',textTransform:'uppercase'}}>
                {savedMsg || 'Save to project book →'}
              </button>
            </div>
          </div>

          {/* Summary metrics */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:'1.25rem'}}>
            {[
              ['Direct cost',       fmt(totals.direct)],
              ['Tier ('+TIER_LABELS[tier]+')', fmt(totals.tiered)],
              ['Contingency + O&P', fmt(totals.cont + totals.op)],
              ['Contract total',    fmt(totals.grand)],
            ].map(function(item,i){ return (
              <div key={item[0]} style={{background:'#161616',border:'1px solid '+(i===3?'#3B6D11':'#e8e6e0'),borderRadius:4,padding:'.7rem .9rem'}}>
                <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.04em'}}>{item[0]}</div>
                <div style={{fontSize:18,fontWeight:500,color:i===3?'#0a0a0a':'inherit'}}>{item[1]}</div>
              </div>
            )})}
          </div>

          <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.5rem'}}>Division line items — click to expand</div>

          {divisions.map(function(div) {
            var isExcluded = !!excludedDivs[div.num]
            // Use active items only for subtotal display
            var activeItems = div.items.filter(function(i){ return !excludedItems[i.id] && i.qty * i.rate > 0 })
            var sub  = activeItems.reduce(function(s,i){ return s + i.qty * i.rate }, 0)
            var adj  = sub * mult
            var open = !!openDivs[div.num]
            return (
              <div key={div.num} style={{background:'#161616',border:'1px solid '+(isExcluded?'#e0ddd8':'#e8e6e0'),borderRadius:4,overflow:'hidden',marginBottom:8,opacity:isExcluded?0.6:1}}>
                <div style={{padding:'8px 12px',background:isExcluded?'#f5f4f1':'rgba(208,104,48,.1)',display:'flex',alignItems:'center',borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                  {/* On/off toggle — stops it from contributing to total */}
                  <div onClick={function(e){e.stopPropagation();toggleExcludeDiv(div.num)}}
                    title={isExcluded?'Click to include this division':'Click to exclude this division'}
                    style={{flexShrink:0,marginRight:10,width:32,height:17,borderRadius:9,background:isExcluded?'#e8e6e0':'#3B6D11',position:'relative',cursor:'pointer',transition:'background .2s'}}>
                    <div style={{position:'absolute',top:2,left:isExcluded?2:15,width:13,height:13,borderRadius:'50%',background:'#fff',transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}/>
                  </div>
                  <span onClick={function(){toggleDiv(div.num)}} style={{fontSize:9,fontWeight:700,letterSpacing:'.1em',color:isExcluded?'#bbb':'#9a9690',marginRight:10,textTransform:'uppercase',cursor:'pointer'}}>DIV {div.num}</span>
                  <span onClick={function(){toggleDiv(div.num)}} style={{flex:1,fontSize:12,fontWeight:500,color:isExcluded?'#bbb':'inherit',textDecoration:isExcluded?'line-through':'none',cursor:'pointer'}}>{div.name}</span>
                  {isExcluded && <span style={{fontSize:10,color:'#bbb',marginRight:8,fontStyle:'italic'}}>excluded</span>}
                  <span style={{fontSize:12,fontWeight:500,color:isExcluded?'#bbb':'#0a0a0a',marginRight:8}}>{isExcluded?'—':fmt(adj)}</span>
                  <span onClick={function(){toggleDiv(div.num)}} style={{fontSize:10,color:'rgba(255,255,255,.35)',cursor:'pointer'}}>{open?'▲':'▼'}</span>
                </div>
                {open && (
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                    <thead>
                      <tr>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'left',borderBottom:'1px solid rgba(255,255,255,.07)',width:'42%'}}>Description</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'left',borderBottom:'1px solid rgba(255,255,255,.07)'}}>Qty</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'left',borderBottom:'1px solid rgba(255,255,255,.07)'}}>Unit</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'left',borderBottom:'1px solid rgba(255,255,255,.07)'}}>Rate</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'right',borderBottom:'1px solid rgba(255,255,255,.07)'}}>Base</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'right',borderBottom:'1px solid rgba(255,255,255,.07)'}}>{TIER_LABELS[tier]}</th>
                        <th style={{padding:'5px 10px',background:'#1a1a1a',fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.04em',textAlign:'right',borderBottom:'1px solid rgba(255,255,255,.07)',width:28}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {div.items.map(function(item, i) {
                        var itemExcluded = !!excludedItems[item.id] || isExcluded
                        var base = item.qty * item.rate
                        var adj2 = base * mult
                        return (
                          <tr key={item.id} style={{background:itemExcluded?'#fafafa':item.fromCatalog?'rgba(208,104,48,.1)':'inherit',opacity:itemExcluded?0.45:1}}>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.65)'}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                {/* per-item toggle */}
                                <div onClick={function(){toggleExcludeItem(item.id)}}
                                  title={excludedItems[item.id]?'Include this item':'Exclude this item'}
                                  style={{flexShrink:0,width:24,height:14,borderRadius:7,background:excludedItems[item.id]?'#e8e6e0':'#3B6D11',position:'relative',cursor:'pointer',transition:'background .15s'}}>
                                  <div style={{position:'absolute',top:1.5,left:excludedItems[item.id]?1.5:11,width:11,height:11,borderRadius:'50%',background:'#fff',transition:'left .15s',boxShadow:'0 1px 2px rgba(0,0,0,.2)'}}/>
                                </div>
                                <span style={{textDecoration:itemExcluded?'line-through':'none'}}>
                                  {item.fromCatalog && <span style={{marginRight:5,background:'#D06830',color:'#fff',fontSize:8,fontWeight:700,padding:'1px 4px',borderRadius:2}}>catalog</span>}
                                  {item.desc}
                                  {item.allowance && <span style={{marginLeft:6,background:'#fff3e0',color:'#e65100',fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3}}>allowance</span>}
                                </span>
                              </div>
                            </td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)'}}>{item.qty}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)'}}>{item.unit}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.35)'}}>{fmtD(item.rate)}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',textAlign:'right',textDecoration:itemExcluded?'line-through':'none',color:itemExcluded?'#bbb':'inherit'}}>{fmt(base)}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',textAlign:'right',fontWeight:500,color:itemExcluded?'#bbb':'#0a0a0a',textDecoration:itemExcluded?'line-through':'none'}}>{fmt(adj2)}</td>
                            <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',textAlign:'right'}}>
                              {item.fromCatalog && (
                                <button onClick={function(){removeItem(div.num, item.id)}}
                                  style={{background:'transparent',border:'none',color:'#c0392b',fontSize:11,cursor:'pointer',padding:'0 2px',fontFamily:'Poppins,sans-serif'}}>✕</button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      <tr style={{background:'#1a1a1a'}}>
                        <td colSpan={4} style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',fontWeight:500}}>Division {div.num} subtotal</td>
                        <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',textAlign:'right',fontWeight:500}}>{fmt(sub)}</td>
                        <td style={{padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,.07)',textAlign:'right',fontWeight:500,color:'rgba(255,255,255,.75)'}}>{fmt(adj)}</td>
                        <td/>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}

          {/* Below the line */}
          <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',margin:'.75rem 0 .5rem'}}>Below the line</div>
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',marginBottom:8}}>
            {[
              ['Direct cost subtotal',                    fmt(totals.direct)],
              [TIER_LABELS[tier]+' tier ('+mult.toFixed(2)+'×)', fmt(totals.tiered)],
              ['Contingency (5%)',                         fmt(totals.cont)],
              ['Overhead & profit (10%)',                  fmt(totals.op)],
              ['Georgia sales tax (8%)',                   fmt(totals.tax)],
            ].map(function(row){ return (
              <div key={row[0]} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 12px',borderBottom:'1px solid rgba(255,255,255,.07)',fontSize:12}}>
                <span style={{color:'rgba(255,255,255,.35)'}}>{row[0]}</span><span style={{fontWeight:500}}>{row[1]}</span>
              </div>
            )})}
          </div>

          <div style={{background:'#0a0a0a',color:'#D06830',padding:'12px 16px',borderRadius:4,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
            <span style={{fontSize:11,fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',opacity:.7}}>{TIER_LABELS[tier]} tier — contract total</span>
            <span style={{fontSize:24,fontWeight:500}}>{fmt(totals.grand)}</span>
          </div>

          {/* Payment schedule */}
          <div style={{fontSize:10,fontWeight:500,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.05em',margin:'.75rem 0 .5rem'}}>Payment schedule</div>
          <div style={{background:'#161616',border:'1px solid rgba(255,255,255,.09)',borderRadius:4,overflow:'hidden',marginBottom:8}}>
            {PAYMENTS.map(function(p){ return (
              <div key={p.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 12px',borderBottom:'1px solid rgba(255,255,255,.07)',fontSize:12}}>
                <span style={{color:'rgba(255,255,255,.35)',marginRight:8,fontSize:10}}>{p.pct}%</span>
                <span style={{flex:1}}>{p.label}</span>
                <span style={{fontWeight:500}}>{fmt(totals.grand * p.pct / 100)}</span>
              </div>
            )})}
          </div>

          <div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:'.75rem',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:4}}>
            <span>SpanglerBuilt Inc. · Michael Spangler, GC · (404) 492-7650 · michael@spanglerbuilt.com</span>
            <span>Metro Atlanta market pricing · Valid 30 days</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() { return { props: {} } }
