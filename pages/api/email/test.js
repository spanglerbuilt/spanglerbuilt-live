// GET /api/email/test?to=email@example.com
// Sends a branded test email — remove or secure this route after testing

import { Resend } from 'resend'
import { brandEmail, BRAND } from '../../../lib/brandEmail'

export default async function handler(req, res) {
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured in Vercel environment variables.' })
  }

  var to   = req.query.to || 'michael@spanglerbuilt.com'
  var date = new Date().toLocaleDateString('en-US', { month:'numeric', day:'numeric', year:'numeric' })

  var body = `
    <p style="margin:0 0 20px;font-size:15px;color:rgba(255,255,255,.75);line-height:1.8;">
      Hi Michael,<br><br>
      Thank you for reaching out to SpanglerBuilt Inc. We have received your inquiry regarding a
      <strong style="color:#fff;">Kitchen Remodel</strong> project.<br><br>
      We have already started a dedicated project file for you. Our team is reviewing your details
      and we will be in touch shortly.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(208,104,48,.08);border:1px solid rgba(208,104,48,.25);border-radius:4px;margin-bottom:24px;">
      <tr><td style="padding:6px 20px 0;font-size:10px;font-weight:700;color:${BRAND.orange};letter-spacing:.12em;text-transform:uppercase;">Inquiry Details</td></tr>
      <tr><td style="padding:0 20px 16px;">
        <table cellpadding="0" cellspacing="0" style="margin-top:10px;">
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;padding-bottom:6px;">Project</td>
            <td style="font-size:13px;color:#fff;font-weight:600;padding-bottom:6px;">Kitchen Remodel</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;padding-bottom:6px;">File #</td>
            <td style="font-size:13px;color:#fff;font-weight:600;padding-bottom:6px;">SB-2026-TEST</td>
          </tr>
          <tr>
            <td style="font-size:12px;color:rgba(255,255,255,.4);padding-right:16px;">Date</td>
            <td style="font-size:13px;color:#fff;font-weight:600;">${date}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${BRAND.website}/our-work" style="display:inline-block;background:${BRAND.orange};color:#fff;font-size:13px;font-weight:700;padding:15px 36px;border-radius:4px;text-decoration:none;letter-spacing:.1em;text-transform:uppercase;">VIEW OUR WORK</a>
      </td></tr>
    </table>

    <p style="margin:0;font-size:14px;color:rgba(255,255,255,.6);line-height:1.9;">
      Best regards,<br><br>
      <strong style="color:#fff;">Michael Spangler</strong><br>
      SpanglerBuilt Inc.<br>
      <a href="tel:${BRAND.tel}" style="color:${BRAND.orange};text-decoration:none;">${BRAND.phone}</a>
    </p>
  `

  var html = brandEmail({
    preheader: 'Thank you for contacting SpanglerBuilt Inc. — we have received your Kitchen Remodel inquiry.',
    title: 'Thank you for contacting SpanglerBuilt Inc.',
    subtitle: 'Your project file has been started.',
    body,
  })

  try {
    var resend = new Resend(process.env.RESEND_API_KEY)
    var result = await resend.emails.send({
      from:    'SpanglerBuilt <noreply@spanglerbuilt.com>',
      to:      to,
      subject: 'Thank you for contacting SpanglerBuilt Inc.',
      html,
    })
    return res.status(200).json({ ok: true, id: result.data?.id, error: result.error || null, to })
  } catch(err) {
    return res.status(500).json({ error: err.message })
  }
}
