// GET → returns all project_contracts with project info
import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { data, error } = await supabase
    .from('project_contracts')
    .select('*, projects(project_number, client_name, project_type)')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.json({ contracts: data || [] })
}
