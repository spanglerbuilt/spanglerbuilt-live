// POST { projectId, preview? }
// Generates a PDF contract using Puppeteer + @sparticuz/chromium-min
// preview=true returns PDF without saving to Supabase (used by template admin)

import { getAdminClient } from '../../../lib/supabase-server'
import generateContractHTML from '../../../lib/generateContract'
import fs from 'fs'
import path from 'path'

export const config = { api: { responseLimit: '20mb' }, maxDuration: 60 }

async function getPuppeteer() {
  // Use @sparticuz/chromium-min + puppeteer-core on Vercel / production
  // Falls back to local puppeteer in development
  try {
    const chromium    = require('@sparticuz/chromium-min')
    const puppeteer   = require('puppeteer-core')
    const execPath    = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.tar'
    )
    return { puppeteer, execPath, chromium }
  } catch (e) {
    // local dev fallback
    const puppeteer   = require('puppeteer')
    return { puppeteer, execPath: null, chromium: null }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectId, preview } = req.body || {}
  if (!projectId) return res.status(400).json({ error: 'projectId required' })

  const supabase = await getAdminClient()
  if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

  // ── Fetch project ─────────────────────────────────────────────────────────
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projErr || !project) return res.status(404).json({ error: 'Project not found' })

  // ── Fetch matching contract template ──────────────────────────────────────
  const projectType = project.project_type || 'Basement'
  let { data: template } = await supabase
    .from('contract_templates')
    .select('*')
    .eq('project_type', projectType)
    .eq('is_active', true)
    .single()

  // Fallback to Basement if no exact match
  if (!template) {
    const { data: fallback } = await supabase
      .from('contract_templates')
      .select('*')
      .eq('project_type', 'Basement')
      .eq('is_active', true)
      .single()
    template = fallback
  }

  const section3Text = template ? template.section_3_text : ''
  const contractHTML = generateContractHTML(project, section3Text)

  // ── Build logo base64 ────────────────────────────────────────────────────
  let logoBase64 = ''
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuf  = fs.readFileSync(logoPath)
    logoBase64     = 'data:image/png;base64,' + logoBuf.toString('base64')
  } catch (e) { /* logo not found, skip */ }

  const headerTemplate = `
    <div style="width:100%;padding:10px 40px 6px 40px;display:flex;justify-content:center;align-items:center;border-bottom:2px solid #D06830;">
      ${logoBase64 ? `<img src="${logoBase64}" style="height:50px;width:auto;"/>` : '<span style="font-size:14pt;font-weight:bold;font-family:Arial;">SpanglerBuilt Inc.</span>'}
    </div>`

  const footerTemplate = `
    <div style="width:100%;text-align:center;font-size:8.5px;color:#555;border-top:1px solid #D06830;padding:5px 40px;font-family:Arial;">
      SpanglerBuilt Inc. &nbsp;|&nbsp; 44 Milton Ave, Alpharetta GA 30009 &nbsp;|&nbsp; michael@spanglerbuilt.com &nbsp;|&nbsp; (404) 492-7650 &nbsp;|&nbsp; spanglerbuilt.com &nbsp;|&nbsp;
      We Build More Than Projects — We Build Lifestyles. &nbsp;|&nbsp;
      Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`

  // ── Launch Puppeteer ──────────────────────────────────────────────────────
  let browser
  try {
    const { puppeteer, execPath, chromium } = await getPuppeteer()

    const launchOpts = {
      args: chromium ? chromium.args : ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
      defaultViewport: { width: 1200, height: 900 },
      headless: true,
    }
    if (execPath) launchOpts.executablePath = execPath

    browser = await puppeteer.launch(launchOpts)
    const page = await browser.newPage()
    await page.setContent(contractHTML, { waitUntil: 'networkidle0' })

    const pdfBuf = await page.pdf({
      format:               'Letter',
      margin:               { top: '110px', bottom: '70px', left: '60px', right: '60px' },
      displayHeaderFooter:  true,
      headerTemplate,
      footerTemplate,
      printBackground:      true,
    })

    await browser.close()

    // ── Save to Supabase + create contract record (unless preview) ──────────
    if (!preview) {
      const filename = 'contracts/' + projectId + '_' + Date.now() + '.pdf'
      let pdfUrl = null

      const { data: uploadData } = await supabase.storage
        .from('contracts')
        .upload(filename, Buffer.from(pdfBuf), { contentType: 'application/pdf', upsert: true })

      if (uploadData) {
        const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filename)
        pdfUrl = urlData?.publicUrl || null
      }

      // Upsert contract record
      await supabase.from('project_contracts').upsert({
        project_id:   projectId,
        template_id:  template?.id || null,
        project_type: projectType,
        status:       'draft',
        contract_html: contractHTML,
        pdf_url:      pdfUrl,
        updated_at:   new Date().toISOString(),
      }, { onConflict: 'project_id' })
    }

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="SpanglerBuilt_Contract_' + (project.project_number || projectId) + '.pdf"')
    res.send(Buffer.from(pdfBuf))

  } catch (err) {
    if (browser) await browser.close().catch(function(){})
    console.error('Contract generation error:', err)
    res.status(500).json({ error: err.message || 'PDF generation failed' })
  }
}
