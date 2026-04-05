// GET ?id=contractId → returns single contract with project info
import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'id required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { data, error } = await supabase
    .from('project_contracts')
    .select('*, projects(id, project_number, client_name, client_2_name, client_email, project_type)')
    .eq('id', id)
    .single()

  if (error || !data) return res.status(404).json({ error: 'Contract not found' })

  res.json({ contract: data })
}
