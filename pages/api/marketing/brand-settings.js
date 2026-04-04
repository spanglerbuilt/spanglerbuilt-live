// GET  /api/marketing/brand-settings           → { settings: {key:value,...} }
// POST /api/marketing/brand-settings { key, value, updated_by }  → upsert

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('brand_settings')
      .select('key, value, updated_at')
    if (error) return res.status(500).json({ error: error.message })
    const settings = {}
    ;(data || []).forEach(function(row) { settings[row.key] = row.value || '' })
    return res.status(200).json({ settings })
  }

  if (req.method === 'POST') {
    const { key, value, updated_by } = req.body || {}
    if (!key) return res.status(400).json({ error: 'key required' })

    const { error } = await supabase
      .from('brand_settings')
      .upsert({ key, value: value || '', updated_by: updated_by || null, updated_at: new Date().toISOString() }, { onConflict: 'key' })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
