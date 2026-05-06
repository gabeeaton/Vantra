import { createClient } from '@supabase/supabase-js'
import { hashApiKey } from './api-keys'

// Uses service role to bypass RLS for ingest (SDK calls don't have user sessions)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function resolveApiKey(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null

  const raw = authHeader.replace('Bearer ', '')
  const hash = hashApiKey(raw)

  const { data: apiKey } = await getAdminClient()
    .from('api_keys')
    .select('org_id')
    .eq('key_hash', hash)
    .single()

  if (!apiKey) return null

  // Fire-and-forget last_used update
  getAdminClient()
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', hash)

  return { orgId: apiKey.org_id, supabase: getAdminClient() }
}
