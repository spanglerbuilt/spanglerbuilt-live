// pages/api/qa/upload-screenshot.js
// Accepts multipart/form-data with a 'file' field, uploads to Supabase Storage bucket 'qa-screenshots'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  var supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' })
  }

  try {
    // Parse multipart form data using built-in formidable pattern
    var Busboy = (await import('busboy')).default
    var { createClient } = await import('@supabase/supabase-js')
    var sb = createClient(supabaseUrl, supabaseKey)

    var fileBuffer = null
    var fileName   = 'screenshot.png'
    var mimeType   = 'image/png'

    await new Promise(function(resolve, reject) {
      var bb = Busboy({ headers: req.headers })

      bb.on('file', function(name, stream, info) {
        fileName = info.filename || 'screenshot.png'
        mimeType = info.mimeType || 'image/png'
        var chunks = []
        stream.on('data', function(chunk) { chunks.push(chunk) })
        stream.on('end', function() { fileBuffer = Buffer.concat(chunks) })
      })

      bb.on('finish', resolve)
      bb.on('error', reject)
      req.pipe(bb)
    })

    if (!fileBuffer) return res.status(400).json({ error: 'No file received' })

    var timestamp = Date.now()
    var safeName  = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    var path      = timestamp + '_' + safeName

    var { data: uploadData, error: uploadError } = await sb.storage
      .from('qa-screenshots')
      .upload(path, fileBuffer, { contentType: mimeType, upsert: false })

    if (uploadError) throw new Error(uploadError.message)

    var { data: urlData } = sb.storage.from('qa-screenshots').getPublicUrl(uploadData.path)

    return res.status(200).json({ url: urlData.publicUrl })
  } catch (err) {
    console.error('qa/upload-screenshot error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
