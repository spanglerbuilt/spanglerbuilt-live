// pages/api/invite-qa-tester.js
// POST { email, name } — adds tester to qa_testers and sends invite email via Resend

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var { email, name } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })

  var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  var resendKey   = process.env.RESEND_API_KEY

  if (!supabaseUrl || !supabaseKey) return res.status(500).json({ error: 'Supabase not configured' })

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var sb = createClient(supabaseUrl, supabaseKey)

    // Insert or re-activate tester
    var { data: tester, error: upsertError } = await sb
      .from('qa_testers')
      .upsert({ email: email.toLowerCase().trim(), name: name || null, active: true }, { onConflict: 'email' })
      .select()
      .single()

    if (upsertError) throw new Error(upsertError.message)

    // Send invite email via Resend
    if (resendKey) {
      var greeting = name ? ('Hi ' + name + ',') : 'Hi,'
      var body = greeting + '\n\nMichael Spangler has invited you to preview and test the new SpanglerBuilt client portal.\n\nAccess the QA portal here:\nhttps://qa.spanglerbuilt.com\n\nUse this email address to log in: ' + email + '\n\nAs you explore, use the orange 💬 Feedback button on any page to report bugs or leave comments. Your feedback helps us build a better experience.\n\nThank you for your time!\n\nMichael Spangler\nSpanglerBuilt Inc. · Design/Build Contractor · GC & Home Builder\n44 Milton Ave, Alpharetta, GA 30009\n(404) 492-7650'

      var emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + resendKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'michael@spanglerbuilt.com',
          to:      [email.trim()],
          subject: "You're invited to test the SpanglerBuilt portal",
          text:    body,
          html:    body
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>')
            .replace(/(https:\/\/qa\.spanglerbuilt\.com)/g, '<a href="$1" style="color:#FF8C00">$1</a>'),
        }),
      })

      if (!emailRes.ok) {
        var emailJson = await emailRes.json()
        console.error('invite-qa-tester: Resend error:', emailJson)
        // Don't fail the request — tester was still added
      }
    }

    return res.status(200).json({ ok: true, tester })
  } catch (err) {
    console.error('invite-qa-tester error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
