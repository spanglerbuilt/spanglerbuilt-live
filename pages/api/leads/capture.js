// POST /api/leads/capture
// Receives leads from spanglerbuilt.com contact form
// Creates project in Supabase, sends branded confirmation emails

import { Resend } from 'resend'
import { brandEmail, BRAND } from '../../../lib/brandEmail'
import { upsertContact, createDeal } from '../../../lib/hubspot'

var MICHAEL_EMAIL = 'michael@spanglerbuilt.com'
var FROM_ADDRESS  = 'SpanglerBuilt <noreply@spanglerbuilt.com>'

function clientEmailHtml(firstName, pn, projectType, ballpark) {
  var date = new Date().toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' })
  var body = `
    <p style="margin:0 0 20px;font-size:16px;color:#333333;line-height:1.8;">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.8;">
      Thank you for reaching out to SpanglerBuilt Inc. We have received your inquiry regarding a
      <strong style="color:#111111;">${projectType}</strong> project.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#333333;line-height:1.8;">
      We have already started a dedicated project file for you. Our team is reviewing your details
      and we will be in touch shortly.
    </p>

    <!-- Inquiry details -->
    <div style="padding:20px;background:#f9f9f9;border-left:5px solid #000000;margin-bottom:28px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111111;">Inquiry Details:</p>
      <p style="margin:0;font-size:14px;color:#444444;line-height:1.9;">
        Project: <strong>${projectType}</strong><br>
        File #: <strong>${pn}</strong><br>
        Date: <strong>${date}</strong>
      </p>
    </div>


    <!-- VIEW OUR WORK CTA (centered) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${BRAND.website}" style="display:inline-block;background:#000000;color:#ffffff;font-size:13px;font-weight:700;padding:15px 36px;border-radius:4px;text-decoration:none;letter-spacing:.1em;text-transform:uppercase;">VIEW OUR WORK</a>
      </td></tr>
    </table>

    <!-- Signature -->
    <p style="margin:30px 0 0;font-size:15px;color:#333333;line-height:1.9;">
      Best regards,<br><br>
      <strong style="color:#111111;">Michael Spangler</strong><br>
      SpanglerBuilt Inc.<br>
      <a href="tel:${BRAND.tel}" style="color:${BRAND.orange};text-decoration:none;">${BRAND.phone}</a>
    </p>
  `
  return brandEmail({
    preheader: 'Thank you for contacting SpanglerBuilt Inc. — we have received your ' + projectType + ' inquiry.',
    title: 'Thank you for contacting SpanglerBuilt Inc.',
    subtitle: 'Your project file has been started.',
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


    <table cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-right:10px;">
          <a href="${BRAND.portal}/contractor/leads" style="display:inline-block;background:${BRAND.orange};color:#fff;font-size:13px;font-weight:700;padding:12px 24px;border-radius:4px;text-decoration:none;letter-spacing:.04em;">Open in Portal →</a>
        </td>
        <td>
          <a href="${BRAND.website}" style="display:inline-block;background:#f4f4f4;border:1px solid #dddddd;color:#333333;font-size:13px;padding:12px 20px;border-radius:4px;text-decoration:none;">View Our Work</a>
        </td>
      </tr>
    </table>
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

  // Generate project number — use Supabase sequence if available, else random
  var pn = 'SB-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random()*900)+100)
  var projectId = null
  var ballpark  = null

  // ── Supabase (optional) ──────────────────────────────────────────────────
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    try {
      var supabaseLib = await import('@supabase/supabase-js')
      var supabase = supabaseLib.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

      var year = new Date().getFullYear()
      var countResult = await supabase
        .from('projects')
        .select('*', { count:'exact', head:true })
        .like('project_number', 'SB-' + year + '-%')
      var nextSeq = ((countResult.count || 0) + 1)
      pn = 'SB-' + year + '-' + String(nextSeq).padStart(3,'0')

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
      projectId   = project ? project.id : null

      if (projectId) {
        await supabase.from('messages').insert({
          project_id:   projectId,
          sender_email: email,
          sender_role:  'client',
          body: 'New lead from website.\n\nDescription: ' + description,
          read: false,
        }).catch(function(){})
      }
    } catch(e) {
      console.error('Supabase error:', e)
    }
  }

  // AI ballpark removed — kept emails clean and fast

  // ── HubSpot (optional) ──────────────────────────────────────────────────
  if (process.env.HUBSPOT_API_KEY) {
    try {
      var contactId = await upsertContact({ email, firstName, lastName, phone })
      await createDeal({ projectNumber: pn, projectType, clientName: firstName + ' ' + lastName, budget, contactId })
    } catch(hubErr) {
      console.error('HubSpot error:', hubErr)
    }
  }

  // ── Emails (always attempt if key is set) ───────────────────────────────
  if (process.env.RESEND_API_KEY) {
      try {
        var resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      email,
          subject: 'Thank you for contacting SpanglerBuilt Inc.',
          html:    clientEmailHtml(firstName, pn, projectType, ballpark),
        })
        await resend.emails.send({
          from:    FROM_ADDRESS,
          to:      MICHAEL_EMAIL,
          subject: '🔔 New lead: ' + projectType + ' — ' + firstName + ' ' + lastName,
          html:    michaelEmailHtml(firstName, lastName, email, phone, projectType, address, budget, description, pn, ballpark),
        })
      } catch(emailErr) {
        console.error('Email send error:', emailErr)
      }
  }

  return res.status(200).json({ ok:true, projectNumber:pn, projectId, ballpark, message:'Lead created' })
}
