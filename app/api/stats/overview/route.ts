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

  const orgId = userData.org_id
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [tracesResult, errorResult, costResult, avgLatencyResult] = await Promise.all([
    // Total traces last 24h
    supabase
      .from('traces')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', since24h),

    // Error count last 24h
    supabase
      .from('traces')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'error')
      .gte('created_at', since24h),

    // Total cost last 24h
    supabase
      .from('traces')
      .select('total_cost_usd')
      .eq('org_id', orgId)
      .gte('created_at', since24h),

    // Avg latency last 24h
    supabase
      .from('traces')
      .select('duration_ms')
      .eq('org_id', orgId)
      .gte('created_at', since24h)
      .not('duration_ms', 'is', null),
  ])

  const totalCost = costResult.data?.reduce((sum, t) => sum + (t.total_cost_usd || 0), 0) ?? 0
  const durations = avgLatencyResult.data?.map((t) => t.duration_ms).filter(Boolean) ?? []
  const avgLatency = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  return NextResponse.json({
    tracesToday: tracesResult.count ?? 0,
    errorsLast24h: errorResult.count ?? 0,
    totalCostToday: totalCost,
    avgLatencyMs: avgLatency,
  })
}
