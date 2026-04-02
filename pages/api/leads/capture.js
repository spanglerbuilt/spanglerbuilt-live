// POST /api/leads/capture
// Receives leads from spanglerbuilt.com contact form
// Creates project in Supabase, sends branded confirmation emails

import { Resend } from 'resend'
import { brandEmail, BRAND } from '../../../lib/brandEmail'

var MICHAEL_EMAIL = 'michael@spanglerbuilt.com'
var FROM_ADDRESS  = 'SpanglerBuilt <noreply@spanglerbuilt.com>'

function clientEmailHtml(firstName, pn, projectType, ballpark) {
  var date = new Date().toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' })
  var body = `
    <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,.75);line-height:1.8;">
      Hi ${firstName},<br><br>
      Thank you for reaching out to SpanglerBuilt Inc. We have received your inquiry regarding a
      <strong style="color:#fff;">${projectType}</strong> project.<br><br>
      We have already started a dedicated project file for you. Our team is reviewing your details
      and we will be in touch shortly.
    </p>

    <!-- Inquiry details -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(208,104,48,.08);border:1px solid rgba(208,104,48,.25);border-radius:4px;margin-bottom:24px;">
      <tr><td style="padding:6px 20px 0;font-size:10px;font-weight:700;color:${BRAND.orange};letter-spacing:.12em;text-transform:uppercase;">Inquiry Details</td></tr>
      <tr><td style="padding:0 20px 16px;">
        <table cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;padding-bottom:6px;">Project</td>
            <td style="font-size:13px;color:#fff;font-weight:600;padding-bottom:6px;">${projectType}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;padding-bottom:6px;">File #</td>
            <td style="font-size:13px;color:#fff;font-weight:600;padding-bottom:6px;">${pn}</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;">Date</td>
            <td style="font-size:13px;color:#fff;font-weight:600;">${date}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    ${ballpark ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid rgba(255,255,255,.09);border-radius:4px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.12em;text-transform:uppercase;">Ballpark estimate (Atlanta market)</p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,.65);line-height:1.8;white-space:pre-line;">${ballpark}</p>
        <p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,.35);">These are rough ranges — Michael will prepare a formal estimate after your consultation.</p>
      </td></tr>
    </table>
    ` : ''}

    <!-- View Our Work CTA -->
    <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="padding-right:10px;">
          <a href="${BRAND.website}/our-work" style="display:inline-block;background:${BRAND.orange};color:#fff;font-size:13px;font-weight:700;padding:13px 28px;border-radius:4px;text-decoration:none;letter-spacing:.06em;text-transform:uppercase;">View Our Work →</a>
        </td>
        <td>
          <a href="tel:${BRAND.tel}" style="display:inline-block;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.7);font-size:13px;padding:13px 20px;border-radius:4px;text-decoration:none;">${BRAND.phone}</a>
        </td>
      </tr>
    </table>
  `
  return brandEmail({
    preheader: 'We received your ' + projectType + ' inquiry — project file ' + pn + ' has been started.',
    title: 'Thank you for reaching out.',
    subtitle: 'Your inquiry has been received and your project file is open.',
    body,
  })
}

function michaelEmailHtml(firstName, lastName, email, phone, projectType, address, budget, description, pn, ballpark) {
  var body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      ${[
        ['Email',   `<a href="mailto:${email}" style="color:${BRAND.orange};">${email}</a>`],
        ['Phone',   phone ? `<a href="tel:${phone.replace(/\D/g,'')}" style="color:${BRAND.orange};">${phone}</a>` : '—'],
        ['Address', address || '—'],
        ['Budget',  budget  || '—'],
      ].map(function(r){
        return `<tr>
          <td style="padding:6px 0;font-size:11px;font-weight:600;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.06em;width:90px;vertical-align:top;">${r[0]}</td>
          <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,.75);">${r[1]}</td>
        </tr>`
      }).join('')}
    </table>

    ${description ? `
    <div style="background:#1a1a1a;border-left:3px solid ${BRAND.orange};padding:12px 16px;border-radius:0 4px 4px 0;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;">Project description</p>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,.65);line-height:1.7;">${description}</p>
    </div>` : ''}

    ${ballpark ? `
    <div style="background:rgba(208,104,48,.08);border:1px solid rgba(208,104,48,.25);padding:12px 16px;border-radius:4px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:${BRAND.orange};letter-spacing:.1em;text-transform:uppercase;">AI ballpark estimate</p>
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,.6);line-height:1.8;white-space:pre-line;">${ballpark}</p>
    </div>` : ''}

    <a href="${BRAND.portal}/contractor/leads" style="display:inline-block;background:${BRAND.orange};color:#fff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:4px;text-decoration:none;letter-spacing:.04em;">
      View in portal →
    </a>
  `
  return brandEmail({
    preheader: 'New lead: ' + firstName + ' ' + lastName + ' — ' + projectType,
    title: firstName + ' ' + lastName + ' — ' + projectType,
    subtitle: pn + ' &nbsp;&middot;&nbsp; Submitted ' + new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
    body,
  })
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

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    var fallbackPn = 'SB-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*900)+100)
    return res.status(200).json({ ok:true, projectNumber: fallbackPn, ballpark: null, message: 'Received — Supabase not configured' })
  }

  try {
    var supabaseLib = await import('@supabase/supabase-js')
    var supabase = supabaseLib.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

    var year = new Date().getFullYear()
    var countResult = await supabase
      .from('projects')
      .select('*', { count:'exact', head:true })
      .like('project_number', 'SB-' + year + '-%')
    var nextSeq = ((countResult.count || 0) + 1)
    var pn = 'SB-' + year + '-' + String(nextSeq).padStart(3,'0')

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

    var ballpark = null
    try {
      var aiRes = await fetch((process.env.NEXTAUTH_URL || BRAND.portal) + '/api/claude', {
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

    if (projectId) {
      await supabase.from('messages').insert({
        project_id:   projectId,
        sender_email: email,
        sender_role:  'client',
        body: 'New lead from website.\n\nDescription: ' + description,
        read: false,
      }).catch(function(){})
    }

    if (process.env.RESEND_API_KEY) {
      try {
        var resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      email,
          subject: 'We received your request — SpanglerBuilt (' + pn + ')',
          html:    clientEmailHtml(firstName, pn, projectType, ballpark),
        })
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      MICHAEL_EMAIL,
          subject: 'New lead: ' + firstName + ' ' + lastName + ' — ' + projectType + ' (' + pn + ')',
          html:    michaelEmailHtml(firstName, lastName, email, phone, projectType, address, budget, description, pn, ballpark),
        })
      } catch(emailErr) {
        console.error('Email send error:', emailErr)
      }
    }

    return res.status(200).json({ ok:true, projectNumber:pn, projectId, ballpark, message:'Lead created' })

  } catch(err) {
    console.error('Lead capture error:', err)
    return res.status(500).json({ error: err.message })
  }
}
