// GET  /api/projects/[id]/estimate — fetch estimate for project
// POST /api/projects/[id]/estimate — upsert estimate for project
import { getAdminClient } from '../../../../lib/supabase-server'

export default async function handler(req, res) {
  var { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing project id' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    var { data, error } = await supabase
      .from('project_estimates')
      .select('*')
      .eq('project_id', id)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ estimate: null })
    return res.status(200).json({
      estimate: {
        tier:             data.tier,
        label:            data.label,
        grand:            data.grand,
        direct:           data.direct,
        cont:             data.cont,
        op:               data.op,
        tax:              data.tax,
        activeDivisions:  data.active_divisions,
        confirmedAt:      data.confirmed_at,
      }
    })
  }

  if (req.method === 'POST') {
    var body = req.body
    var { error: upsertError } = await supabase
      .from('project_estimates')
      .upsert({
        project_id:       id,
        tier:             body.tier,
        label:            body.label,
        grand:            body.grand,
        direct:           body.direct,
        cont:             body.cont,
        op:               body.op,
        tax:              body.tax,
        active_divisions: body.activeDivisions,
        confirmed_at:     body.confirmedAt || new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      }, { onConflict: 'project_id' })
    if (upsertError) return res.status(500).json({ error: upsertError.message })

    // Keep projects.estimate_total and selected_tier in sync
    await supabase.from('projects').update({
      estimate_total: body.grand,
      selected_tier:  body.tier,
      updated_at:     new Date().toISOString(),
    }).eq('id', id)

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
