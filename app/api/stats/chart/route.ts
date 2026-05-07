import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  // tzOffset: minutes returned by getTimezoneOffset() on the client
  // e.g. UTC-5 → 300, UTC+5 → -300
  const tzOffset = parseInt(req.nextUrl.searchParams.get('tz_offset') ?? '0') || 0

  // Query 8 days so UTC+ users (whose local "7 days ago" may be 8 UTC days back) get full coverage
  const since8d = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()

  const { data: traces } = await supabase
    .from('traces')
    .select('created_at, total_tokens, total_cost_usd, status, duration_ms')
    .eq('org_id', userData.org_id)
    .gte('created_at', since8d)
    .order('created_at', { ascending: true })

  // Convert a UTC ISO string to the user's local date key (YYYY-MM-DD)
  const toLocalKey = (iso: string) => {
    const localMs = new Date(iso).getTime() - tzOffset * 60000
    return new Date(localMs).toISOString().slice(0, 10)
  }

  // Generate 7 bucket keys anchored to the user's local "today"
  const nowLocal = new Date(Date.now() - tzOffset * 60000)
  const days: Record<string, { date: string; traces: number; tokens: number; cost: number; errors: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(nowLocal)
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    days[key] = { date: key, traces: 0, tokens: 0, cost: 0, errors: 0 }
  }

  for (const t of traces ?? []) {
    const key = toLocalKey(t.created_at)
    if (!days[key]) continue
    days[key].traces++
    days[key].tokens += t.total_tokens || 0
    days[key].cost += t.total_cost_usd || 0
    if (t.status === 'error') days[key].errors++
  }

  return NextResponse.json({ days: Object.values(days) })
}
