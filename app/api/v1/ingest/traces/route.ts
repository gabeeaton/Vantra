import { resolveApiKey } from '@/lib/ingest-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const auth = await resolveApiKey(req.headers.get('authorization'))
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { supabase, orgId } = auth

  // Resolve project_id from name, fall back to org's first project
  let projectId = body.project_id
  if (!projectId) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name')
      .eq('org_id', orgId)

    if (projects?.length) {
      const match = body.project
        ? projects.find((p: { id: string; name: string }) => p.name === body.project)
        : null
      projectId = match?.id ?? projects[0].id
    }
  }

  const promptVersion = typeof body.prompt_version === 'string'
    ? body.prompt_version.trim().slice(0, 100)
    : undefined

  const metadata = { ...(body.metadata || {}) }
  if (promptVersion) metadata.prompt_version = promptVersion

  const { error } = await supabase.from('traces').insert({
    org_id: orgId,
    project_id: projectId,
    trace_id: body.trace_id,
    name: body.name,
    start_time: new Date(body.start_time * 1000).toISOString(),
    end_time: body.end_time ? new Date(body.end_time * 1000).toISOString() : null,
    duration_ms: body.duration_ms,
    status: body.status || 'ok',
    total_tokens: body.total_tokens || 0,
    total_cost_usd: body.total_cost_usd || 0,
    metadata,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
