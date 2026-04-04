// GET  ?projectId=xxx           → { phases }
// POST { projectId, phases }    → replace all phases for project
// DELETE ?projectId=xxx         → delete all phases for project

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // ── GET ───────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { projectId } = req.query
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    const { data, error } = await supabase
      .from('project_schedule')
      .select('*')
      .eq('project_id', projectId)
      .order('start_week')

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ phases: data || [] })
  }

  // ── POST — replace all phases ─────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { projectId, phases } = req.body || {}
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    // Delete existing
    const { error: delErr } = await supabase
      .from('project_schedule')
      .delete()
      .eq('project_id', projectId)

    if (delErr) return res.status(500).json({ error: delErr.message })

    if (phases && phases.length > 0) {
      const rows = phases.map(function(p) {
        return {
          project_id:     projectId,
          phase:          p.phase,
          start_week:     parseInt(p.start_week) || 0,
          duration_weeks: parseInt(p.duration_weeks) || 1,
          color:          (p.color || 'D06830').replace('#', ''),
        }
      })
      const { error: insErr } = await supabase.from('project_schedule').insert(rows)
      if (insErr) return res.status(500).json({ error: insErr.message })
    }

    return res.status(200).json({ ok: true })
  }

  // ── DELETE — clear project schedule ───────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { projectId } = req.query
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    const { error } = await supabase
      .from('project_schedule')
      .delete()
      .eq('project_id', projectId)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
