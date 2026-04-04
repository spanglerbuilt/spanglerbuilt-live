// GET /api/drive/files?folder=Project Photos
// Lists files in a subfolder of the SpanglerBuilt Marketing Drive folder.
// Uses service account — no OAuth needed.

var DRIVE_API = 'https://www.googleapis.com/drive/v3'
var ROOT_FOLDER_NAME = 'SpanglerBuilt Marketing'

async function getAccessToken() {
  var email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  var key   = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!email || !key) throw new Error('Google credentials not configured')

  // Build JWT
  var header  = Buffer.from(JSON.stringify({ alg:'RS256', typ:'JWT' })).toString('base64url')
  var now     = Math.floor(Date.now() / 1000)
  var payload = Buffer.from(JSON.stringify({
    iss:   email,
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
    aud:   'https://oauth2.googleapis.com/token',
    iat:   now,
    exp:   now + 3600,
  })).toString('base64url')

  var crypto  = await import('crypto')
  var sign    = crypto.createSign('RSA-SHA256')
  sign.update(header + '.' + payload)
  var sig = sign.sign(key.replace(/\\n/g, '\n'), 'base64url')
  var jwt = header + '.' + payload + '.' + sig

  var r = await fetch('https://oauth2.googleapis.com/token', {
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
  var r = await fetch(DRIVE_API + '/files?q=' + encodeURIComponent(q) + '&fields=files(id,name)', {
    headers: { Authorization: 'Bearer ' + token },
  })
  var d = await r.json()
  return d.files && d.files[0] ? d.files[0].id : null
}

async function listFiles(folderId, token) {
  var q = `'${folderId}' in parents and trashed=false`
  var r = await fetch(
    DRIVE_API + '/files?q=' + encodeURIComponent(q) +
    '&fields=files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime,size,imageMediaMetadata)' +
    '&orderBy=createdTime desc&pageSize=100',
    { headers: { Authorization: 'Bearer ' + token } }
  )
  return r.json()
}

export default async function handler(req, res) {
  var subfolder = req.query.folder || null

  try {
    var token    = await getAccessToken()
    var rootId   = await findFolder(ROOT_FOLDER_NAME, null, token)
    if (!rootId) return res.status(404).json({ error: 'SpanglerBuilt Marketing folder not found. Create it in Drive and share with ' + process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL })

    var targetId = rootId
    if (subfolder) {
      targetId = await findFolder(subfolder, rootId, token)
      if (!targetId) return res.status(404).json({ error: 'Subfolder "' + subfolder + '" not found', files: [] })
    }

    var data = await listFiles(targetId, token)
    return res.status(200).json({ files: data.files || [], folder: subfolder || ROOT_FOLDER_NAME })
  } catch(e) {
    console.error('Drive error:', e)
    return res.status(500).json({ error: e.message })
  }
}
