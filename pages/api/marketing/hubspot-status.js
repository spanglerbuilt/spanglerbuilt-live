export default async function handler(req, res) {
  var key = process.env.HUBSPOT_API_KEY
  if (!key) return res.status(200).json({ connected: false })

  // Verify the key is still valid
  try {
    var test = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: 'Bearer ' + key },
    })
    return res.status(200).json({ connected: test.ok })
  } catch(_) {
    return res.status(200).json({ connected: false })
  }
}
