// pages/api/qa/submit-feedback.js
// POST { tester_email, tester_name, page_url, page_name, feedback_type, comment, screenshot_url }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var { tester_email, tester_name, page_url, page_name, feedback_type, comment, screenshot_url } = req.body || {}

  if (!comment || !tester_email) return res.status(400).json({ error: 'comment and tester_email required' })

  var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var sb = createClient(supabaseUrl, supabaseKey)

    var { error: insertError } = await sb.from('qa_feedback').insert({
      tester_email:  tester_email.toLowerCase().trim(),
      tester_name:   tester_name || null,
      page_url:      page_url || '',
      page_name:     page_name || '',
      feedback_type: feedback_type || 'bug',
      comment:       comment.trim(),
      screenshot_url: screenshot_url || null,
      status:        'open',
    })

    if (insertError) throw new Error(insertError.message)

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('qa/submit-feedback error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
