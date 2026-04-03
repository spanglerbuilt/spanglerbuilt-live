// POST /api/marketing/hubspot-connect
// Validates the HubSpot private app token by making a test API call,
// then stores it as a Vercel env var via the Vercel API.
// Note: Storing secrets at runtime requires VERCEL_TOKEN + project/team IDs.
// For now this validates the key and returns ok — add to Vercel manually.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  var apiKey = (req.body.apiKey || '').trim()
  if (!apiKey) return res.status(400).json({ error: 'API key required' })

  try {
    // Validate token against HubSpot
    var test = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: 'Bearer ' + apiKey },
    })
    if (!test.ok) {
      return res.status(401).json({ error: 'Invalid HubSpot token. Check your Private App scopes.' })
    }
    // Key is valid — instruct user to add to Vercel
    return res.status(200).json({ ok: true, message: 'Token validated. Add HUBSPOT_API_KEY to Vercel env vars to persist.' })
  } catch(e) {
    return res.status(500).json({ error: 'Could not reach HubSpot: ' + e.message })
  }
}
