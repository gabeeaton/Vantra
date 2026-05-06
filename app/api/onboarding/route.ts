import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { generateApiKey } from '@/lib/api-keys'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // Use session client just to verify the user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orgName, projectName } = await req.json()
  if (!orgName || !projectName) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Use service role for all writes to bypass RLS during onboarding
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

  const { data: org, error: orgError } = await admin
    .from('organizations')
    .insert({ name: orgName, slug: `${slug}-${Date.now()}` })
    .select()
    .single()

  if (orgError) return NextResponse.json({ error: orgError.message }, { status: 500 })

  await admin.from('users').upsert({
    id: user.id,
    org_id: org.id,
    email: user.email,
    role: 'owner',
  })

  const { data: project } = await admin
    .from('projects')
    .insert({ org_id: org.id, name: projectName })
    .select()
    .single()

  const { raw, hash } = generateApiKey()
  await admin.from('api_keys').insert({
    org_id: org.id,
    key_hash: hash,
    name: 'Default key',
  })

  return NextResponse.json({ apiKey: raw, projectId: project?.id })
}
