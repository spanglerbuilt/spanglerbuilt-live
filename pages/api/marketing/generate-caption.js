// POST { projectType } → { title, caption, description }

import Anthropic from '@anthropic-ai/sdk'

var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

var SYSTEM = 'Write social media content for SpanglerBuilt Inc., a Design/Build Contractor in North Georgia. You MUST respond with ONLY valid JSON — no markdown, no code fences. Keys: title (punchy video title, 70 chars max), caption (150 chars social caption with 5 hashtags, ending with: We Build More Than Projects — We Build Lifestyles. #SpanglerBuilt), description (YouTube/Facebook description, 300 chars, professional).'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { projectType } = req.body || {}
  if (!projectType) return res.status(400).json({ error: 'projectType required' })

  try {
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 400,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: 'Project type: ' + projectType }],
    })
    const text  = message.content?.[0]?.text || '{}'
    const clean = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
    const data  = JSON.parse(clean)
    return res.status(200).json({ ok: true, ...data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
