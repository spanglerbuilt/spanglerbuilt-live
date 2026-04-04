// POST { brief } → { copy: { google_headline, google_description, facebook_caption,
//                           tiktok_caption, youtube_title, email_subject, email_preview } }

import Anthropic from '@anthropic-ai/sdk'

var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

var SYSTEM = 'You are a marketing expert for SpanglerBuilt Inc., a Design/Build Contractor, GC & Home Builder in North Georgia. Generate compelling ad copy for the campaign details provided. You MUST respond with ONLY valid JSON — no markdown, no code fences, just the raw JSON object. The JSON must have these exact keys: google_headline (30 chars max), google_description (90 chars max), facebook_caption (125 chars max), tiktok_caption (150 chars max with hashtags), youtube_title (70 chars max), email_subject (50 chars max), email_preview (90 chars max). Always end facebook_caption and tiktok_caption with: We Build More Than Projects — We Build Lifestyles. #SpanglerBuilt #NorthGeorgia #DesignBuild'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { brief } = req.body || {}
  if (!brief) return res.status(400).json({ error: 'brief required' })

  try {
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 800,
      system:     SYSTEM,
      messages:   [{ role: 'user', content: 'Campaign details:\n' + brief }],
    })
    const text = message.content?.[0]?.text || '{}'
    // Strip any accidental markdown fences
    const clean = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
    const copy = JSON.parse(clean)
    return res.status(200).json({ ok: true, copy })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
