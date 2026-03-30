import Anthropic from '@anthropic-ai/sdk'
var client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
var SYSTEM = 'You are the AI assistant for SpanglerBuilt Inc., a licensed general contractor in Metro Atlanta, Georgia. Owner: Michael Spangler. Phone: (404) 492-7650. Address: 44 Milton Ave, Suite 243, Woodstock, GA 30188. Specializes in basement renovations, kitchen remodels, bathroom remodels, home additions, custom home builds. Service area: Cherokee, Fulton, Cobb, DeKalb counties. All estimates use 4 tiers: Good (1.0x), Better (1.18x), Best (1.38x), Luxury (1.65x). Project numbers use format SB-YYYY-NNN.'
var PROMPTS = {
  estimate:    function(d){ return 'Generate a detailed construction estimate for: ' + d.prompt + '. Use CSI 16-division format. Show all 4 tiers (Good/Better/Best/Luxury) with totals.' },
  proposal:    function(d){ return 'Write a professional client proposal for SpanglerBuilt Inc.: ' + d.prompt + '. Include scope, tier pricing, payment schedule, and call to action.' },
  email:       function(d){ return 'Draft a follow-up email from Michael Spangler at SpanglerBuilt Inc.: ' + d.prompt + '. Include subject line. Keep under 150 words.' },
  selections:  function(d){ return 'Recommend specific material selections for: ' + d.prompt + '. For each tier (Good/Better/Best/Luxury) give product name, brand, specs, and Metro Atlanta pricing.' },
  contract:    function(d){ return 'Generate a construction contract for SpanglerBuilt Inc.: ' + d.prompt + '. Include all standard sections, payment schedule, and signature blocks.' },
  changeOrder: function(d){ return 'Draft a change order document for SpanglerBuilt Inc.: ' + d.prompt + '. Include description, cost breakdown, and signature blocks.' },
  clientChat:  function(d){ return 'A client is asking about their SpanglerBuilt project: ' + d.prompt + '. Answer helpfully. If unsure, direct them to call Michael at (404) 492-7650.' },
  review:      function(d){ return 'Write a professional response to this Google review for SpanglerBuilt Inc.: ' + d.prompt + '. Keep under 75 words.' },
  taskPlan:    function(d){ return 'Create a detailed week-by-week project task plan for SpanglerBuilt Inc.: ' + d.prompt + '. Include phases, tasks, responsible parties, and milestones.' },
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  var action = req.body.action
  var data   = req.body.data || {}
  if (!action || !PROMPTS[action]) return res.status(400).json({ error: 'Unknown action: ' + action })
  try {
    var message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{ role: 'user', content: PROMPTS[action](data) }],
    })
    return res.status(200).json({ result: message.content[0].text })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
