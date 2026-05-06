import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase
    .from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: traces } = await supabase
    .from('traces')
    .select('created_at, total_tokens, total_cost_usd, status, duration_ms')
    .eq('org_id', userData.org_id)
    .gte('created_at', since7d)
    .order('created_at', { ascending: true })

  // Bucket into days using UTC so server and DB timestamps always agree
  const toKey = (iso: string) => iso.slice(0, 10)
  const todayUTC = new Date().toISOString().slice(0, 10)

  const days: Record<string, { date: string; traces: number; tokens: number; cost: number; errors: number }> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    const key = d.toISOString().slice(0, 10)
    days[key] = { date: key, traces: 0, tokens: 0, cost: 0, errors: 0 }
  }

  for (const t of traces ?? []) {
    const key = toKey(t.created_at)
    if (!days[key]) continue
    days[key].traces++
    days[key].tokens += t.total_tokens || 0
    days[key].cost += t.total_cost_usd || 0
    if (t.status === 'error') days[key].errors++
  }

  return NextResponse.json({ days: Object.values(days), todayUTC })
}
