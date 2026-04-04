// pages/api/qa/update-feedback.js
// POST { id, status } — updates qa_feedback.status

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var { id, status } = req.body || {}
  if (!id || !status) return res.status(400).json({ error: 'id and status required' })

  var allowed = ['open', 'in_progress', 'resolved']
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' })

  var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var sb = createClient(supabaseUrl, supabaseKey)

    var { error } = await sb
      .from('qa_feedback')
      .update({ status })
      .eq('id', id)

    if (error) throw new Error(error.message)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('qa/update-feedback error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
