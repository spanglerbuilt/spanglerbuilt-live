// GET → returns all 5 contract templates
import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { data, error } = await supabase
    .from('contract_templates')
    .select('id, name, project_type, version, is_active, section_3_text, updated_at')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })

  res.json({ templates: data || [] })
}
