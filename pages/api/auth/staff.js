// POST /api/auth/staff
// { email }             → check if staff account exists, returns { firstLogin } or { needsPassword }
// { email, password }   → validate password, returns { role }
// POST /api/auth/staff/set-password handled separately

import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var email    = (req.body.email    || '').trim().toLowerCase()
  var password = (req.body.password || '').trim()

  if (!email) return res.status(400).json({ error: 'Email required' })

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    var { data: staff, error } = await supabase
      .from('staff')
      .select('id, email, role, password_hash, must_change_password')
      .ilike('email', email)
      .single()

    if (error || !staff) {
      return res.status(404).json({ error: 'No account found for this email.' })
    }

    // First login — no password set yet
    if (staff.must_change_password || !staff.password_hash) {
      return res.status(200).json({ firstLogin: true, role: staff.role })
    }

    // Password required but not provided
    if (!password) {
      return res.status(200).json({ needsPassword: true, role: staff.role })
    }

    // Validate password
    var valid = await bcrypt.compare(password, staff.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    return res.status(200).json({ ok: true, role: staff.role, email: staff.email })
  } catch (e) {
    console.error('Staff auth error:', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
