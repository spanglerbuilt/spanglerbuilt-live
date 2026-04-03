// POST /api/generate-image
// { prompt } → generates image via DALL-E 3, returns { url }
// API key stays server-side — never exposed to client.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  var prompt = (req.body.prompt || '').trim()
  if (!prompt) return res.status(400).json({ error: 'Prompt required' })
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not configured' })

  // Prepend SpanglerBuilt style prefix for consistent brand aesthetic
  var styledPrompt = 'SpanglerBuilt style, high-end residential construction photography, ' +
    'professional architectural photo, warm natural lighting, clean and luxurious finish quality, ' +
    'Metro Atlanta home — ' + prompt

  try {
    var response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model:           'dall-e-3',
        prompt:          styledPrompt,
        n:               1,
        size:            '1792x1024',   // landscape — ideal for ads
        quality:         'hd',
        response_format: 'url',
      }),
    })

    var data = await response.json()

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI error' })
    }

    return res.status(200).json({
      url:            data.data[0].url,
      revisedPrompt:  data.data[0].revised_prompt,
    })
  } catch(e) {
    return res.status(500).json({ error: e.message })
  }
}
