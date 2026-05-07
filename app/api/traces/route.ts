import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('project_id')
  const status = searchParams.get('status')
  const search = (searchParams.get('search') || '').trim().slice(0, 200)
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')
  const promptVersion = (searchParams.get('prompt_version') || '').trim().slice(0, 100)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = supabase
    .from('traces')
    .select('id, trace_id, name, status, duration_ms, total_tokens, total_cost_usd, created_at, metadata, projects(name)', { count: 'exact' })
    .eq('org_id', userData.org_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (projectId) query = query.eq('project_id', projectId)
  if (status) query = query.eq('status', status)
  if (search) query = query.ilike('name', `%${search}%`)
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo)
  if (promptVersion) query = query.eq('metadata->>prompt_version', promptVersion)

  const { data, count, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ traces: data, total: count })
}
