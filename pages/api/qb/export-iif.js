// POST { projectId } → downloads .iif file
// Pulls project + estimate from Supabase and generates QuickBooks IIF

import { getAdminClient } from '../../../lib/supabase-server'
import { generateIIF } from '../../../lib/generateQBExport'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectId } = req.body || {}
  if (!projectId) return res.status(400).json({ error: 'projectId required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('id, project_number, client_name, project_type, selected_tier, estimate_total')
    .eq('id', projectId)
    .single()

  if (projErr || !project) return res.status(404).json({ error: 'Project not found' })

  // Fetch estimate
  const { data: estimate } = await supabase
    .from('project_estimates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const projData = {
    client_name:    project.client_name,
    project_number: project.project_number,
    project_type:   project.project_type,
  }

  const estData = estimate ? {
    tier:             estimate.tier || project.selected_tier || 'good',
    activeDivisions:  estimate.divisions || [],
  } : {
    tier: project.selected_tier || 'good',
    activeDivisions: [],
  }

  const iif      = generateIIF(projData, estData)
  const filename = 'SpanglerBuilt_' + (project.project_number || projectId) + '_Invoice.iif'

  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"')
  res.send(iif)
}
