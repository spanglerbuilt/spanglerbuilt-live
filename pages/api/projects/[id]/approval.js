// GET  /api/projects/[id]/approval — fetch approval status for project
// POST /api/projects/[id]/approval — upsert approval for project
import { getAdminClient } from '../../../../lib/supabase-server'

export default async function handler(req, res) {
  var { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing project id' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    var { data, error } = await supabase
      .from('project_approvals')
      .select('approved, approved_at')
      .eq('project_id', id)
      .maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ approved: data ? data.approved : false })
  }

  if (req.method === 'POST') {
    var body = req.body
    var now = new Date().toISOString()
    var { error: upsertError } = await supabase
      .from('project_approvals')
      .upsert({
        project_id:  id,
        approved:    body.approved === true,
        approved_at: body.approved ? now : null,
        updated_at:  now,
      }, { onConflict: 'project_id' })
    if (upsertError) return res.status(500).json({ error: upsertError.message })

    // Also bump the project status to 'approved' when true
    if (body.approved) {
      await supabase.from('projects').update({
        status:     'approved',
        updated_at: now,
      }).eq('id', id)
    }

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
