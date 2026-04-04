// POST { filename } → { signedUrl, path, publicUrl }
// Returns a Supabase signed upload URL so the client can upload directly

import { getAdminClient } from '../../../lib/supabase-server'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  const { filename } = req.body || {}
  if (!filename) return res.status(400).json({ error: 'filename required' })

  const ext  = filename.split('.').pop().toLowerCase()
  const safe = filename.replace(/[^a-z0-9._-]/gi, '_').toLowerCase()
  const path = Date.now() + '_' + safe

  const { data, error } = await supabase.storage
    .from('marketing-videos')
    .createSignedUploadUrl(path)

  if (error) return res.status(500).json({ error: error.message })

  const { data: publicData } = supabase.storage
    .from('marketing-videos')
    .getPublicUrl(path)

  return res.status(200).json({
    signedUrl: data.signedUrl,
    path,
    publicUrl: publicData.publicUrl,
  })
}
