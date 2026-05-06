import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { alertEmailHtml } from '@/lib/alert-email'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = () => new Resend(process.env.RESEND_API_KEY!)

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = admin()

  const { data: rules } = await db
    .from('alert_rules')
    .select('*, organizations(plan)')
    .eq('enabled', true)

  if (!rules?.length) return NextResponse.json({ checked: 0 })

  const now = new Date()
  const fired: string[] = []

  for (const rule of rules) {
    // Rate-limit: once per hour per rule
    if (rule.last_fired_at) {
      const lastFired = new Date(rule.last_fired_at)
      if (now.getTime() - lastFired.getTime() < 60 * 60 * 1000) continue
    }

    const windowStart = new Date(now.getTime() - rule.window_minutes * 60 * 1000).toISOString()

    let breached = false
    let currentValue = 0

    if (rule.metric === 'error_rate') {
      const { data } = await db
        .from('spans')
        .select('status')
        .eq('org_id', rule.org_id)
        .gte('created_at', windowStart)

      if (data && data.length > 0) {
        const errors = data.filter(s => s.status === 'error').length
        currentValue = Math.round((errors / data.length) * 100)
        breached = currentValue > rule.threshold
      }
    }

    if (rule.metric === 'p95_latency') {
      const { data } = await db
        .from('spans')
        .select('duration_ms')
        .eq('org_id', rule.org_id)
        .gte('created_at', windowStart)
        .not('duration_ms', 'is', null)
        .order('duration_ms', { ascending: true })

      if (data && data.length > 0) {
        const idx = Math.floor(data.length * 0.95)
        currentValue = data[idx]?.duration_ms ?? 0
        breached = currentValue > rule.threshold
      }
    }

    if (rule.metric === 'cost_per_hour') {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
      const { data } = await db
        .from('spans')
        .select('cost_usd')
        .eq('org_id', rule.org_id)
        .gte('created_at', hourAgo)
        .not('cost_usd', 'is', null)

      if (data) {
        currentValue = data.reduce((sum, s) => sum + (s.cost_usd ?? 0), 0)
        breached = currentValue > rule.threshold
      }
    }

    if (!breached) continue

    // Send email to all recipients
    const metricLabel = rule.metric === 'error_rate'
      ? `${currentValue}% error rate (threshold: ${rule.threshold}%)`
      : rule.metric === 'p95_latency'
      ? `${currentValue}ms p95 latency (threshold: ${rule.threshold}ms)`
      : `$${currentValue.toFixed(4)} cost/hour (threshold: $${rule.threshold})`

    for (const email of (rule.email_recipients ?? [])) {
      await resend().emails.send({
        from: 'Vantra Alerts <alerts@vantra.dev>',
        to: email,
        subject: `Alert: ${rule.name} — Vantra`,
        html: alertEmailHtml({ ruleName: rule.name, metricLabel, windowMinutes: rule.window_minutes }),
      })
    }

    // Send Slack notification
    if (rule.slack_webhook_url) {
      await fetch(rule.slack_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🚨 *Vantra Alert: ${rule.name}*`,
              },
            },
            {
              type: 'section',
              fields: [
                { type: 'mrkdwn', text: `*Metric*\n${metricLabel}` },
                { type: 'mrkdwn', text: `*Window*\nLast ${rule.window_minutes} minutes` },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'View traces →' },
                  url: 'https://vantra.dev/dashboard/traces',
                  style: 'primary',
                },
              ],
            },
          ],
        }),
      }).catch(() => {})
    }

    // Update last_fired_at
    await db.from('alert_rules').update({ last_fired_at: now.toISOString() }).eq('id', rule.id)
    fired.push(rule.id)
  }

  return NextResponse.json({ checked: rules.length, fired: fired.length })
}
