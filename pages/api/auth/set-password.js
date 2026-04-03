// POST /api/auth/set-password
// { email, password } → hashes and stores password, clears must_change_password

import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var email    = (req.body.email    || '').trim().toLowerCase()
  var password = (req.body.password || '').trim()

  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
  if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' })

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    var hash = await bcrypt.hash(password, 12)

    var { data, error } = await supabase
      .from('staff')
      .update({ password_hash: hash, must_change_password: false })
      .ilike('email', email)
      .select('role, email')
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'Account not found.' })
    }

    return res.status(200).json({ ok: true, role: data.role, email: data.email })
  } catch (e) {
    console.error('Set password error:', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
