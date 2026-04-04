// GET  /api/marketing/campaigns           → { campaigns }
// POST /api/marketing/campaigns { campaign } → { ok, id }

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ campaigns: data || [] })
  }

  if (req.method === 'POST') {
    const c = req.body || {}
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name:          c.name          || 'Untitled Campaign',
        target_areas:  c.target_areas  || [],
        target_zip_codes: c.target_zip_codes || [],
        demographic:   c.demographic   || {},
        project_types: c.project_types || [],
        campaign_type: c.campaign_type || '',
        budget:        parseFloat(c.budget) || null,
        budget_period: c.budget_period || 'monthly',
        status:        c.status        || 'draft',
        ai_copy:       c.ai_copy       || null,
        created_by:    c.created_by    || null,
      })
      .select('id')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, id: data.id })
  }

  return res.status(405).end()
}
