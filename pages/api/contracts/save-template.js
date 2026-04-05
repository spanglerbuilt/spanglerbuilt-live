// POST { projectType, section3Text } → upserts template in Supabase, increments version
import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectType, section3Text } = req.body || {}
  if (!projectType || !section3Text) return res.status(400).json({ error: 'projectType and section3Text required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch existing to get version
  const { data: existing } = await supabase
    .from('contract_templates')
    .select('id, version')
    .eq('project_type', projectType)
    .eq('is_active', true)
    .single()

  const oldVer  = parseFloat(existing?.version || '2.0') || 2.0
  const newVer  = (Math.round(oldVer * 10) + 1) / 10  // bump by 0.1
  const verStr  = newVer.toFixed(1)

  if (existing?.id) {
    const { error } = await supabase
      .from('contract_templates')
      .update({ section_3_text: section3Text, version: verStr, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return res.status(500).json({ error: error.message })
  } else {
    const name = projectType + ' Contract'
    const { error } = await supabase
      .from('contract_templates')
      .insert({ name, project_type: projectType, section_3_text: section3Text, version: verStr })
    if (error) return res.status(500).json({ error: error.message })
  }

  res.json({ ok: true, version: verStr })
}
