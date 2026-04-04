import { getAdminClient } from '../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    var supabase = await getAdminClient()
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })
    var { data, error } = await supabase.from('catalog_materials').insert([req.body]).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, material: data })
  }

  if (req.method !== 'GET') return res.status(405).end()

  var supabase = await getAdminClient()
  if (!supabase) return res.status(200).json({ materials: STATIC_MATERIALS, static: true })

  var query = supabase
    .from('catalog_materials')
    .select('*, catalog_variants(*)')
    .order('category')
    .order('tier')

  if (req.query.tier     && req.query.tier     !== 'all') query = query.ilike('tier', req.query.tier)
  if (req.query.category && req.query.category !== 'all') query = query.ilike('category', '%' + req.query.category + '%')
  if (req.query.search) {
    var s = req.query.search
    query = query.or('product_name.ilike.%' + s + '%,brand.ilike.%' + s + '%,subcategory.ilike.%' + s + '%')
  }

  var { data, error } = await query
  if (error) return res.status(200).json({ materials: STATIC_MATERIALS, static: true })

  return res.json({ materials: data && data.length > 0 ? data : STATIC_MATERIALS })
}

var STATIC_MATERIALS = [
  { id:'1',  category:'Flooring',        subcategory:'LVP',                    brand:'Shaw Floors',          product_name:'Floorte Pro Series',     style_type:'Standard',         size:'Various', finish:'Natural Biscuit',    unit:'SF',   total_installed:'3.49',     tier:'Good'   },
  { id:'2',  category:'Flooring',        subcategory:'LVP',                    brand:'COREtec Plus',         product_name:'Enhanced XL Series',     style_type:'Wide Plank 9"',    size:'Various', finish:'Vero Beach Oak',     unit:'SF',   total_installed:'5.49',     tier:'Better' },
  { id:'3',  category:'Flooring',        subcategory:'Engineered Hardwood',    brand:'Anderson Tuftex',      product_name:'Bernina Oak',            style_type:'Wide Plank 7"',    size:'Various', finish:'Glacier',            unit:'SF',   total_installed:'9.49',     tier:'Best'   },
  { id:'4',  category:'Flooring',        subcategory:'Engineered Hardwood',    brand:'Hakwood',              product_name:'European Oak',           style_type:'Wide Plank 9.5"',  size:'Various', finish:'Smoked Pearl',       unit:'SF',   total_installed:'18.00',    tier:'Luxury' },
  { id:'5',  category:'Flooring',        subcategory:'Carpet',                 brand:'Shaw Floors',          product_name:'Anso Nylon',             style_type:'Textured',         size:'Various', finish:'Greige',             unit:'SF',   total_installed:'2.75',     tier:'Good'   },
  { id:'6',  category:'Countertops',     subcategory:'Laminate',               brand:'Wilsonart',            product_name:'HD Laminate',            style_type:'Post-form',        size:'3/4"',    finish:'Calcutta Marble',    unit:'SF',   total_installed:'28.00',    tier:'Good'   },
  { id:'7',  category:'Countertops',     subcategory:'Quartz',                 brand:'Silestone',            product_name:'Eternal Calacatta Gold', style_type:'Slab',             size:'3cm',     finish:'White/Gold',         unit:'SF',   total_installed:'65.00',    tier:'Better' },
  { id:'8',  category:'Countertops',     subcategory:'Quartz',                 brand:'Cambria',              product_name:'Brittanicca Warm',       style_type:'Slab',             size:'3cm',     finish:'Warm White',         unit:'SF',   total_installed:'95.00',    tier:'Best'   },
  { id:'9',  category:'Countertops',     subcategory:'Natural Stone',          brand:'Antolini',             product_name:'Calacatta Borghini',     style_type:'Book-matched Slab',size:'3cm',     finish:'White/Gold',         unit:'SF',   total_installed:'180.00',   tier:'Luxury' },
  { id:'10', category:'Tile',            subcategory:'Ceramic',                brand:'Daltile',              product_name:'Restore Series',         style_type:'Field Tile',       size:'12x24',   finish:'Bright White',       unit:'SF',   total_installed:'4.99',     tier:'Good'   },
  { id:'11', category:'Tile',            subcategory:'Porcelain',              brand:'MSI Surfaces',         product_name:'Carrara White',          style_type:'Field Tile',       size:'24x24',   finish:'Polished',           unit:'SF',   total_installed:'8.99',     tier:'Better' },
  { id:'12', category:'Tile',            subcategory:'Large Format Porcelain', brand:'Porcelanosa',          product_name:'Marmol Calacatta',       style_type:'Field Tile',       size:'32x32',   finish:'Polished',           unit:'SF',   total_installed:'14.99',    tier:'Best'   },
  { id:'13', category:'Tile',            subcategory:'Natural Stone',          brand:'Ann Sacks',            product_name:'Bianco Dolomite',        style_type:'Honed Slab',       size:'24x48',   finish:'Honed',              unit:'SF',   total_installed:'28.00',    tier:'Luxury' },
  { id:'14', category:'Fixtures',        subcategory:'Faucet',                 brand:'Moen',                 product_name:'Align Series',           style_type:'Single Handle',    size:'Standard',finish:'Brushed Nickel',     unit:'Each', total_installed:'Allowance', tier:'Good'   },
  { id:'15', category:'Fixtures',        subcategory:'Faucet',                 brand:'Delta',                product_name:'Trinsic Series',         style_type:'Pull-down',        size:'Standard',finish:'Matte Black',        unit:'Each', total_installed:'Allowance', tier:'Better' },
  { id:'16', category:'Fixtures',        subcategory:'Faucet',                 brand:'Brizo',                product_name:'Litze Series',           style_type:'Articulating',     size:'Standard',finish:'Unlacquered Brass',  unit:'Each', total_installed:'Allowance', tier:'Best'   },
  { id:'17', category:'Doors and Trim',  subcategory:'Interior Door',          brand:'Masonite',             product_name:'Smooth 2-Panel',         style_type:'Two Panel Square', size:'2/8x6/8', finish:'Primed',             unit:'Each', total_installed:'185.00',   tier:'Good'   },
  { id:'18', category:'Doors and Trim',  subcategory:'Interior Door',          brand:'Masonite',             product_name:'Smooth 2-Panel',         style_type:'Two Panel Arched', size:'2/8x6/8', finish:'Primed',             unit:'Each', total_installed:'230.00',   tier:'Better' },
  { id:'19', category:'Doors and Trim',  subcategory:'Interior Door',          brand:'Steves and Sons',      product_name:'Solid Core Shaker',      style_type:'Shaker',           size:'2/8x8/0', finish:'White Pre-finished',  unit:'Each', total_installed:'330.00',   tier:'Best'   },
  { id:'20', category:'Doors and Trim',  subcategory:'Interior Door',          brand:'TruStile',             product_name:'Custom Solid Wood',      style_type:'Custom Profile',   size:'3/0x8/0', finish:'Custom Finish',      unit:'Each', total_installed:'650.00',   tier:'Luxury' },
  { id:'21', category:'Hardware',        subcategory:'Pulls',                  brand:'Amerock',              product_name:'Everyday Basics',        style_type:'Bar Pull 3"',      size:'3" CC',   finish:'Brushed Nickel',     unit:'Each', total_installed:'7.50',     tier:'Good'   },
  { id:'22', category:'Hardware',        subcategory:'Pulls',                  brand:'Rejuvenation',         product_name:'Schoolhouse Series',     style_type:'Cup Pull',         size:'3" CC',   finish:'Matte Black',        unit:'Each', total_installed:'21.00',    tier:'Better' },
  { id:'23', category:'Hardware',        subcategory:'Pulls',                  brand:'Top Knobs',            product_name:'Transcend Series',       style_type:'Bar Pull 5"',      size:'5" CC',   finish:'Unlacquered Brass',  unit:'Each', total_installed:'35.00',    tier:'Best'   },
  { id:'24', category:'Hardware',        subcategory:'Pulls',                  brand:'Rocky Mountain Hardware', product_name:'Custom Cast',         style_type:'Hand-forged',      size:'Custom',  finish:'Oil-rubbed Bronze',  unit:'Each', total_installed:'100.00',   tier:'Luxury' },
  { id:'25', category:'Cabinets',        subcategory:'Stock',                  brand:'Hampton Bay',          product_name:'Shaker Style',           style_type:'Shaker',           size:'Standard',finish:'Unfinished/Paint',   unit:'Allowance', total_installed:'Allowance', tier:'Good' },
  { id:'26', category:'Cabinets',        subcategory:'Semi-custom',            brand:'KraftMaid',            product_name:'Dovetail Shaker',        style_type:'Shaker',           size:'Standard',finish:'Dove White',         unit:'Allowance', total_installed:'Allowance', tier:'Better' },
  { id:'27', category:'Cabinets',        subcategory:'Semi-custom Inset',      brand:'Dura Supreme',         product_name:'Inset Shaker Maple',     style_type:'Inset',            size:'Standard',finish:'Alabaster',          unit:'Allowance', total_installed:'Allowance', tier:'Best'  },
  { id:'28', category:'Cabinets',        subcategory:'Full Custom',            brand:'Plain and Fancy',      product_name:'Custom Any Style',       style_type:'Any',              size:'Any',     finish:'Bespoke',            unit:'Allowance', total_installed:'Per Quote', tier:'Luxury' },
]
