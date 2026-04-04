// POST /api/drive/upload
// Multipart: file + folder name → uploads to the matching SpanglerBuilt Marketing subfolder
// Uses service account with drive.file scope

export const config = { api: { bodyParser: false } }

var DRIVE_API       = 'https://www.googleapis.com/upload/drive/v3'
var DRIVE_API_META  = 'https://www.googleapis.com/drive/v3'
var ROOT_FOLDER_NAME = 'SpanglerBuilt Marketing'

async function getAccessToken() {
  var email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  var key   = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!email || !key) throw new Error('Google credentials not configured')

  var header  = Buffer.from(JSON.stringify({ alg:'RS256', typ:'JWT' })).toString('base64url')
  var now     = Math.floor(Date.now() / 1000)
  var payload = Buffer.from(JSON.stringify({
    iss:   email,
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url')

  var crypto = await import('crypto')
  var sign   = crypto.createSign('RSA-SHA256')
  sign.update(header + '.' + payload)
  var sig = sign.sign(key.replace(/\\n/g, '\n'), 'base64url')
  var jwt = header + '.' + payload + '.' + sig

  var r    = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt,
  })
  var data = await r.json()
  if (!data.access_token) throw new Error('Failed to get access token: ' + JSON.stringify(data))
  return data.access_token
}

async function findFolder(name, parentId, token) {
  var q = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  var r = await fetch(DRIVE_API_META + '/files?q=' + encodeURIComponent(q) + '&fields=files(id,name)', {
    headers: { Authorization: 'Bearer ' + token },
  })
  var d = await r.json()
  return d.files && d.files[0] ? d.files[0].id : null
}

async function readMultipart(req) {
  return new Promise(function(resolve, reject) {
    var chunks = []
    req.on('data', function(c) { chunks.push(c) })
    req.on('end',  function()  { resolve(Buffer.concat(chunks)) })
    req.on('error', reject)
  })
}

function parseMultipart(body, boundary) {
  var parts = []
  var sep   = Buffer.from('--' + boundary)
  var end   = Buffer.from('--' + boundary + '--')
  var start = 0

  while (start < body.length) {
    var sepIdx = body.indexOf(sep, start)
    if (sepIdx === -1) break
    var next = body.indexOf(sep, sepIdx + sep.length)
    if (next === -1) next = body.indexOf(end, sepIdx + sep.length)
    if (next === -1) break

    var part    = body.slice(sepIdx + sep.length + 2, next - 2) // skip \r\n
    var headEnd = part.indexOf('\r\n\r\n')
    if (headEnd === -1) { start = next; continue }

    var headerStr = part.slice(0, headEnd).toString()
    var content   = part.slice(headEnd + 4)

    var nameMatch = headerStr.match(/name="([^"]+)"/)
    var fileMatch = headerStr.match(/filename="([^"]+)"/)
    var typeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/)

    parts.push({
      name:        nameMatch  ? nameMatch[1]  : '',
      filename:    fileMatch  ? fileMatch[1]  : '',
      contentType: typeMatch  ? typeMatch[1].trim() : 'application/octet-stream',
      data:        content,
    })
    start = next
  }
  return parts
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    var rawBody  = await readMultipart(req)
    var ct       = req.headers['content-type'] || ''
    var bMatch   = ct.match(/boundary=([^\s;]+)/)
    if (!bMatch)  return res.status(400).json({ error: 'No multipart boundary' })

    var parts    = parseMultipart(rawBody, bMatch[1])
    var filePart = parts.find(function(p){ return p.filename })
    var folderPart = parts.find(function(p){ return p.name === 'folder' })

    if (!filePart) return res.status(400).json({ error: 'No file in request' })

    var folder   = folderPart ? folderPart.data.toString().trim() : 'Project Photos'
    var token    = await getAccessToken()
    var rootId   = await findFolder(ROOT_FOLDER_NAME, null, token)
    if (!rootId)  return res.status(404).json({ error: 'SpanglerBuilt Marketing folder not found in Drive' })

    var folderId = await findFolder(folder, rootId, token)
    if (!folderId) return res.status(404).json({ error: 'Subfolder "' + folder + '" not found' })

    // Multipart upload to Drive
    var metadata = JSON.stringify({ name: filePart.filename, parents: [folderId] })
    var boundary = 'sb_upload_boundary'
    var body     = Buffer.concat([
      Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'),
      Buffer.from(metadata),
      Buffer.from('\r\n--' + boundary + '\r\nContent-Type: ' + filePart.contentType + '\r\n\r\n'),
      filePart.data,
      Buffer.from('\r\n--' + boundary + '--'),
    ])

    var upload = await fetch(DRIVE_API + '/files?uploadType=multipart&fields=id,name,webViewLink', {
      method:  'POST',
      headers: {
        Authorization:  'Bearer ' + token,
        'Content-Type': 'multipart/related; boundary=' + boundary,
        'Content-Length': body.length,
      },
      body,
    })

    var result = await upload.json()
    if (!upload.ok) return res.status(500).json({ error: result.error?.message || 'Upload failed' })

    return res.status(200).json({ ok: true, id: result.id, name: result.name, webViewLink: result.webViewLink })
  } catch(e) {
    console.error('Drive upload error:', e)
    return res.status(500).json({ error: e.message })
  }
}
