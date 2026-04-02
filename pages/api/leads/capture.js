// POST /api/leads/capture
// Receives leads from spanglerbuilt.com contact form
// Creates project in Supabase, sends branded confirmation emails

import { Resend } from 'resend'

var MICHAEL_EMAIL = 'michael@spanglerbuilt.com'
var FROM_ADDRESS  = 'SpanglerBuilt <noreply@spanglerbuilt.com>'

function clientEmailHtml(firstName, pn, projectType, ballpark) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:40px 20px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;border-top:4px solid #D06830;padding:28px 32px;border-radius:6px 6px 0 0;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#D06830;letter-spacing:.14em;text-transform:uppercase;">SpanglerBuilt Inc.</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-.02em;">We got your message.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#161616;padding:32px;border-radius:0 0 6px 6px;">
          <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,.75);line-height:1.7;">
            Hi ${firstName},<br><br>
            Thanks for reaching out about your <strong style="color:#fff;">${projectType}</strong> project.
            Michael will personally review your details and reach out within <strong style="color:#fff;">one business day</strong>.
          </p>

          <!-- Project number box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(208,104,48,.08);border:1px solid rgba(208,104,48,.3);border-radius:4px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#D06830;letter-spacing:.12em;text-transform:uppercase;">Your project number</p>
              <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:.04em;">${pn}</p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.45);">You'll use this number to access your client portal once your project begins.</p>
            </td></tr>
          </table>

          ${ballpark ? `
          <!-- Ballpark -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid rgba(255,255,255,.09);border-radius:4px;margin-bottom:24px;">
            <tr><td style="padding:16px 20px;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.12em;text-transform:uppercase;">Ballpark estimate (Atlanta market)</p>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,.65);line-height:1.8;white-space:pre-line;">${ballpark}</p>
              <p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,.35);">These are rough ranges — Michael will prepare a formal estimate after your consultation.</p>
            </td></tr>
          </table>
          ` : ''}

          <!-- What happens next -->
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;">What happens next</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            ${[['1','Michael reviews your project details'],['2','He calls to learn more about your goals'],['3','Free on-site consultation at your home'],['4','Detailed written estimate delivered']].map(function(s){
              return `<tr><td style="padding:6px 0;"><table cellpadding="0" cellspacing="0"><tr>
                <td style="width:24px;height:24px;background:#D06830;border-radius:50%;text-align:center;vertical-align:middle;font-size:10px;font-weight:700;color:#fff;">${s[0]}</td>
                <td style="padding-left:12px;font-size:13px;color:rgba(255,255,255,.6);">${s[1]}</td>
              </tr></table></td></tr>`
            }).join('')}
          </table>

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding-right:10px;">
                <a href="tel:4044927650" style="display:inline-block;background:#D06830;color:#fff;font-size:13px;font-weight:700;padding:12px 22px;border-radius:4px;text-decoration:none;letter-spacing:.04em;">(404) 492-7650</a>
              </td>
              <td>
                <a href="mailto:michael@spanglerbuilt.com" style="display:inline-block;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-size:13px;padding:12px 22px;border-radius:4px;text-decoration:none;">Email Michael</a>
              </td>
            </tr>
          </table>

          <hr style="border:none;border-top:1px solid rgba(255,255,255,.07);margin:0 0 20px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,.3);line-height:1.7;">
            SpanglerBuilt Inc. · 44 Milton Ave, Alpharetta GA 30009<br>
            Licensed &amp; Insured · Metro Atlanta &amp; North Georgia<br>
            <a href="https://spanglerbuilt.com" style="color:#D06830;">spanglerbuilt.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function michaelEmailHtml(firstName, lastName, email, phone, projectType, address, budget, description, pn, ballpark) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#111;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111;padding:32px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#0a0a0a;border-top:4px solid #D06830;padding:20px 28px;border-radius:6px 6px 0 0;">
          <p style="margin:0;font-size:10px;font-weight:700;color:#D06830;letter-spacing:.14em;text-transform:uppercase;">New lead · SpanglerBuilt</p>
          <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#fff;">${firstName} ${lastName} — ${projectType}</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,.45);">${pn} · Submitted ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
        </td></tr>
        <tr><td style="background:#161616;padding:24px 28px;border-radius:0 0 6px 6px;">

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            ${[['Email', `<a href="mailto:${email}" style="color:#D06830;">${email}</a>`],['Phone', phone ? `<a href="tel:${phone.replace(/\D/g,'')}" style="color:#D06830;">${phone}</a>` : '—'],['Address', address || '—'],['Budget', budget || '—']].map(function(r){
              return `<tr>
                <td style="padding:6px 0;font-size:11px;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.06em;width:90px;vertical-align:top;">${r[0]}</td>
                <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,.75);">${r[1]}</td>
              </tr>`
            }).join('')}
          </table>

          ${description ? `
          <div style="background:#1a1a1a;border-left:3px solid #D06830;padding:12px 16px;border-radius:0 4px 4px 0;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;">Project description</p>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,.65);line-height:1.7;">${description}</p>
          </div>` : ''}

          ${ballpark ? `
          <div style="background:rgba(208,104,48,.08);border:1px solid rgba(208,104,48,.25);padding:12px 16px;border-radius:4px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#D06830;letter-spacing:.1em;text-transform:uppercase;">AI ballpark estimate</p>
            <p style="margin:0;font-size:12px;color:rgba(255,255,255,.6);line-height:1.8;white-space:pre-line;">${ballpark}</p>
          </div>` : ''}

          <a href="https://app.spanglerbuilt.com/contractor/leads" style="display:inline-block;background:#D06830;color:#fff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:4px;text-decoration:none;letter-spacing:.04em;">
            View in portal →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  var body        = req.body
  var firstName   = body.firstName   || body.first_name  || ''
  var lastName    = body.lastName    || body.last_name   || ''
  var email       = body.email       || ''
  var phone       = body.phone       || ''
  var address     = body.address     || body.project_address || body.projectAddress || ''
  var projectType = body.projectType || body.project_type    || 'Other'
  var description = body.description || body.message         || ''
  var budget      = body.budget      || ''
  var timeline    = body.timeline    || ''

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  // Fallback if Supabase not configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    var fallbackPn = 'SB-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*900)+100)
    return res.status(200).json({ ok:true, projectNumber: fallbackPn, ballpark: null, message: 'Received — Supabase not configured' })
  }

  try {
    var supabaseLib = await import('@supabase/supabase-js')
    var supabase = supabaseLib.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    // Generate project number SB-YYYY-NNN
    var year = new Date().getFullYear()
    var countResult = await supabase
      .from('projects')
      .select('*', { count:'exact', head:true })
      .like('project_number', 'SB-' + year + '-%')
    var nextSeq = ((countResult.count || 0) + 1)
    var pn = 'SB-' + year + '-' + String(nextSeq).padStart(3,'0')

    // Create project
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

    var project   = insertResult.data
    var projectId = project ? project.id : null

    // Get AI ballpark estimate
    var ballpark = null
    try {
      var aiRes = await fetch((process.env.NEXTAUTH_URL || 'https://app.spanglerbuilt.com') + '/api/claude', {
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

    // Log initial message in project thread
    if (projectId) {
      await supabase.from('messages').insert({
        project_id:   projectId,
        sender_email: email,
        sender_role:  'client',
        body: 'New lead from website.\n\nDescription: ' + description,
        read: false,
      }).catch(function(){})
    }

    // Send emails via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        var resend = new Resend(process.env.RESEND_API_KEY)

        // 1. Confirmation to client
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      email,
          subject: 'We received your request — SpanglerBuilt (' + pn + ')',
          html:    clientEmailHtml(firstName, pn, projectType, ballpark),
        })

        // 2. Notification to Michael
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      MICHAEL_EMAIL,
          subject: 'New lead: ' + firstName + ' ' + lastName + ' — ' + projectType + ' (' + pn + ')',
          html:    michaelEmailHtml(firstName, lastName, email, phone, projectType, address, budget, description, pn, ballpark),
        })
      } catch(emailErr) {
        console.error('Email send error:', emailErr)
        // Don't fail the request if email fails — lead is already saved
      }
    }

    return res.status(200).json({ ok:true, projectNumber:pn, projectId, ballpark, message:'Lead created' })

  } catch(err) {
    console.error('Lead capture error:', err)
    return res.status(500).json({ error: err.message })
  }
}
