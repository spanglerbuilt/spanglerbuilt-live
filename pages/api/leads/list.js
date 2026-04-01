// GET /api/leads/list — returns leads from Supabase for the contractor dashboard
// Falls back to empty array if Supabase is not configured

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  var supabaseUrl = process.env.SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Supabase not configured yet — return empty so the page shows mock data
    return res.status(200).json({ leads: [], source: 'none' })
  }

  try {
    var supabaseLib = await import('@supabase/supabase-js')
    var supabase = supabaseLib.createClient(supabaseUrl, supabaseKey)

    var { data, error } = await supabase
      .from('projects')
      .select('id, project_number, client_name, client_email, project_type, address, budget_range, timeline, description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    var leads = (data || []).map(function(row, i) {
      var statusMap = {
        new_lead:  'New lead',
        contacted: 'Contacted',
        estimate:  'Estimate',
        approved:  'Approved',
        started:   'Started',
        completed: 'Completed',
        lost:      'Lost',
      }
      var created = new Date(row.created_at)
      var dateStr = created.toLocaleDateString('en-US', { month:'short', day:'numeric' })
      return {
        id:      row.id || (10000 + i),
        pn:      row.project_number || ('SB-WEB-' + String(i+1).padStart(3,'0')),
        name:    row.client_name    || 'Unknown',
        type:    row.project_type   || 'Other',
        value:   0,
        status:  statusMap[row.status] || 'New lead',
        date:    dateStr,
        address: row.address        || '',
        phone:   '',
        email:   row.client_email   || '',
        note:    (row.description   || '') + (row.budget_range ? '\nBudget: ' + row.budget_range : '') + (row.timeline ? '\nTimeline: ' + row.timeline : ''),
        fromWeb: true,
      }
    })

    return res.status(200).json({ leads, source: 'supabase' })
  } catch(err) {
    console.error('leads/list error:', err)
    return res.status(200).json({ leads: [], source: 'error', message: err.message })
  }
}
