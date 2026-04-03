// POST /api/leads/update-status
// { projectId, projectNumber, status }
// Updates project status in Supabase, then syncs deal stage to HubSpot.

var SUPABASE_TO_HUBSPOT = {
  new_lead:      'appointmentscheduled',
  contacted:     'qualifiedtobuy',
  proposal_sent: 'contractsent',
  in_progress:   'decisionmakerboughtin',
  closed_won:    'closedwon',
  closed_lost:   'closedlost',
}

async function syncHubSpot(projectNumber, stage) {
  var key = process.env.HUBSPOT_API_KEY
  if (!key) return

  // Search for the deal by project number in the name
  var search = await fetch('https://api.hubapi.com/crm/v3/objects/deals/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'dealname', operator: 'CONTAINS_TOKEN', value: projectNumber }] }],
      properties: ['dealname', 'dealstage'],
      limit: 1,
    }),
  })
  var data = await search.json()
  if (!data.results || data.results.length === 0) return

  var dealId = data.results[0].id
  await fetch('https://api.hubapi.com/crm/v3/objects/deals/' + dealId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
    body: JSON.stringify({ properties: { dealstage: stage } }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var projectId     = req.body.projectId
  var projectNumber = req.body.projectNumber
  var status        = req.body.status

  if (!projectId || !status) return res.status(400).json({ error: 'projectId and status required' })

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Database not configured' })
  }

  try {
    var { createClient } = await import('@supabase/supabase-js')
    var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    var { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId)

    if (error) return res.status(500).json({ error: error.message })

    // Sync to HubSpot asynchronously — don't block the response
    if (projectNumber && SUPABASE_TO_HUBSPOT[status]) {
      syncHubSpot(projectNumber, SUPABASE_TO_HUBSPOT[status]).catch(function(e) {
        console.error('HubSpot sync error:', e)
      })
    }

    return res.status(200).json({ ok: true })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
