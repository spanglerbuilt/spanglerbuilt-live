// POST /api/hubspot/webhook
// Receives HubSpot webhook events.
// Validates signature using HUBSPOT_CLIENT_SECRET.
// When a deal stage changes, updates the matching Supabase project status.
//
// Register this URL in HubSpot:
//   App settings → Webhooks → Target URL: https://app.spanglerbuilt.com/api/hubspot/webhook
//   Subscribe to: deal.propertyChange (dealstage)

import crypto from 'crypto'

// Raw body needed for signature validation — disable Next.js body parser
export const config = { api: { bodyParser: false } }

// HubSpot deal stage → Supabase project status
var STAGE_MAP = {
  appointmentscheduled:  'contacted',
  qualifiedtobuy:        'contacted',
  presentationscheduled: 'proposal_sent',
  decisionmakerboughtin: 'proposal_sent',
  contractsent:          'proposal_sent',
  closedwon:             'closed_won',
  closedlost:            'closed_lost',
}

async function readRawBody(req) {
  return new Promise(function(resolve, reject) {
    var chunks = []
    req.on('data', function(c) { chunks.push(c) })
    req.on('end',  function()  { resolve(Buffer.concat(chunks)) })
    req.on('error', reject)
  })
}

function validateSignature(rawBody, headers) {
  var secret = process.env.HUBSPOT_CLIENT_SECRET
  if (!secret) return false

  // v3: HMAC-SHA256(clientSecret, method+url+body+timestamp), base64
  var sigV3 = headers['x-hubspot-signature-v3']
  var tsHeader = headers['x-hubspot-request-timestamp']
  if (sigV3 && tsHeader) {
    var age = Math.abs(Date.now() - parseInt(tsHeader, 10))
    if (age > 300000) return false // reject if > 5 min old
    // HubSpot v3 uses full URL — we reconstruct from host header
    var host = headers['x-forwarded-host'] || headers['host'] || 'app.spanglerbuilt.com'
    var url = 'https://' + host + '/api/hubspot/webhook'
    var source = 'POST' + url + rawBody.toString('utf8') + tsHeader
    var expected = crypto.createHmac('sha256', secret).update(source).digest('base64')
    try { return crypto.timingSafeEqual(Buffer.from(sigV3), Buffer.from(expected)) } catch(_) { return false }
  }

  // v1: SHA256(clientSecret + rawBody) as hex
  var sigV1 = headers['x-hubspot-signature']
  if (sigV1) {
    var hash = crypto.createHash('sha256').update(secret + rawBody.toString('utf8')).digest('hex')
    try { return crypto.timingSafeEqual(Buffer.from(sigV1), Buffer.from(hash)) } catch(_) { return false }
  }

  return false
}

async function fetchDeal(dealId) {
  var r = await fetch(
    'https://api.hubapi.com/crm/v3/objects/deals/' + dealId + '?properties=dealname,dealstage',
    { headers: { Authorization: 'Bearer ' + process.env.HUBSPOT_API_KEY } }
  )
  if (!r.ok) return null
  return r.json()
}

async function updateProjectStatus(projectNumber, status, supabase) {
  return supabase
    .from('projects')
    .update({ status })
    .eq('project_number', projectNumber)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var rawBody = await readRawBody(req)

  // Validate signature
  if (!validateSignature(rawBody, req.headers)) {
    console.warn('HubSpot webhook: invalid signature')
    return res.status(401).json({ error: 'Invalid signature' })
  }

  var events
  try { events = JSON.parse(rawBody.toString('utf8')) } catch(_) {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (!Array.isArray(events) || events.length === 0) return res.status(200).end()

  // Only process deal stage changes
  var stageChanges = events.filter(function(e) {
    return e.subscriptionType === 'deal.propertyChange' && e.propertyName === 'dealstage'
  })

  if (stageChanges.length === 0) return res.status(200).end()

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(200).json({ skipped: 'Supabase not configured' })
  }

  var { createClient } = await import('@supabase/supabase-js')
  var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

  var results = await Promise.allSettled(stageChanges.map(async function(event) {
    var dealId    = event.objectId
    var newStage  = event.propertyValue
    var status    = STAGE_MAP[newStage]
    if (!status) return { skipped: 'No mapping for stage: ' + newStage }

    // Fetch deal name to extract SB project number
    var deal = await fetchDeal(dealId)
    if (!deal) return { skipped: 'Deal not found: ' + dealId }

    var dealName = (deal.properties && deal.properties.dealname) || ''
    var match = dealName.match(/SB-\d{4}-\d{3,}/)
    if (!match) return { skipped: 'No project number in deal name: ' + dealName }

    var projectNumber = match[0]
    await updateProjectStatus(projectNumber, status, supabase)
    console.log('HubSpot webhook: ' + projectNumber + ' → ' + status)
    return { ok: true, projectNumber, status }
  }))

  return res.status(200).json({ processed: results.length })
}
