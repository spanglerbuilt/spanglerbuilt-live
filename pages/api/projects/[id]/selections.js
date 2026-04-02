// GET  /api/projects/[id]/selections — fetch material selections for project
// POST /api/projects/[id]/selections — upsert material selections for project
import { getAdminClient } from '../../../../lib/supabase-server'

export default async function handler(req, res) {
  var { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing project id' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    var { data, error } = await supabase
      .from('project_selections')
      .select('selections, updated_at')
      .eq('project_id', id)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ selections: data ? data.selections : {} })
  }

  if (req.method === 'POST') {
    var body = req.body
    var { error: upsertError } = await supabase
      .from('project_selections')
      .upsert({
        project_id: id,
        selections: body.selections || body,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'project_id' })
    if (upsertError) return res.status(500).json({ error: upsertError.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
