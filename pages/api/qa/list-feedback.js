// pages/api/qa/list-feedback.js
// GET — returns all qa_feedback rows ordered newest first

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var sb = createClient(supabaseUrl, supabaseKey)

    var { data, error } = await sb
      .from('qa_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return res.status(200).json({ items: data || [] })
  } catch (err) {
    console.error('qa/list-feedback error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
