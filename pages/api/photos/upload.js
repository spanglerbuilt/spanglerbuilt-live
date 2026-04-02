// POST /api/photos/upload
// Body: { projectId, phase, caption, fileBase64, fileName, mimeType }
// Uploads to Supabase Storage bucket "project-photos", saves metadata to project_photos table.

import { getAdminClient } from '../../../lib/supabase-server'

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var { projectId, phase, caption, fileBase64, fileName, mimeType } = req.body
  if (!projectId || !fileBase64 || !fileName) return res.status(400).json({ error: 'Missing required fields' })

  var supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  try {
    // Decode base64 and upload to Storage
    var buffer    = Buffer.from(fileBase64, 'base64')
    var filePath  = projectId + '/' + Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    var { error: uploadError } = await supabase.storage
      .from('project-photos')
      .upload(filePath, buffer, { contentType: mimeType || 'image/jpeg', upsert: false })

    if (uploadError) return res.status(500).json({ error: uploadError.message })

    // Get public URL
    var { data: urlData } = supabase.storage.from('project-photos').getPublicUrl(filePath)
    var publicUrl = urlData.publicUrl

    // Save metadata to project_photos table
    var { data, error: dbError } = await supabase
      .from('project_photos')
      .insert({ project_id: projectId, phase: phase || 'General', caption: caption || '', url: publicUrl, uploaded_by: 'SpanglerBuilt' })
      .select()
      .single()

    if (dbError) return res.status(500).json({ error: dbError.message })

    return res.json({ photo: data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
