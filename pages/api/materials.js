import { getAdminClient } from '../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  var query = supabase
    .from('materials')
    .select('*')
    .eq('active', true)
    .order('category')
    .order('tier')

  if (req.query.category)     query = query.eq('category', req.query.category)
  if (req.query.project_type) query = query.contains('project_types', [req.query.project_type])

  var { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  return res.json({ materials: data || [] })
}
