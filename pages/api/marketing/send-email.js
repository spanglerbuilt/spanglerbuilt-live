// POST /api/marketing/send-email
// Sends a one-off branded email from the marketing dashboard.
// { to, subject, body }

import { Resend } from 'resend'
import { brandEmail, BRAND } from '../../../lib/brandEmail'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var to      = (req.body.to      || '').trim()
  var subject = (req.body.subject || '').trim()
  var body    = (req.body.body    || '').trim()

  if (!to || !subject || !body) return res.status(400).json({ error: 'to, subject, and body are required' })
  if (!process.env.RESEND_API_KEY) return res.status(500).json({ error: 'RESEND_API_KEY not configured' })

  var bodyHtml = body.split('\n').map(function(line) {
    return line.trim() ? '<p style="margin:0 0 14px;font-size:14px;color:#333333;line-height:1.8;">' + line + '</p>' : ''
  }).join('')

  var html = brandEmail({
    preheader: subject,
    title: subject,
    subtitle: 'SpanglerBuilt Inc.',
    body: bodyHtml + `
      <p style="margin:24px 0 0;font-size:14px;color:#333333;line-height:1.9;">
        Best regards,<br><br>
        <strong style="color:#111111;">Cari Spangler</strong><br>
        SpanglerBuilt Inc. — Marketing<br>
        <a href="tel:${BRAND.tel}" style="color:${BRAND.orange};text-decoration:none;">${BRAND.phone}</a>
      </p>
    `,
  })

  try {
    var resend = new Resend(process.env.RESEND_API_KEY)
    var result = await resend.emails.send({
      from:    'SpanglerBuilt <noreply@spanglerbuilt.com>',
      to,
      subject,
      html,
    })
    return res.status(200).json({ ok: true, id: result.data?.id })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
