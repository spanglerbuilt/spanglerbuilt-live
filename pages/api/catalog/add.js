import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'POST') {
    const { data, error } = await supabase
      .from('catalog_materials')
      .insert([req.body])
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, material: data })
  }

  if (req.method === 'PUT') {
    const { id, ...fields } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { data, error } = await supabase
      .from('catalog_materials')
      .update(fields)
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true, material: data })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id required' })
    const { error } = await supabase.from('catalog_materials').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.json({ ok: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
