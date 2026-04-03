// POST /api/auth/client
// Looks up a client by email in the projects table.
// Returns the project row if found, 404 if not.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var email = (req.body.email || '').trim().toLowerCase()
  if (!email) return res.status(400).json({ error: 'Email required' })

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    var { data, error } = await supabase
      .from('projects')
      .select('id, project_number, client_name, client_email, project_type, address, budget_range, timeline, description, status, created_at')
      .ilike('client_email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return res.status(404).json({ error: 'No project found for this email.' })
    }

    return res.status(200).json({ project: data })
  } catch (e) {
    console.error('Client auth error:', e)
    return res.status(500).json({ error: 'Server error' })
  }
}
