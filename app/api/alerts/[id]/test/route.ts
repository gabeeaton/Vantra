import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { alertEmailHtml } from '@/lib/alert-email'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development' }, { status: 403 })
  }

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'No org' }, { status: 400 })

  const { data: rule } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('id', id)
    .eq('org_id', userData.org_id)
    .single()

  if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const metricLabel = rule.metric === 'error_rate'
    ? `5% error rate (threshold: ${rule.threshold}%) — TEST`
    : rule.metric === 'p95_latency'
    ? `${rule.threshold + 100}ms p95 latency (threshold: ${rule.threshold}ms) — TEST`
    : `$${(rule.threshold + 0.5).toFixed(4)} cost/hour (threshold: $${rule.threshold}) — TEST`

  // Test email
  if (rule.email_recipients?.length && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Vantra Alerts <alerts@vantra.dev>',
      to: rule.email_recipients[0],
      subject: `[TEST] Alert: ${rule.name} — Vantra`,
      html: alertEmailHtml({ ruleName: rule.name, metricLabel, windowMinutes: rule.window_minutes, isTest: true }),
    })
  }

  // Test Slack
  if (rule.slack_webhook_url) {
    await fetch(rule.slack_webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: `🧪 *TEST — Vantra Alert: ${rule.name}*` } },
          { type: 'section', fields: [
            { type: 'mrkdwn', text: `*Metric*\n${metricLabel}` },
            { type: 'mrkdwn', text: `*Status*\nThis is a test notification` },
          ]},
        ],
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}
