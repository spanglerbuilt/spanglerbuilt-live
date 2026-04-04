export default function handler(req, res) {
  return res.status(200).json({ connected: !!process.env.HUBSPOT_API_KEY })
}
