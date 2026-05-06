import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  return { orgId: data?.org_id ?? null, supabase }
}

export async function GET() {
  const result = await getOrgId()
  if (!result?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await result.supabase
    .from('alert_rules')
    .select('*, projects(name)')
    .eq('org_id', result.orgId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ alerts: data ?? [] })
}

export async function POST(req: NextRequest) {
  const result = await getOrgId()
  if (!result?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const VALID_METRICS = ['error_rate', 'p95_latency', 'cost_per_hour']
  if (!body.name || typeof body.name !== 'string' || body.name.length > 100) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
  if (!VALID_METRICS.includes(body.metric)) return NextResponse.json({ error: 'Invalid metric' }, { status: 400 })
  if (typeof body.threshold !== 'number' || body.threshold < 0) return NextResponse.json({ error: 'Invalid threshold' }, { status: 400 })

  const slackUrl = body.slack_webhook_url || null
  if (slackUrl && !slackUrl.startsWith('https://hooks.slack.com/')) return NextResponse.json({ error: 'Invalid Slack webhook URL' }, { status: 400 })

  const { data, error } = await result.supabase.from('alert_rules').insert({
    org_id: result.orgId,
    name: body.name.trim(),
    metric: body.metric,
    threshold: body.threshold,
    window_minutes: body.window_minutes || 15,
    email_recipients: body.email_recipients,
    slack_webhook_url: slackUrl,
    enabled: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alert: data })
}

export async function PATCH(req: NextRequest) {
  const result = await getOrgId()
  if (!result?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, enabled } = await req.json()
  await result.supabase.from('alert_rules').update({ enabled }).eq('id', id).eq('org_id', result.orgId)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const result = await getOrgId()
  if (!result?.orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await result.supabase.from('alert_rules').delete().eq('id', id).eq('org_id', result.orgId)
  return NextResponse.json({ ok: true })
}
