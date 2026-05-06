import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateApiKey } from '@/lib/api-keys'
import { NextRequest, NextResponse } from 'next/server'

async function getOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  return data?.org_id ?? null
}

export async function GET() {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const [{ data: keys }, { data: org }] = await Promise.all([
    supabase.from('api_keys').select('id, name, created_at, last_used_at').eq('org_id', orgId).order('created_at', { ascending: false }),
    supabase.from('organizations').select('plan').eq('id', orgId).single(),
  ])

  return NextResponse.json({ keys: keys ?? [], plan: org?.plan ?? 'free' })
}

export async function POST(req: NextRequest) {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { raw, hash } = generateApiKey()
  await admin.from('api_keys').insert({ org_id: orgId, key_hash: hash, name: name || 'New key' })

  return NextResponse.json({ apiKey: raw })
}

export async function DELETE(req: NextRequest) {
  const orgId = await getOrgId()
  if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  const supabase = await createClient()
  await supabase.from('api_keys').delete().eq('id', id).eq('org_id', orgId)

  return NextResponse.json({ ok: true })
}
