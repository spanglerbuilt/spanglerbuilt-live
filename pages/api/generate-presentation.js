// pages/api/generate-presentation.js
// POST { projectId } → returns .pptx file download

import { generatePresentationBook } from '../../lib/generatePresentationBook'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectId } = req.body || {}
  if (!projectId) return res.status(400).json({ error: 'projectId required' })

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  let project = null, materials = [], schedule = [], refs = []

  // ── Fetch from Supabase if configured ─────────────────────────────────────
  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(supabaseUrl, supabaseKey)

      // Fetch project
      const { data: projData } = await sb
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle()
      project = projData

      if (project) {
        const tierKey = (project.tier || 'better').toLowerCase()

        // Fetch materials filtered by tier
        const { data: matData } = await sb
          .from('catalog_materials')
          .select('*')
          .ilike('tier', tierKey)
          .limit(60)
        materials = matData || []

        // Fetch project schedule
        const { data: schedData } = await sb
          .from('project_schedule')
          .select('*')
          .eq('project_id', projectId)
          .order('start_week', { ascending: true })
        schedule = schedData || []

        // Fetch 3 most recent completed reference projects
        const { data: refData } = await sb
          .from('projects')
          .select('id, client_name, project_type, address, status, updated_at, description, budget_range')
          .eq('status', 'completed')
          .order('updated_at', { ascending: false })
          .limit(3)
        refs = refData || []
      }
    } catch (err) {
      console.error('generate-presentation: Supabase fetch error:', err.message)
      // Fall through to mock data
    }
  }

  // ── Build project params (map DB fields → generator fields) ───────────────
  const raw = project || {}

  // Parse contract value from budget_range like "$80,000–$120,000" or raw number
  let contractValue = 0
  if (raw.contract_value) {
    contractValue = parseFloat(raw.contract_value)
  } else if (raw.budget_range) {
    const nums = (raw.budget_range || '').replace(/[$,K]/gi, function(c){
      return c.toLowerCase() === 'k' ? '000' : ''
    }).match(/\d+/g)
    if (nums && nums.length >= 2) contractValue = (parseInt(nums[0]) + parseInt(nums[1])) / 2
    else if (nums && nums.length === 1) contractValue = parseInt(nums[0])
  }

  // Extract sqft from description
  let sqft = raw.sqft || ''
  if (!sqft && raw.description) {
    const m = raw.description.match(/(\d+)\s*(?:sf|sq\s*ft)/i)
    if (m) sqft = m[1]
  }

  const projectParams = {
    clientName:    raw.client_name   || 'Client',
    projectType:   raw.project_type  || 'Renovation',
    address:       raw.address       || '',
    sqft,
    projectId:     raw.project_number || projectId,
    tier:          raw.tier          || 'better',
    contractValue: contractValue     || 80000,
    duration:      raw.duration      || '12 weeks',
    preparedDate:  new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' }),
    location:      raw.address       || '',
  }

  // ── Generate PPTX ─────────────────────────────────────────────────────────
  try {
    const buffer = await generatePresentationBook(projectParams, materials, schedule, refs)

    // Derive filename from client last name
    const lastName = (projectParams.clientName || 'Client').trim().split(/\s+/).pop().replace(/[^a-zA-Z0-9]/g, '')
    const filename  = `SpanglerBuilt_${lastName}_PresentationBook.pptx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', buffer.length)
    return res.status(200).send(buffer)
  } catch (err) {
    console.error('generate-presentation: PPTX generation error:', err)
    return res.status(500).json({ error: 'Failed to generate presentation: ' + err.message })
  }
}
