import { resolveApiKey } from '@/lib/ingest-auth'
import { NextRequest, NextResponse } from 'next/server'

const PLAN_LIMITS: Record<string, number> = {
  free: 50_000,
  indie: 500_000,
  pro: 2_000_000,
  team: 10_000_000,
  enterprise: Infinity,
}

export async function POST(req: NextRequest) {
  const auth = await resolveApiKey(req.headers.get('authorization'))
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { supabase, orgId } = auth

  // Check plan + enforce monthly span limit
  const { data: org } = await supabase
    .from('organizations')
    .select('plan, spans_this_month, spans_month')
    .eq('id', orgId)
    .single()

  if (org) {
    const currentMonth = new Date().toISOString().slice(0, 7) // "2026-05"
    const isNewMonth = org.spans_month !== currentMonth

    if (isNewMonth) {
      // Reset counter for new month
      await supabase
        .from('organizations')
        .update({ spans_this_month: 0, spans_month: currentMonth })
        .eq('id', orgId)
      org.spans_this_month = 0
    }

    const limit = PLAN_LIMITS[org.plan ?? 'free'] ?? PLAN_LIMITS.free
    if (org.spans_this_month >= limit) {
      return NextResponse.json(
        { error: 'Monthly span limit reached. Upgrade your plan at vantra.dev/dashboard/settings.' },
        { status: 402 }
      )
    }
  }

  // Support batch (array) or single span
  const spans = Array.isArray(body) ? body : [body]

  // Resolve trace DB id from client trace_id
  const traceIds = [...new Set(spans.map((s) => s.trace_id).filter(Boolean))]
  const traceMap: Record<string, string> = {}

  if (traceIds.length > 0) {
    const { data: traces } = await supabase
      .from('traces')
      .select('id, trace_id')
      .eq('org_id', orgId)
      .in('trace_id', traceIds)

    traces?.forEach((t: { id: string; trace_id: string }) => { traceMap[t.trace_id] = t.id })
  }

  const rows = spans.map((span) => ({
    org_id: orgId,
    trace_id: span.trace_id ? traceMap[span.trace_id] : null,
    span_id: span.span_id,
    parent_span_id: span.parent_span_id || null,
    name: span.name,
    kind: span.kind || 'chain',
    start_time: new Date(span.start_time * 1000).toISOString(),
    end_time: span.end_time ? new Date(span.end_time * 1000).toISOString() : null,
    duration_ms: span.duration_ms,
    status: span.status || 'ok',
    error_message: span.error_message || null,
    model: span.model || null,
    provider: span.provider || null,
    input_tokens: span.input_tokens || null,
    output_tokens: span.output_tokens || null,
    cost_usd: span.cost_usd || null,
    temperature: span.temperature || null,
    input: span.input ? truncateJson(span.input) : null,
    output: span.output ? truncateJson(span.output) : null,
    metadata: span.metadata || {},
  }))

  const { error } = await supabase.from('spans').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment span counter (fire and forget)
  supabase
    .from('organizations')
    .update({ spans_this_month: (org?.spans_this_month ?? 0) + rows.length })
    .eq('id', orgId)

  return NextResponse.json({ ok: true, count: rows.length })
}

function truncateJson(obj: unknown): unknown {
  const str = JSON.stringify(obj)
  if (str.length <= 2000) return obj
  return { _truncated: true, preview: str.slice(0, 2000) }
}
