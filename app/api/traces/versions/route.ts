import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()

  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  // Fetch up to 2000 traces that have a prompt_version set
  const { data, error } = await supabase
    .from('traces')
    .select('status, duration_ms, total_cost_usd, metadata')
    .eq('org_id', userData.org_id)
    .not('metadata->>prompt_version', 'is', null)
    .order('created_at', { ascending: false })
    .limit(2000)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Aggregate per version in JS
  const versionMap = new Map<string, {
    count: number
    errors: number
    totalDurationMs: number
    durCount: number
    totalCost: number
  }>()

  for (const t of data ?? []) {
    const v = (t.metadata as Record<string, string> | null)?.prompt_version
    if (!v) continue
    const entry = versionMap.get(v) ?? { count: 0, errors: 0, totalDurationMs: 0, durCount: 0, totalCost: 0 }
    entry.count++
    if (t.status === 'error') entry.errors++
    if (t.duration_ms != null) { entry.totalDurationMs += t.duration_ms; entry.durCount++ }
    entry.totalCost += t.total_cost_usd ?? 0
    versionMap.set(v, entry)
  }

  const versions = Array.from(versionMap.entries()).map(([version, s]) => ({
    version,
    count: s.count,
    error_rate: s.count > 0 ? s.errors / s.count : 0,
    avg_duration_ms: s.durCount > 0 ? Math.round(s.totalDurationMs / s.durCount) : null,
    avg_cost_usd: s.count > 0 ? s.totalCost / s.count : 0,
    total_cost_usd: s.totalCost,
  }))

  versions.sort((a, b) => b.count - a.count)

  return NextResponse.json({ versions })
}
