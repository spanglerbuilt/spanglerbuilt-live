// lib/generatePresentationBook.js
// Generates a SpanglerBuilt PowerPoint presentation book using pptxgenjs
// Usage: const buf = await generatePresentationBook(project, materials, schedule, referenceProjects)

import PptxGenJS from 'pptxgenjs'

// ── Brand colors (no # prefix for pptxgenjs) ────────────────────────────────
const C = {
  BG:      '0d1117',
  SURFACE: '1a1f2e',
  ORANGE:  'FF8C00',
  ORANGE2: 'D06830',
  WHITE:   'FFFFFF',
  DIM:     '4A5568',
  GRAY:    '8892A4',
  GREEN:   '27ae60',
  BLUE:    '185FA5',
  PURPLE:  '6C3483',
  NAVY:    '001838',
}

// Slide canvas: LAYOUT_WIDE = 13.33" x 7.5"
const W = 13.33
const H = 7.5
const FONT = 'Calibri'

// Tier palette
const TIER_COLOR = {
  good:    C.GREEN,
  better:  C.BLUE,
  best:    C.PURPLE,
  luxury:  C.ORANGE2,
}
const TIER_LABEL = { good:'Good', better:'Better', best:'Best', luxury:'Luxury' }
const TIER_RANGES = {
  good:    { low:35000,  high:55000  },
  better:  { low:55000,  high:80000  },
  best:    { low:80000,  high:120000 },
  luxury:  { low:120000, high:200000 },
}

// Default schedule phases
const DEFAULT_PHASES = [
  { phase:'Demo & Site Prep',     start_week:0,  duration_weeks:1, color:C.ORANGE2 },
  { phase:'Rough Framing',        start_week:1,  duration_weeks:2, color:C.ORANGE  },
  { phase:'MEP Rough-In',         start_week:2,  duration_weeks:3, color:C.BLUE    },
  { phase:'Inspections',          start_week:4,  duration_weeks:1, color:C.PURPLE  },
  { phase:'Insulation & Drywall', start_week:5,  duration_weeks:2, color:C.GREEN   },
  { phase:'Finishes & Tile',      start_week:6,  duration_weeks:3, color:C.ORANGE  },
  { phase:'Fixtures & Trim',      start_week:8,  duration_weeks:2, color:C.ORANGE2 },
  { phase:'Punch List',           start_week:10, duration_weeks:1, color:C.GREEN   },
]

const fmt = (n) => '$' + Number(n).toLocaleString()

// ── Helpers ──────────────────────────────────────────────────────────────────

function orangeBar(slide) {
  slide.addShape('rect', {
    x:0, y:0, w:W, h:0.09,
    fill:{ color:C.ORANGE }, line:{ type:'none' },
  })
}

function slideHeader(slide, title, subtitle) {
  orangeBar(slide)
  slide.addText(title, {
    x:0.45, y:0.14, w:W-0.9, h:0.55,
    fontSize:22, bold:true, color:C.WHITE, fontFace:FONT,
  })
  if (subtitle) {
    slide.addText(subtitle, {
      x:0.45, y:0.66, w:W-0.9, h:0.32,
      fontSize:11, color:C.GRAY, fontFace:FONT,
    })
  }
  // divider
  slide.addShape('rect', {
    x:0.45, y:0.98, w:W-0.9, h:0.025,
    fill:{ color:C.ORANGE }, line:{ type:'none' },
  })
}

function infoBox(slide, x, y, w, h, label, value, accent) {
  slide.addShape('rect', {
    x, y, w, h,
    fill:{ color:C.SURFACE }, line:{ color:accent||C.ORANGE, width:1 }, rectRadius:0.04,
  })
  slide.addText(label.toUpperCase(), {
    x:x+0.12, y:y+0.1, w:w-0.24, h:0.22,
    fontSize:7, bold:true, color:C.GRAY, fontFace:FONT, charSpacing:1,
  })
  slide.addText(value, {
    x:x+0.12, y:y+0.28, w:w-0.24, h:h-0.38,
    fontSize:12, bold:true, color:C.WHITE, fontFace:FONT, shrinkText:true,
  })
}

function sectionLabel(slide, x, y, text) {
  slide.addText(text.toUpperCase(), {
    x, y, w:5, h:0.28,
    fontSize:8, bold:true, color:C.ORANGE, fontFace:FONT, charSpacing:2,
  })
}

// ── Slide 1: Cover ───────────────────────────────────────────────────────────
function slide1Cover(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }

  // full-height left accent bar
  s.addShape('rect', { x:0, y:0, w:0.2, h:H, fill:{ color:C.ORANGE }, line:{ type:'none' } })

  // logo area background
  s.addShape('rect', { x:0.2, y:0, w:W-0.2, h:H, fill:{ color:C.BG }, line:{ type:'none' } })

  // "SPANGLERBUILT" wordmark
  s.addText('SPANGLERBUILT', {
    x:0.5, y:0.55, w:8, h:0.65,
    fontSize:36, bold:true, color:C.WHITE, fontFace:FONT, charSpacing:4,
  })
  s.addText('CONSTRUCTION  ·  RENOVATION  ·  DESIGN-BUILD', {
    x:0.5, y:1.15, w:9, h:0.3,
    fontSize:9, color:C.ORANGE, fontFace:FONT, charSpacing:3,
  })

  // Horizontal rule
  s.addShape('rect', { x:0.5, y:1.5, w:9.5, h:0.03, fill:{ color:C.ORANGE }, line:{ type:'none' } })

  // Client name (big)
  s.addText(p.clientName || 'Client Name', {
    x:0.5, y:1.65, w:10, h:1.1,
    fontSize:44, bold:true, color:C.WHITE, fontFace:FONT,
  })

  // Project type
  s.addText((p.projectType || 'Renovation') + ' Project', {
    x:0.5, y:2.72, w:10, h:0.55,
    fontSize:22, color:C.ORANGE, fontFace:FONT,
  })

  // Address
  if (p.address) {
    s.addText(p.address, {
      x:0.5, y:3.28, w:10, h:0.38,
      fontSize:14, color:C.GRAY, fontFace:FONT,
    })
  }

  // Detail pills row
  const pills = [
    p.sqft       ? p.sqft + ' SF'          : null,
    p.projectId  ? p.projectId             : null,
    p.preparedDate ? 'Prepared ' + p.preparedDate : null,
    p.tier       ? TIER_LABEL[p.tier?.toLowerCase()] + ' Tier' : null,
  ].filter(Boolean)

  let px = 0.5
  pills.forEach(function(pill) {
    const w = Math.min(pill.length * 0.1 + 0.5, 3)
    s.addShape('rect', { x:px, y:3.85, w, h:0.32, fill:{ color:C.SURFACE }, line:{ color:C.ORANGE, width:1 } })
    s.addText(pill, { x:px+0.1, y:3.87, w:w-0.2, h:0.28, fontSize:9, color:C.WHITE, fontFace:FONT, bold:true })
    px += w + 0.15
  })

  // Tagline bottom
  s.addShape('rect', { x:0, y:H-0.65, w:W, h:0.65, fill:{ color:C.NAVY }, line:{ type:'none' } })
  s.addText('WE BUILD MORE THAN PROJECTS — WE BUILD LIFESTYLES.', {
    x:0.5, y:H-0.55, w:W-1, h:0.45,
    fontSize:11, bold:true, color:C.ORANGE, fontFace:FONT, charSpacing:2, align:'center',
  })
}

// ── Slide 2: About SpanglerBuilt ─────────────────────────────────────────────
function slide2About(pres) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'About SpanglerBuilt', 'Atlanta\'s premier design-build renovation firm')

  const blocks = [
    {
      icon:'◈', title:'Who We Are',
      body:'SpanglerBuilt is a full-service design-build remodeling firm based in the Atlanta metro area. We specialize in basement finishing, kitchen remodels, bathroom renovations, and home additions — delivering premium craftsmanship from initial concept through final walkthrough.',
    },
    {
      icon:'◉', title:'Our Process',
      body:'We guide every client through a structured 4-phase process: Discovery & Design → Estimate & Selection → Construction → Warranty & Support. Every project is assigned a dedicated project manager and tracked in our proprietary client portal.',
    },
    {
      icon:'✦', title:'Why SpanglerBuilt',
      body:'• Licensed & insured general contractor\n• In-house design and material selection team\n• Real-time project tracking via client portal\n• Written warranty on all workmanship\n• 5-star rated across Google & Houzz',
    },
  ]

  blocks.forEach(function(b, i) {
    const x = 0.45 + i * 4.25
    s.addShape('rect', {
      x, y:1.15, w:4.0, h:4.9,
      fill:{ color:C.SURFACE }, line:{ color:C.ORANGE, width:1 }, rectRadius:0.06,
    })
    s.addText(b.icon, {
      x:x+0.2, y:1.35, w:0.5, h:0.5,
      fontSize:22, color:C.ORANGE, fontFace:FONT,
    })
    s.addText(b.title, {
      x:x+0.15, y:1.85, w:3.7, h:0.45,
      fontSize:14, bold:true, color:C.WHITE, fontFace:FONT,
    })
    s.addShape('rect', { x:x+0.15, y:2.28, w:3.7, h:0.02, fill:{ color:C.ORANGE }, line:{ type:'none' } })
    s.addText(b.body, {
      x:x+0.15, y:2.38, w:3.7, h:3.4,
      fontSize:9.5, color:C.GRAY, fontFace:FONT, valign:'top', breakLine:true,
    })
  })

  // footer contact bar
  s.addShape('rect', { x:0, y:H-0.5, w:W, h:0.5, fill:{ color:C.NAVY }, line:{ type:'none' } })
  s.addText('michael@spanglerbuilt.com   ·   (404) 492-7650   ·   app.spanglerbuilt.com   ·   44 Milton Ave Suite 243, Woodstock GA 30188', {
    x:0, y:H-0.45, w:W, h:0.4,
    fontSize:9, color:C.GRAY, fontFace:FONT, align:'center',
  })
}

// ── Slide 3: Project Scope ───────────────────────────────────────────────────
function slide3Scope(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Project Scope', 'Full project details and specifications')

  const tierKey  = (p.tier||'better').toLowerCase()
  const tierCol  = TIER_COLOR[tierKey] || C.ORANGE
  const tierName = TIER_LABEL[tierKey] || 'Better'

  const fields = [
    ['Client',          p.clientName     || '—'],
    ['Project Number',  p.projectId      || '—'],
    ['Project Type',    p.projectType    || '—'],
    ['Address',         p.address        || '—'],
    ['Square Footage',  p.sqft ? p.sqft + ' SF' : '—'],
    ['Contract Value',  p.contractValue  ? fmt(p.contractValue) : '—'],
    ['Duration',        p.duration       || '~12 weeks'],
    ['Prepared',        p.preparedDate   || new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})],
    ['Tier Selected',   tierName],
  ]

  const cols = 3
  const rows = Math.ceil(fields.length / cols)
  const bw = (W - 0.9) / cols
  const bh = 0.9

  fields.forEach(function([label, value], i) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x   = 0.45 + col * bw
    const y   = 1.2  + row * (bh + 0.1)
    const acc = label === 'Tier Selected' ? tierCol : C.ORANGE

    infoBox(s, x, y, bw - 0.1, bh, label, value, acc)
  })

  // Tier highlight badge
  const tierY = 1.2 + (rows) * (bh + 0.1) + 0.15
  s.addShape('rect', { x:0.45, y:tierY, w:W-0.9, h:0.7, fill:{ color:C.SURFACE }, line:{ color:tierCol, width:2 } })
  s.addText('Selected Tier:', { x:0.65, y:tierY+0.15, w:2, h:0.4, fontSize:10, color:C.GRAY, fontFace:FONT })
  s.addText(tierName.toUpperCase(), { x:2.7, y:tierY+0.1, w:3, h:0.5, fontSize:18, bold:true, color:tierCol, fontFace:FONT, charSpacing:2 })
  if (p.contractValue) {
    s.addText(fmt(p.contractValue), { x:W-3, y:tierY+0.1, w:2.6, h:0.5, fontSize:18, bold:true, color:C.WHITE, fontFace:FONT, align:'right' })
  }
}

// ── Slide 4: Selection Tiers ─────────────────────────────────────────────────
function slide4Tiers(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Selection Tiers', 'Every tier includes the same scope of work — materials and finishes differ')

  const tierKey = (p.tier||'better').toLowerCase()
  const tiers   = ['good','better','best','luxury']
  const tw = (W - 0.9) / 4

  const BULLETS = {
    good:   ['Standard LVP flooring','Ceramic tile','Stock cabinets','Builder-grade fixtures','Hollow-core doors','Brushed nickel hardware'],
    better: ['Premium waterproof LVP','Porcelain tile','Semi-custom cabinets','Matte black fixtures','Solid-core doors','Matte black hardware'],
    best:   ['Designer LVP or hardwood','Large-format porcelain','Inset custom cabinets','Thermostatic fixtures','8\' solid-core doors','Unlacquered brass hardware'],
    luxury: ['Wide-plank hardwood','Natural marble or stone','Full custom cabinetry','European thermostatic system','Custom profile solid wood doors','Hand-forged custom hardware'],
  }

  tiers.forEach(function(tier, i) {
    const isSelected = tier === tierKey
    const col        = TIER_COLOR[tier]
    const x          = 0.45 + i * tw
    const bh         = H - 1.5

    // card bg
    s.addShape('rect', {
      x, y:1.15, w:tw-0.12, h:bh,
      fill:{ color: isSelected ? C.SURFACE : C.BG },
      line:{ color: isSelected ? col : '2d3748', width: isSelected ? 2.5 : 1 },
      rectRadius:0.06,
    })

    if (isSelected) {
      s.addShape('rect', { x, y:1.15, w:tw-0.12, h:0.08, fill:{ color:col }, line:{ type:'none' } })
    }

    // tier name
    s.addText(TIER_LABEL[tier].toUpperCase(), {
      x:x+0.1, y:1.32, w:tw-0.32, h:0.45,
      fontSize:15, bold:true, color:isSelected?col:C.GRAY, fontFace:FONT, charSpacing:2,
    })

    // price range
    const r = TIER_RANGES[tier]
    s.addText(fmt(r.low) + ' – ' + fmt(r.high), {
      x:x+0.1, y:1.78, w:tw-0.32, h:0.35,
      fontSize:11, color:C.WHITE, fontFace:FONT,
    })

    s.addShape('rect', { x:x+0.1, y:2.14, w:tw-0.32, h:0.02, fill:{ color:isSelected?col:'2d3748' }, line:{ type:'none' } })

    // bullets
    BULLETS[tier].forEach(function(b, bi) {
      s.addText('· ' + b, {
        x:x+0.1, y:2.24+bi*0.55, w:tw-0.32, h:0.5,
        fontSize:9, color:isSelected?C.WHITE:C.GRAY, fontFace:FONT, valign:'top', shrinkText:true,
      })
    })

    // selected badge
    if (isSelected) {
      s.addShape('rect', { x:x+0.1, y:1.15+bh-0.55, w:tw-0.32, h:0.38, fill:{ color:col }, line:{ type:'none' } })
      s.addText('✓  SELECTED', {
        x:x+0.1, y:1.15+bh-0.53, w:tw-0.32, h:0.34,
        fontSize:10, bold:true, color:C.WHITE, fontFace:FONT, align:'center', charSpacing:1,
      })
    }
  })
}

// ── Slide 5 & 6: Material Selections ─────────────────────────────────────────
function materialSlide(pres, p, title, categories, materials) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  const tierKey = (p.tier||'better').toLowerCase()
  slideHeader(s, title, 'Filtered to ' + (TIER_LABEL[tierKey]||'Better') + ' tier — ' + p.projectType + ' project')

  const filtered = materials.filter(function(m) {
    const cat = (m.category||m.subcategory||'').toLowerCase()
    return categories.some(function(c){ return cat.includes(c.toLowerCase()) })
    // also filter by tier if tier field exists
  }).slice(0, 14)

  if (filtered.length === 0) {
    s.addText('No ' + categories.join(' / ') + ' materials on file for this tier.\nAdd items via the Material Catalog at app.spanglerbuilt.com.', {
      x:0.5, y:2, w:W-1, h:2, fontSize:13, color:C.GRAY, fontFace:FONT, align:'center',
    })
    return
  }

  const headerRow = [
    { text:'Category',    options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Brand',       options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT } },
    { text:'Product',     options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT } },
    { text:'Finish/Style',options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT } },
    { text:'Size',        options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Unit',        options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Installed',   options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
  ]

  const dataRows = filtered.map(function(m, i) {
    const bg = i % 2 === 0 ? C.SURFACE : C.BG
    const td = function(v){ return { text:String(v||'—'), options:{ color:C.WHITE, fill:{ color:bg }, fontSize:8.5, fontFace:FONT } } }
    const tc = function(v){ return { text:String(v||'—'), options:{ color:C.WHITE, fill:{ color:bg }, fontSize:8.5, fontFace:FONT, align:'center' } } }
    return [
      tc(m.subcategory || m.category || '—'),
      td(m.brand||'—'),
      td(m.product_name||m.name||'—'),
      td(m.finish||m.style_type||'—'),
      tc(m.size||'—'),
      tc(m.unit||'—'),
      tc(m.total_installed ? '$'+m.total_installed : '—'),
    ]
  })

  s.addTable([headerRow, ...dataRows], {
    x:0.45, y:1.1, w:W-0.9,
    colW:[1.6, 1.8, 2.8, 2.2, 1.1, 0.7, 1.3],
    rowH:0.32,
    border:{ type:'solid', pt:0.5, color:'2d3748' },
    autoPage:false,
    fontSize:8.5,
    fontFace:FONT,
  })
}

// ── Slide 7: Project Schedule (Gantt) ────────────────────────────────────────
function slide7Schedule(pres, p, schedule) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Project Schedule', 'Estimated timeline — subject to material lead times and permit approval')

  const phases = (schedule && schedule.length > 0) ? schedule : DEFAULT_PHASES
  const totalWeeks = phases.reduce(function(mx, ph) {
    return Math.max(mx, ph.start_week + ph.duration_weeks)
  }, 0) + 1

  // Layout
  const LEFT_W  = 3.2     // phase label column width
  const GANTT_X = 0.45 + LEFT_W + 0.1
  const GANTT_W = W - GANTT_X - 0.45
  const START_Y = 1.15
  const ROW_H   = (H - START_Y - 0.6) / phases.length
  const BAR_H   = ROW_H * 0.55
  const BAR_PAD = (ROW_H - BAR_H) / 2

  // Week grid lines + labels
  for (let wk = 0; wk <= totalWeeks; wk++) {
    const gx = GANTT_X + (wk / totalWeeks) * GANTT_W
    s.addShape('rect', { x:gx, y:START_Y, w:0.005, h:H-START_Y-0.55, fill:{ color:'2d3748' }, line:{ type:'none' } })
    if (wk < totalWeeks) {
      s.addText('Wk ' + wk, {
        x:gx, y:START_Y-0.3, w:GANTT_W/totalWeeks, h:0.28,
        fontSize:7, color:C.GRAY, fontFace:FONT, align:'center',
      })
    }
  }

  // header separator
  s.addShape('rect', { x:0.45, y:START_Y, w:W-0.9, h:0.015, fill:{ color:C.ORANGE }, line:{ type:'none' } })

  // Phase rows
  phases.forEach(function(ph, i) {
    const y      = START_Y + i * ROW_H
    const barX   = GANTT_X + (ph.start_week / totalWeeks) * GANTT_W
    const barW   = (ph.duration_weeks / totalWeeks) * GANTT_W
    const color  = ph.color || C.ORANGE

    // row bg alternating
    if (i % 2 === 0) {
      s.addShape('rect', { x:0.45, y:y+0.01, w:W-0.9, h:ROW_H-0.02, fill:{ color:'131820' }, line:{ type:'none' } })
    }

    // Phase label
    s.addText(ph.phase, {
      x:0.55, y:y+BAR_PAD, w:LEFT_W-0.2, h:BAR_H,
      fontSize:9.5, color:C.WHITE, fontFace:FONT, valign:'middle',
    })

    // Gantt bar
    s.addShape('rect', {
      x:barX, y:y+BAR_PAD, w:Math.max(barW,0.05), h:BAR_H,
      fill:{ color }, line:{ type:'none' }, rectRadius:0.04,
    })

    // duration label inside/beside bar
    s.addText(ph.duration_weeks + (ph.duration_weeks === 1 ? ' wk' : ' wks'), {
      x:barX+0.05, y:y+BAR_PAD, w:barW-0.1, h:BAR_H,
      fontSize:7.5, bold:true, color:C.WHITE, fontFace:FONT, valign:'middle', align:'center',
    })
  })

  // Footer — total duration
  const totalDur = phases[phases.length-1].start_week + phases[phases.length-1].duration_weeks
  s.addText('Total Estimated Duration: ' + totalDur + ' Weeks', {
    x:0.45, y:H-0.5, w:W-0.9, h:0.38,
    fontSize:10, bold:true, color:C.ORANGE, fontFace:FONT, align:'right',
  })
}

// ── Slide 8: Reference Projects ──────────────────────────────────────────────
function slide8References(pres, refs) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Reference Projects', 'Recent completed projects — available upon request')

  const fallback = [
    { client_name:'Mendel Residence',   project_type:'Basement',  address:'Dunwoody, GA',  contract_value:55394,  notes:'Full finish with custom bar, full bath, LVP, Dunwoody GA' },
    { client_name:'Park Residence',     project_type:'Kitchen',   address:'Woodstock, GA', contract_value:78200,  notes:'Open floor plan, quartz counters, KraftMaid cabinets' },
    { client_name:'Harris Residence',   project_type:'Addition',  address:'Canton, GA',    contract_value:148000, notes:'Bonus room over garage, seamless exterior match' },
  ]

  const projects = (refs && refs.length > 0) ? refs.slice(0,3) : fallback
  const bw = (W - 0.9) / 3

  projects.forEach(function(proj, i) {
    const x   = 0.45 + i * bw
    const col = [C.ORANGE, C.BLUE, C.GREEN][i]

    // Card
    s.addShape('rect', { x, y:1.15, w:bw-0.15, h:H-1.75, fill:{ color:C.SURFACE }, line:{ color:col, width:1.5 }, rectRadius:0.06 })
    s.addShape('rect', { x, y:1.15, w:bw-0.15, h:0.08,  fill:{ color:col }, line:{ type:'none' } })

    // Header row
    s.addText((proj.project_type||'Project').toUpperCase(), {
      x:x+0.15, y:1.32, w:bw-0.45, h:0.32,
      fontSize:9, bold:true, color:col, fontFace:FONT, charSpacing:1.5,
    })

    // Client / project name
    const displayName = proj.client_name
      ? proj.client_name.replace(/\b\w+$/, 'Family') // anonymize last name
      : 'Completed Project'
    s.addText(displayName, {
      x:x+0.15, y:1.65, w:bw-0.45, h:0.55,
      fontSize:15, bold:true, color:C.WHITE, fontFace:FONT,
    })

    // Address
    s.addText(proj.address || '', {
      x:x+0.15, y:2.18, w:bw-0.45, h:0.32,
      fontSize:9, color:C.GRAY, fontFace:FONT,
    })

    s.addShape('rect', { x:x+0.15, y:2.52, w:bw-0.45, h:0.02, fill:{ color:col }, line:{ type:'none' } })

    // Contract value
    if (proj.contract_value || proj.contractValue) {
      const val = proj.contract_value || proj.contractValue
      s.addText('Contract Value', { x:x+0.15, y:2.62, w:bw-0.45, h:0.28, fontSize:8, color:C.GRAY, fontFace:FONT })
      s.addText(fmt(val), { x:x+0.15, y:2.88, w:bw-0.45, h:0.42, fontSize:17, bold:true, color:C.WHITE, fontFace:FONT })
    }

    // Notes
    const notes = proj.notes || proj.description || ''
    if (notes) {
      s.addText(notes, {
        x:x+0.15, y:3.42, w:bw-0.45, h:2.5,
        fontSize:8.5, color:C.GRAY, fontFace:FONT, valign:'top', breakLine:true,
      })
    }

    s.addText('References available upon request', {
      x:x+0.15, y:H-0.55, w:bw-0.45, h:0.3,
      fontSize:7.5, color:C.DIM, fontFace:FONT, italic:true,
    })
  })
}

// ── Slide 9: Investment Summary ──────────────────────────────────────────────
function slide9Investment(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Investment Summary', 'All pricing includes materials, labor, permits, and project management')

  const tierKey = (p.tier||'better').toLowerCase()
  const tiers   = ['good','better','best','luxury']
  const tw      = (W - 0.9) / 4

  tiers.forEach(function(tier, i) {
    const isSelected = tier === tierKey
    const col        = TIER_COLOR[tier]
    const r          = TIER_RANGES[tier]
    const x          = 0.45 + i * tw

    s.addShape('rect', {
      x, y:1.15, w:tw-0.12, h:H-1.7,
      fill:{ color: isSelected ? C.SURFACE : C.BG },
      line:{ color: isSelected ? col : '2d3748', width: isSelected ? 2.5 : 1 },
      rectRadius:0.06,
    })

    if (isSelected) {
      s.addShape('rect', { x, y:1.15, w:tw-0.12, h:0.08, fill:{ color:col }, line:{ type:'none' } })
    }

    s.addText(TIER_LABEL[tier].toUpperCase(), {
      x:x+0.15, y:1.33, w:tw-0.42, h:0.42,
      fontSize:14, bold:true, color:isSelected?col:C.GRAY, fontFace:FONT, charSpacing:2,
    })
    s.addText(fmt(r.low), {
      x:x+0.15, y:1.78, w:tw-0.42, h:0.45,
      fontSize:18, bold:true, color:C.WHITE, fontFace:FONT,
    })
    s.addText('to ' + fmt(r.high), {
      x:x+0.15, y:2.22, w:tw-0.42, h:0.35,
      fontSize:13, color:C.GRAY, fontFace:FONT,
    })

    // divider
    s.addShape('rect', { x:x+0.15, y:2.6, w:tw-0.42, h:0.02, fill:{ color:isSelected?col:'2d3748' }, line:{ type:'none' } })

    const items = [
      'Materials at selected tier',
      'All labor & installation',
      'Permits & inspections',
      'Project management',
      'Site protection & cleanup',
      'Written workmanship warranty',
    ]
    items.forEach(function(item, bi) {
      s.addText('✓  ' + item, {
        x:x+0.15, y:2.72+bi*0.5, w:tw-0.35, h:0.45,
        fontSize:8.5, color:isSelected?C.WHITE:C.GRAY, fontFace:FONT,
      })
    })

    if (isSelected && p.contractValue) {
      s.addShape('rect', { x:x+0.1, y:H-0.55, w:tw-0.25, h:0.38, fill:{ color:col }, line:{ type:'none' }, rectRadius:0.04 })
      s.addText(fmt(p.contractValue) + '  ✓', {
        x:x+0.1, y:H-0.53, w:tw-0.25, h:0.34,
        fontSize:10, bold:true, color:C.WHITE, fontFace:FONT, align:'center',
      })
    }
  })
}

// ── Slide 10: Payment Milestone Schedule ─────────────────────────────────────
function slide10Payments(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Payment Milestone Schedule', 'Structured draw schedule tied to project milestones')

  const cv = parseFloat(p.contractValue) || 80000
  const milestones = [
    { milestone:'Contract Signing',              pct:10, trigger:'Upon execution of contract' },
    { milestone:'Permit Issuance / Mobilization',pct:25, trigger:'Permit approved, materials ordered' },
    { milestone:'Rough-In Complete',             pct:25, trigger:'Framing, MEP rough-in, inspection passed' },
    { milestone:'Drywall & Tile Complete',       pct:25, trigger:'All drywall finished, tile set' },
    { milestone:'Substantial Completion',        pct:10, trigger:'Fixtures installed, paint complete' },
    { milestone:'Final Punch List & Closeout',   pct:5,  trigger:'All punch list items resolved, CO issued' },
  ]

  const headerRow = [
    { text:'#',         options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Milestone', options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT } },
    { text:'%',         options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Amount',    options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT, align:'center' } },
    { text:'Trigger / Condition', options:{ bold:true, color:C.ORANGE, fill:{ color:C.NAVY }, fontSize:9, fontFace:FONT } },
  ]

  let running = 0
  const dataRows = milestones.map(function(m, i) {
    const amt = Math.round(cv * m.pct / 100)
    running += amt
    const bg = i % 2 === 0 ? C.SURFACE : C.BG
    const td = function(v, extra){ return { text:v, options:Object.assign({ color:C.WHITE, fill:{ color:bg }, fontSize:10, fontFace:FONT }, extra||{}) } }
    return [
      td(String(i+1), { align:'center', bold:true, color:C.ORANGE }),
      td(m.milestone,  { bold:true }),
      td(m.pct + '%',  { align:'center', color:C.GRAY }),
      td(fmt(amt),     { align:'center', bold:true, color:C.WHITE }),
      td(m.trigger,    { color:C.GRAY, fontSize:9 }),
    ]
  })

  s.addTable([headerRow, ...dataRows], {
    x:0.45, y:1.12, w:W-0.9,
    colW:[0.5, 3.2, 0.7, 1.5, 6.0],
    rowH:0.48,
    border:{ type:'solid', pt:0.5, color:'2d3748' },
    autoPage:false,
    fontSize:10, fontFace:FONT,
  })

  // Total row
  const totalY = 1.12 + (milestones.length+1) * 0.48 + 0.1
  s.addShape('rect', { x:0.45, y:totalY, w:W-0.9, h:0.5, fill:{ color:C.ORANGE }, line:{ type:'none' }, rectRadius:0.04 })
  s.addText('TOTAL CONTRACT VALUE', { x:0.65, y:totalY+0.05, w:5, h:0.4, fontSize:11, bold:true, color:C.WHITE, fontFace:FONT, charSpacing:1 })
  s.addText(fmt(cv), { x:W-3, y:totalY+0.05, w:2.4, h:0.4, fontSize:16, bold:true, color:C.WHITE, fontFace:FONT, align:'right' })

  s.addText('All payments due within 3 business days of milestone completion. Invoices issued electronically.', {
    x:0.45, y:H-0.45, w:W-0.9, h:0.35,
    fontSize:8, color:C.DIM, fontFace:FONT, italic:true,
  })
}

// ── Slide 11: Next Steps ─────────────────────────────────────────────────────
function slide11NextSteps(pres, p) {
  const s = pres.addSlide()
  s.background = { color:C.BG }
  slideHeader(s, 'Next Steps', 'Your path to a finished project starts here')

  const steps = [
    { n:'01', title:'Review & Approve Estimate',   body:'Log into your client portal at app.spanglerbuilt.com to review the full estimate, select your tier, and approve the scope of work.' },
    { n:'02', title:'Material Selections',          body:'Work with Michael to finalize your material selections — flooring, tile, cabinets, countertops, fixtures, and hardware.' },
    { n:'03', title:'Sign Contract',                body:'Once selections and scope are confirmed, we issue your construction contract with the milestone payment schedule.' },
    { n:'04', title:'Permit & Scheduling',          body:'We pull all required permits and schedule your project start date. Most projects begin within 2–4 weeks of contract signing.' },
    { n:'05', title:'Construction Begins',          body:'Your dedicated project manager oversees every phase. Real-time updates are posted in your client portal throughout the build.' },
  ]

  const bw  = (W - 0.9) / steps.length
  const col = [C.ORANGE, C.BLUE, C.GREEN, C.PURPLE, C.ORANGE2]

  steps.forEach(function(st, i) {
    const x = 0.45 + i * bw
    s.addShape('rect', { x, y:1.15, w:bw-0.12, h:H-1.75, fill:{ color:C.SURFACE }, line:{ color:col[i], width:1.5 }, rectRadius:0.06 })
    s.addShape('rect', { x, y:1.15, w:bw-0.12, h:0.08, fill:{ color:col[i] }, line:{ type:'none' } })

    // Step number circle
    s.addShape('ellipse', { x:x+(bw-0.12)/2-0.28, y:1.32, w:0.56, h:0.56, fill:{ color:col[i] }, line:{ type:'none' } })
    s.addText(st.n, { x:x+(bw-0.12)/2-0.28, y:1.32, w:0.56, h:0.56, fontSize:14, bold:true, color:C.WHITE, fontFace:FONT, align:'center', valign:'middle' })

    s.addText(st.title, {
      x:x+0.1, y:2.02, w:bw-0.32, h:0.65,
      fontSize:11, bold:true, color:C.WHITE, fontFace:FONT, align:'center', valign:'top',
    })

    s.addShape('rect', { x:x+0.2, y:2.68, w:bw-0.52, h:0.02, fill:{ color:col[i] }, line:{ type:'none' } })

    s.addText(st.body, {
      x:x+0.12, y:2.78, w:bw-0.32, h:3.0,
      fontSize:8.5, color:C.GRAY, fontFace:FONT, valign:'top', breakLine:true, align:'center',
    })
  })

  // CTA footer
  s.addShape('rect', { x:0, y:H-0.7, w:W, h:0.7, fill:{ color:C.NAVY }, line:{ type:'none' } })
  s.addText('Ready to get started? Contact Michael Spangler today.', {
    x:0, y:H-0.62, w:W*0.6, h:0.5,
    fontSize:12, bold:true, color:C.WHITE, fontFace:FONT, align:'center',
  })
  s.addText('michael@spanglerbuilt.com  ·  (404) 492-7650', {
    x:W*0.6, y:H-0.62, w:W*0.4-0.3, h:0.5,
    fontSize:11, color:C.ORANGE, fontFace:FONT, align:'right',
  })
}

// ── Main export ──────────────────────────────────────────────────────────────
export async function generatePresentationBook(project, materials, schedule, referenceProjects) {
  const pres = new PptxGenJS()
  pres.layout  = 'LAYOUT_WIDE'
  pres.author  = 'SpanglerBuilt Inc.'
  pres.company = 'SpanglerBuilt Inc.'
  pres.subject = (project.projectType || 'Renovation') + ' Presentation Book'
  pres.title   = 'SpanglerBuilt — ' + (project.clientName || 'Client') + ' Presentation'

  const p = {
    clientName:    project.clientName    || '',
    projectType:   project.projectType   || 'Renovation',
    address:       project.address       || '',
    sqft:          project.sqft          || '',
    projectId:     project.projectId     || '',
    tier:          project.tier          || 'better',
    contractValue: project.contractValue || 0,
    duration:      project.duration      || '12 weeks',
    preparedDate:  project.preparedDate  || new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
    location:      project.location      || project.address || '',
  }

  const mats = Array.isArray(materials) ? materials : []
  const sched = Array.isArray(schedule) && schedule.length > 0 ? schedule : DEFAULT_PHASES

  slide1Cover(pres, p)
  slide2About(pres)
  slide3Scope(pres, p)
  slide4Tiers(pres, p)
  materialSlide(pres, p, 'Material Selections — Flooring & Countertops', ['flooring','countertop','lvp','hardwood','vinyl','laminate'], mats)
  materialSlide(pres, p, 'Material Selections — Cabinets & Tile', ['cabinet','tile','backsplash','ceramic','porcelain'], mats)
  slide7Schedule(pres, p, sched)
  slide8References(pres, referenceProjects)
  slide9Investment(pres, p)
  slide10Payments(pres, p)
  slide11NextSteps(pres, p)

  const buf = await pres.write({ outputType: 'nodebuffer' })
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf)
}
