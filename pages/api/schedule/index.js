// GET  /api/schedule?projectId=xxx  — fetch tasks
// POST /api/schedule                — save tasks

export default async function handler(req, res) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  var { createClient } = await import('@supabase/supabase-js')
  var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  if (req.method === 'GET') {
    var projectId = req.query.projectId
    if (!projectId) return res.status(400).json({ error: 'projectId required' })

    var { data, error } = await supabase
      .from('schedule_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: true })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ tasks: data || [] })
  }

  if (req.method === 'POST') {
    var { projectId, tasks } = req.body
    if (!projectId || !tasks) return res.status(400).json({ error: 'projectId and tasks required' })

    // Delete existing and re-insert (simple replace strategy)
    await supabase.from('schedule_tasks').delete().eq('project_id', projectId)

    if (tasks.length > 0) {
      var rows = tasks.map(function(t) {
        return {
          project_id:  projectId,
          task_id:     t.id,
          name:        t.name,
          start_date:  t.start,
          end_date:    t.end,
          progress:    t.progress || 0,
          dependencies: t.dependencies || '',
        }
      })
      var { error: insertErr } = await supabase.from('schedule_tasks').insert(rows)
      if (insertErr) return res.status(500).json({ error: insertErr.message })
    }

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
