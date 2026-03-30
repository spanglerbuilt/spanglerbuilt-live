// lib/drive.js
import { google } from 'googleapis'

const SUBFOLDERS = {
  BSM: ['01 – Pre-Construction','02 – Contract & Exhibits','03 – Estimates & Revisions',
        '04 – Client Selections','05 – Subcontractor Bids','06 – Permits & Inspections',
        '07 – Progress Photos','08 – Invoices & Payments','09 – Change Orders',
        '10 – Punch List & Closeout','11 – Warranties & Manuals'],
  KIT: ['01 – Pre-Construction','02 – Design & Selections','03 – Contract & Exhibits',
        '04 – Estimates & Revisions','05 – Cabinetry & Appliances','06 – Subcontractor Bids',
        '07 – Progress Photos','08 – Invoices & Payments','09 – Change Orders','10 – Punch List & Closeout'],
  BTH: ['01 – Pre-Construction','02 – Design & Selections','03 – Contract',
        '04 – Estimates','05 – Subcontractor Bids','06 – Progress Photos',
        '07 – Invoices & Payments','08 – Punch List & Closeout'],
  ADD: ['01 – Pre-Construction','02 – Architecture & Engineering','03 – Permits',
        '04 – Contract & Exhibits','05 – Estimates & Revisions','06 – Client Selections',
        '07 – Subcontractor Bids','08 – Structural','09 – Progress Photos',
        '10 – Inspections','11 – Invoices & Payments','12 – Change Orders',
        '13 – Punch List & Closeout','14 – Warranties & CO'],
  CHB: ['01 – Pre-Design & Land','02 – Architecture & Engineering','03 – Permits & Approvals',
        '04 – Contract & Exhibits','05 – Estimates & Revisions','06 – Client Selections',
        '07 – Subcontractor Bids','08 – Structural & Civil','09 – Foundation',
        '10 – Framing','11 – MEP','12 – Interior Finishes','13 – Progress Photos',
        '14 – Inspections Log','15 – Invoices & Payments','16 – Change Orders',
        '17 – Punch List & Closeout','18 – Warranties, CO & O&M'],
  OTH: ['01 – Pre-Construction','02 – Contract','03 – Estimates',
        '04 – Progress Photos','05 – Invoices & Payments','06 – Closeout'],
}

export function getDriveClient(accessToken) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.drive({ version: 'v3', auth })
}

export async function createProjectFolder(accessToken, projectNumber, clientLastName, projectType, typeCode) {
  const drive = getDriveClient(accessToken)
  const folderName = `${projectNumber} — ${clientLastName} — ${projectType}`
  const rootId = process.env.DRIVE_ROOT_FOLDER_ID

  // Create main project folder
  const { data: folder } = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [rootId],
    },
    fields: 'id, name, webViewLink',
  })

  // Create subfolders
  const subs = SUBFOLDERS[typeCode] || SUBFOLDERS.OTH
  await Promise.all(subs.map(subName =>
    drive.files.create({
      requestBody: {
        name: subName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [folder.id],
      },
    })
  ))

  return { folderId: folder.id, folderUrl: folder.webViewLink, folderName }
}

export async function listProjectFiles(accessToken, folderId) {
  const drive = getDriveClient(accessToken)
  const { data } = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'files(id,name,mimeType,webViewLink,createdTime,size)',
    orderBy: 'createdTime desc',
  })
  return data.files || []
}

export async function uploadFileToDrive(accessToken, folderId, fileName, mimeType, content) {
  const drive = getDriveClient(accessToken)
  const { data: file } = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId] },
    media: { mimeType, body: content },
    fields: 'id,name,webViewLink',
  })
  return file
}

export async function shareFileWithClient(accessToken, fileId, clientEmail) {
  const drive = getDriveClient(accessToken)
  await drive.permissions.create({
    fileId,
    requestBody: { type: 'user', role: 'reader', emailAddress: clientEmail },
    sendNotificationEmail: false,
  })
}
