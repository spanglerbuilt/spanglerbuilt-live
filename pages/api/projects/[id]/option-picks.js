// GET  /api/projects/[id]/option-picks — fetch option picks for project
// POST /api/projects/[id]/option-picks — upsert option picks for project
import { getAdminClient } from '../../../../lib/supabase-server'

export default async function handler(req, res) {
  var { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing project id' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    var { data, error } = await supabase
      .from('project_option_picks')
      .select('picks, upgrade_delta, updated_at')
      .eq('project_id', id)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({
      picks:        data ? data.picks         : {},
      upgradeDelta: data ? data.upgrade_delta : 0,
    })
  }

  if (req.method === 'POST') {
    var body = req.body
    var { error: upsertError } = await supabase
      .from('project_option_picks')
      .upsert({
        project_id:    id,
        picks:         body.picks || {},
        upgrade_delta: body.upgradeDelta || 0,
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'project_id' })
    if (upsertError) return res.status(500).json({ error: upsertError.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
