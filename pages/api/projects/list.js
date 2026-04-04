// GET /api/projects/list — active projects for AI Tools page selector
import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { data, error } = await supabase
    .from('projects')
    .select('id, project_number, client_name, project_type, address, budget_range, description, status, estimate_total, selected_tier, created_at')
    .not('status', 'in', '("lost","completed")')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ projects: data || [] })
}
