import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { digestEmailHtml } from '@/lib/digest-email'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: 'no RESEND_API_KEY' })
  }

  const db = admin()
  const resend = new Resend(process.env.RESEND_API_KEY)

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekStart = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

  // Get all orgs
  const { data: orgs } = await db.from('organizations').select('id, name')
  if (!orgs?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  let skipped = 0

  for (const org of orgs) {
    try {
      // Check if org had any activity this week
      const { count: traceCount } = await db
        .from('traces')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', org.id)
        .gte('created_at', weekAgo.toISOString())

      if (!traceCount || traceCount === 0) {
        skipped++
        continue
      }

      // Get users in this org who have an email
      const { data: members } = await db
        .from('users')
        .select('email')
        .eq('org_id', org.id)
        .not('email', 'is', null)

      const emails = (members ?? []).map(m => m.email).filter(Boolean)
      if (emails.length === 0) {
        skipped++
        continue
      }

      // Aggregate span data for the week (cap at 10k rows to keep it fast)
      const { data: spans } = await db
        .from('spans')
        .select('cost_usd, input_tokens, output_tokens, status, model')
        .eq('org_id', org.id)
        .gte('created_at', weekAgo.toISOString())
        .limit(10000)

      const spanData = spans ?? []
      const totalCostUsd = spanData.reduce((s, r) => s + (r.cost_usd ?? 0), 0)
      const totalTokens = spanData.reduce((s, r) => s + (r.input_tokens ?? 0) + (r.output_tokens ?? 0), 0)
      const errorCount = spanData.filter(r => r.status === 'error').length
      const errorRate = spanData.length > 0 ? (errorCount / spanData.length) * 100 : 0

      // Top models by call count
      const modelCounts: Record<string, number> = {}
      for (const span of spanData) {
        if (span.model && span.model !== 'unknown') {
          modelCounts[span.model] = (modelCounts[span.model] ?? 0) + 1
        }
      }
      const topModels = Object.entries(modelCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([model, count]) => ({ model, count }))

      const html = digestEmailHtml({
        orgName: org.name ?? 'Your project',
        weekStart,
        traceCount,
        totalTokens,
        totalCostUsd,
        errorRate,
        topModels,
      })

      // Send to all members — catch per-email so one bad address doesn't block others
      for (const email of emails) {
        await resend.emails.send({
          from: 'Vantra <digest@vantra.dev>',
          to: email,
          subject: `Your week in Vantra — ${traceCount.toLocaleString()} traces, ${totalCostUsd < 0.01 ? `$${totalCostUsd.toFixed(5)}` : `$${totalCostUsd.toFixed(2)}`} spent`,
          html,
        }).catch(() => {})
      }

      sent++
    } catch {
      // Don't let one org failure block others
    }
  }

  return NextResponse.json({ sent, skipped, total: orgs.length })
}
