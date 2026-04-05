// POST { contractId, signer1Name, signer2Name? }
// Records client signature, marks contract signed, emails both parties
import { getAdminClient } from '../../../lib/supabase-server'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { contractId, signer1Name, signer2Name } = req.body || {}
  if (!contractId || !signer1Name) return res.status(400).json({ error: 'contractId and signer1Name required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // Fetch contract + project
  const { data: contract, error: cErr } = await supabase
    .from('project_contracts')
    .select('*, projects(id, project_number, client_name, client_email, project_type)')
    .eq('id', contractId)
    .single()

  if (cErr || !contract) return res.status(404).json({ error: 'Contract not found' })
  if (contract.status === 'signed') return res.status(400).json({ error: 'Contract already signed' })

  const project     = contract.projects || {}
  const signedAt    = new Date().toISOString()
  const clientIp    = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim()

  // Update contract
  await supabase
    .from('project_contracts')
    .update({
      status:        'signed',
      signed_at:     signedAt,
      signer_1_name: signer1Name,
      signer_2_name: signer2Name || null,
      signer_1_ip:   clientIp,
      updated_at:    signedAt,
    })
    .eq('id', contractId)

  // Update project status to 'approved'
  if (project.id) {
    await supabase
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', project.id)
  }

  // Email both parties
  if (process.env.RESEND_API_KEY) {
    const resend     = new Resend(process.env.RESEND_API_KEY)
    const clientName = project.client_name  || signer1Name
    const clientEmail= project.client_email || null
    const pdfUrl     = contract.pdf_url     || null

    const bodyHtml = (to) => `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <img src="https://app.spanglerbuilt.com/logo.png" style="height:48px;margin-bottom:20px;"/>
      <h2 style="color:#111;margin-bottom:8px;">Contract Signed — ${project.project_number || ''}</h2>
      <p style="color:#444;line-height:1.6;">
        The SpanglerBuilt ${project.project_type || ''} contract for <strong>${clientName}</strong> has been signed.<br/>
        Signed by: <strong>${signer1Name}</strong>${signer2Name ? ' &amp; <strong>' + signer2Name + '</strong>' : ''}<br/>
        Date/Time: ${new Date(signedAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET
      </p>
      ${pdfUrl ? `<div style="margin:20px 0;"><a href="${pdfUrl}" style="background:#D06830;color:#fff;padding:11px 22px;border-radius:4px;text-decoration:none;font-weight:bold;">Download Signed Contract PDF</a></div>` : ''}
      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
      <p style="color:#bbb;font-size:11px;">SpanglerBuilt Inc. · 44 Milton Ave, Alpharetta GA 30009 · (404) 492-7650 · spanglerbuilt.com</p>
    </div>`

    // Email Michael
    await resend.emails.send({
      from:    'SpanglerBuilt <michael@spanglerbuilt.com>',
      to:      'michael@spanglerbuilt.com',
      subject: '✓ Contract Signed — ' + (project.project_number || contractId),
      html:    bodyHtml('michael'),
    }).catch(function(){})

    // Email client
    if (clientEmail) {
      await resend.emails.send({
        from:    'SpanglerBuilt Inc. <michael@spanglerbuilt.com>',
        to:      clientEmail,
        subject: 'Your SpanglerBuilt Contract is Signed — ' + (project.project_number || ''),
        html:    bodyHtml('client'),
      }).catch(function(){})
    }
  }

  res.json({ ok: true, signedAt })
}
