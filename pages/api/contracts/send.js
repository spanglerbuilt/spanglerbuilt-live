// POST { contractId } → emails contract link to client, updates status to 'sent'
import { getAdminClient } from '../../../lib/supabase-server'
import { Resend } from 'resend'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { contractId } = req.body || {}
  if (!contractId) return res.status(400).json({ error: 'contractId required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { data: contract, error: cErr } = await supabase
    .from('project_contracts')
    .select('*, projects(project_number, client_name, client_email, project_type)')
    .eq('id', contractId)
    .single()

  if (cErr || !contract) return res.status(404).json({ error: 'Contract not found' })

  const project    = contract.projects || {}
  const clientName = project.client_name  || 'Client'
  const clientEmail= project.client_email || null
  const signUrl    = (process.env.NEXT_PUBLIC_APP_URL || 'https://app.spanglerbuilt.com') + '/client/sign-contract/' + contractId

  if (!clientEmail) return res.status(400).json({ error: 'No client email on project. Add client_email to project first.' })

  // Send email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    'SpanglerBuilt Inc. <michael@spanglerbuilt.com>',
      to:      clientEmail,
      subject: 'Your SpanglerBuilt Contract is Ready to Sign — ' + (project.project_number || ''),
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <img src="https://app.spanglerbuilt.com/logo.png" style="height:48px;margin-bottom:20px;"/>
        <h2 style="color:#111;margin-bottom:8px;">Your contract is ready, ${clientName.split(' ')[0]}.</h2>
        <p style="color:#444;line-height:1.6;">Your SpanglerBuilt ${project.project_type || 'Renovation'} contract is ready for your review and signature.</p>
        <p style="color:#444;line-height:1.6;">Please scroll through the full contract before signing.</p>
        <div style="margin:24px 0;">
          <a href="${signUrl}" style="background:#D06830;color:#fff;padding:13px 28px;border-radius:4px;text-decoration:none;font-weight:bold;font-size:15px;">
            Review &amp; Sign Contract →
          </a>
        </div>
        <p style="color:#999;font-size:12px;">Questions? Call Michael at (404) 492-7650 or reply to this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;"/>
        <p style="color:#bbb;font-size:11px;">SpanglerBuilt Inc. · 44 Milton Ave, Alpharetta GA 30009 · spanglerbuilt.com</p>
      </div>`,
    })
  }

  // Update contract status
  await supabase
    .from('project_contracts')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', contractId)

  res.json({ ok: true, signUrl })
}
