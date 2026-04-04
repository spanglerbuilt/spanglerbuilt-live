// GET  /api/marketing/social-posts           → { posts }
// POST /api/marketing/social-posts { post }  → { ok, id }

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ posts: data || [] })
  }

  if (req.method === 'POST') {
    const p = req.body || {}
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        video_url:    p.video_url    || null,
        title:        p.title        || '',
        caption:      p.caption      || '',
        description:  p.description  || '',
        platforms:    p.platforms    || [],
        scheduled_at: p.scheduled_at || null,
        status:       p.status       || 'scheduled',
        posted_by:    p.posted_by    || null,
      })
      .select('id')
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, id: data.id })
  }

  return res.status(405).end()
}
