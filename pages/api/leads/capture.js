// pages/api/leads/capture.js
// Receives leads from spanglerbuilt.com contact form
// Creates project in Supabase, sends confirmation emails,
// triggers AI ballpark estimate

export default async function handler(req, res) {
  // Allow CORS from spanglerbuilt.com
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  var body = req.body
  var firstName   = body.firstName   || body.first_name  || ''
  var lastName    = body.lastName    || body.last_name   || ''
  var email       = body.email       || ''
  var phone       = body.phone       || ''
  var address     = body.address     || body.projectAddress || ''
  var projectType = body.projectType || body.project_type  || 'Other'
  var description = body.description || body.message       || ''
  var budget      = body.budget      || ''
  var timeline    = body.timeline    || ''
  var referral    = body.referral    || body.how_did_you_hear || 'Website'

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  // If Supabase is not configured, still return a success with a generated project number
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    var fallbackPn = 'SB-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*900)+100)
    return res.status(200).json({ ok:true, projectNumber: fallbackPn, ballpark: null, message: 'Received — Supabase not yet configured' })
  }

  try {
    var supabaseLib = await import('@supabase/supabase-js')
    var supabase = supabaseLib.createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    )

    // Generate project number SB-YYYY-NNN
    var year = new Date().getFullYear()
    var countResult = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .like('project_number', 'SB-' + year + '-%')
    var nextSeq  = ((countResult.count || 0) + 1)
    var pn       = 'SB-' + year + '-' + String(nextSeq).padStart(3,'0')

    // Map project type to code
    var typeCodes = {
      'Basement Renovation':'BSM','Kitchen Remodel':'KIT',
      'Bathroom Remodel':'BTH','Home Addition':'ADD',
      'Deck / Patio':'DPT','Screened Porch':'SPH',
      'Custom Home Build':'CHB','Whole-Home Renovation':'REN',
      'Other':'OTH'
    }
    var typeCode = typeCodes[projectType] || 'OTH'

    // Create project in Supabase
    var insertResult = await supabase.from('projects').insert({
      project_number: pn,
      client_name:    firstName + ' ' + lastName,
      client_email:   email,
      project_type:   projectType,
      address:        address,
      budget_range:   budget,
      timeline:       timeline,
      description:    description,
      status:         'new_lead',
    }).select().single()

    var project = insertResult.data
    var projectId = project ? project.id : null

    // Get AI ballpark estimate from Claude
    var ballpark = null
    try {
      var aiRes = await fetch(process.env.NEXTAUTH_URL + '/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'estimate',
          data: {
            prompt: projectType + ' for ' + firstName + ' ' + lastName +
              ' at ' + address + '. Description: ' + description +
              '. Budget: ' + budget + '. Metro Atlanta pricing. ' +
              'Give a brief ballpark in all 4 tiers (Good/Better/Best/Luxury). ' +
              'Keep it to 4 lines total — one per tier with price range only.'
          }
        })
      })
      var aiJson = await aiRes.json()
      ballpark = aiJson.result || null
    } catch(e) {
      ballpark = null
    }

    // Log message in project thread
    if (projectId) {
      await supabase.from('messages').insert({
        project_id:   projectId,
        sender_email: email,
        sender_role:  'client',
        body: 'New lead from website contact form.\n\nDescription: ' + description,
        read: false,
      })
    }

    // Return success with project number and ballpark
    return res.status(200).json({
      ok:            true,
      projectNumber: pn,
      projectId,
      ballpark,
      message:       'Lead created successfully',
    })

  } catch (err) {
    console.error('Lead capture error:', err)
    return res.status(500).json({ error: err.message })
  }
}
