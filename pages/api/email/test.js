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
    <p style="margin:0 0 20px;font-size:16px;color:#333333;line-height:1.8;">Hi Michael,</p>
    <p style="margin:0 0 16px;font-size:15px;color:#333333;line-height:1.8;">
      Thank you for reaching out to SpanglerBuilt Inc. We have received your inquiry regarding a
      <strong style="color:#111111;">Kitchen Remodel</strong> project.
    </p>
    <p style="margin:0 0 28px;font-size:15px;color:#333333;line-height:1.8;">
      We have already started a dedicated project file for you. Our team is reviewing your details
      and we will be in touch shortly.
    </p>

    <div style="padding:20px;background:#f9f9f9;border-left:5px solid #000000;margin-bottom:28px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#111111;">Inquiry Details:</p>
      <p style="margin:0;font-size:14px;color:#444444;line-height:1.9;">
        Project: <strong>Kitchen Remodel</strong><br>
        File #: <strong>SB-2026-TEST</strong><br>
        Date: <strong>${date}</strong>
      </p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td align="center">
        <a href="${BRAND.website}" style="display:inline-block;background:#000000;color:#ffffff;font-size:13px;font-weight:700;padding:15px 36px;border-radius:4px;text-decoration:none;letter-spacing:.1em;text-transform:uppercase;">VIEW OUR WORK</a>
      </td></tr>
    </table>

    <p style="margin:30px 0 0;font-size:15px;color:#333333;line-height:1.9;">
      Best regards,<br><br>
      <strong style="color:#111111;">Michael Spangler</strong><br>
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
