// GET /api/projects/[id]/book
// Returns all data needed to render the project book for a given project id.
import { getAdminClient } from '../../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  var { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing project id' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch all four tables in parallel
  var [projRes, estimateRes, selRes, picksRes, approvalRes] = await Promise.all([
    supabase.from('projects').select('id, project_number, client_name, client_email, project_type, address, status').eq('id', id).maybeSingle(),
    supabase.from('project_estimates').select('tier, label, grand, direct, cont, op, tax, active_divisions, confirmed_at').eq('project_id', id).maybeSingle(),
    supabase.from('project_selections').select('selections').eq('project_id', id).maybeSingle(),
    supabase.from('project_option_picks').select('picks, upgrade_delta').eq('project_id', id).maybeSingle(),
    supabase.from('project_approvals').select('approved, approved_at').eq('project_id', id).maybeSingle(),
  ])

  if (projRes.error)    return res.status(500).json({ error: projRes.error.message })
  if (!projRes.data)    return res.status(404).json({ error: 'Project not found' })

  var est = estimateRes.data
  return res.status(200).json({
    project: projRes.data,
    estimate: est ? {
      tier:            est.tier,
      label:           est.label,
      grand:           est.grand,
      direct:          est.direct,
      cont:            est.cont,
      op:              est.op,
      tax:             est.tax,
      activeDivisions: est.active_divisions,
      confirmedAt:     est.confirmed_at,
    } : null,
    selections:   selRes.data    ? selRes.data.selections       : {},
    optionPicks:  picksRes.data  ? picksRes.data.picks          : {},
    upgradeDelta: picksRes.data  ? picksRes.data.upgrade_delta  : 0,
    approved:     approvalRes.data ? approvalRes.data.approved  : false,
  })
}
