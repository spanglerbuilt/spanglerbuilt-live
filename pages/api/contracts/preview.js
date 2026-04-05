// POST { projectType, section3Text? } → generates sample PDF with dummy project data
import generateContractHTML from '../../../lib/generateContract'
import { getAdminClient } from '../../../lib/supabase-server'
import fs from 'fs'
import path from 'path'

export const config = { api: { responseLimit: '20mb' }, maxDuration: 60 }

async function getPuppeteer() {
  try {
    const chromium  = require('@sparticuz/chromium-min')
    const puppeteer = require('puppeteer-core')
    const execPath  = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v143.0.0/chromium-v143.0.0-pack.tar'
    )
    return { puppeteer, execPath, chromium }
  } catch (e) {
    const puppeteer = require('puppeteer')
    return { puppeteer, execPath: null, chromium: null }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectType, section3Text } = req.body || {}

  // Build sample project data
  const sampleProject = {
    project_number:      'SB-2026-PREVIEW',
    project_type:        projectType || 'Basement',
    client_name:         'Jane & John Sample',
    client_1_name:       'Jane Sample',
    client_2_name:       'John Sample',
    client_address:      '123 Preview Lane',
    client_city_state_zip: 'Alpharetta, GA 30009',
    address:             '123 Preview Lane, Alpharetta, GA 30009',
    estimate_total:      85000,
    estimate_number:     'EST-2026-PREVIEW',
    estimate_date:       'April 4, 2026',
    duration_weeks:      '10',
    contract_date:       new Date(),
    commencement_date:   new Date(Date.now() + 14 * 86400000),
    completion_date:     new Date(Date.now() + 84 * 86400000),
    permit_note:         'Subject to permit issuance timeline from Cherokee County.',
  }

  // If section3Text is provided (from template editor), use it; otherwise fetch from Supabase
  let sec3Text = section3Text
  if (!sec3Text) {
    try {
      const supabase = await getAdminClient()
      if (supabase) {
        const { data: tpl } = await supabase
          .from('contract_templates')
          .select('section_3_text')
          .eq('project_type', projectType || 'Basement')
          .eq('is_active', true)
          .single()
        sec3Text = tpl?.section_3_text || ''
      }
    } catch(e) {}
  }

  const contractHTML = generateContractHTML(sampleProject, sec3Text || '')

  // Build logo base64
  let logoBase64 = ''
  try {
    const logoBuf = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'))
    logoBase64    = 'data:image/png;base64,' + logoBuf.toString('base64')
  } catch(e) {}

  const headerTemplate = `
    <div style="width:100%;padding:10px 40px 6px 40px;display:flex;justify-content:center;align-items:center;border-bottom:2px solid #D06830;">
      ${logoBase64 ? `<img src="${logoBase64}" style="height:50px;width:auto;"/>` : '<span style="font-family:Arial;font-weight:bold;font-size:14pt;">SpanglerBuilt Inc.</span>'}
    </div>`
  const footerTemplate = `
    <div style="width:100%;text-align:center;font-size:8.5px;color:#555;border-top:1px solid #D06830;padding:5px 40px;font-family:Arial;">
      SpanglerBuilt Inc. &nbsp;|&nbsp; 44 Milton Ave, Alpharetta GA 30009 &nbsp;|&nbsp; michael@spanglerbuilt.com &nbsp;|&nbsp; (404) 492-7650 &nbsp;|&nbsp; spanglerbuilt.com &nbsp;|&nbsp; PREVIEW ONLY
      &nbsp;|&nbsp; Page <span class="pageNumber"></span> of <span class="totalPages"></span>
    </div>`

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
      format: 'Letter',
      margin: { top: '110px', bottom: '70px', left: '60px', right: '60px' },
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      printBackground: true,
    })
    await browser.close()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="SpanglerBuilt_Contract_Preview.pdf"')
    res.send(Buffer.from(pdfBuf))
  } catch(err) {
    if (browser) await browser.close().catch(function(){})
    res.status(500).json({ error: err.message || 'Preview generation failed' })
  }
}
