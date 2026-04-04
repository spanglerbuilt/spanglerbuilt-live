// pages/api/catalog/variants.js
// GET  ?material_id=xxx              → { variants }
// POST { material_id, variant_type, variant_name, price_delta, price_override, in_stock, sort_order }
// PUT  { id, variant_name, price_delta, price_override, in_stock, sort_order }
// DELETE ?id=xxx                      → { ok }

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // ── GET ──────────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const { material_id } = req.query
    if (!material_id) return res.status(400).json({ error: 'material_id required' })

    const { data, error } = await supabase
      .from('catalog_variants')
      .select('*')
      .eq('material_id', material_id)
      .order('variant_type')
      .order('sort_order')
      .order('variant_name')

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ variants: data || [] })
  }

  // ── POST — create ─────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { material_id, variant_type, variant_name, price_delta, price_override, in_stock, sort_order } = req.body || {}
    if (!material_id || !variant_type || !variant_name) {
      return res.status(400).json({ error: 'material_id, variant_type, and variant_name required' })
    }

    const { data, error } = await supabase
      .from('catalog_variants')
      .insert({
        material_id,
        variant_type:   variant_type.toLowerCase().trim(),
        variant_name:   variant_name.trim(),
        price_delta:    parseFloat(price_delta) || 0,
        price_override: price_override !== '' && price_override != null ? parseFloat(price_override) : null,
        in_stock:       in_stock !== false,
        sort_order:     parseInt(sort_order) || 0,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, variant: data })
  }

  // ── PUT — update ──────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    const { id, variant_name, price_delta, price_override, in_stock, sort_order } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })

    const update = {}
    if (variant_name  != null) update.variant_name   = variant_name.trim()
    if (price_delta   != null) update.price_delta    = parseFloat(price_delta) || 0
    if (in_stock      != null) update.in_stock       = in_stock
    if (sort_order    != null) update.sort_order     = parseInt(sort_order) || 0
    update.price_override = (price_override !== '' && price_override != null) ? parseFloat(price_override) : null

    const { data, error } = await supabase
      .from('catalog_variants')
      .update(update)
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, variant: data })
  }

  // ── DELETE ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'id required' })

    const { error } = await supabase
      .from('catalog_variants')
      .delete()
      .eq('id', id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
