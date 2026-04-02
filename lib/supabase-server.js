// lib/supabase-server.js
// Returns an admin Supabase client, or null if env vars are not configured.
// Use this in all API routes so they degrade gracefully before Supabase is set up.

export async function getAdminClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return null
  var { createClient } = await import('@supabase/supabase-js')
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
}
