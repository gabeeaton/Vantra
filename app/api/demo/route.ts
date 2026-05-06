import { NextResponse } from 'next/server'

const now = Date.now()
const day = 86400000

function d(offsetDays: number) {
  return new Date(now + offsetDays * day).toISOString().slice(0, 10)
}

export const DEMO_STATS = {
  tracesToday: 1847,
  errorsLast24h: 12,
  totalCostToday: 4.2831,
  avgLatencyMs: 1243,
}

export const DEMO_CHART = {
  days: [
    { date: d(-6), traces: 312,  tokens: 48200,  cost: 0.94, errors: 3 },
    { date: d(-5), traces: 489,  tokens: 71800,  cost: 1.42, errors: 5 },
    { date: d(-4), traces: 203,  tokens: 31400,  cost: 0.61, errors: 1 },
    { date: d(-3), traces: 671,  tokens: 98700,  cost: 1.91, errors: 8 },
    { date: d(-2), traces: 544,  tokens: 82100,  cost: 1.58, errors: 4 },
    { date: d(-1), traces: 892,  tokens: 134600, cost: 2.61, errors: 9 },
    { date: d(0),  traces: 1847, tokens: 287300, cost: 4.28, errors: 12 },
  ],
}

export const DEMO_TRACES = [
  { id: 'demo-1', name: 'support_agent_run', status: 'ok',    duration_ms: 4231, total_tokens: 1420, total_cost_usd: 0.00421, created_at: new Date(now - 2  * 60000).toISOString(), projects: { name: 'customer-support' } },
  { id: 'demo-2', name: 'classify_intent',   status: 'ok',    duration_ms: 312,  total_tokens: 220,  total_cost_usd: 0.00008, created_at: new Date(now - 5  * 60000).toISOString(), projects: { name: 'customer-support' } },
  { id: 'demo-3', name: 'support_agent_run', status: 'error', duration_ms: 8941, total_tokens: 3100, total_cost_usd: 0.00912, created_at: new Date(now - 11 * 60000).toISOString(), projects: { name: 'customer-support' } },
  { id: 'demo-4', name: 'research_agent',    status: 'ok',    duration_ms: 6821, total_tokens: 5420, total_cost_usd: 0.01621, created_at: new Date(now - 18 * 60000).toISOString(), projects: { name: 'research-bot' } },
  { id: 'demo-5', name: 'support_agent_run', status: 'ok',    duration_ms: 3102, total_tokens: 980,  total_cost_usd: 0.00291, created_at: new Date(now - 34 * 60000).toISOString(), projects: { name: 'customer-support' } },
  { id: 'demo-6', name: 'summarize_thread',  status: 'ok',    duration_ms: 1893, total_tokens: 2840, total_cost_usd: 0.00841, created_at: new Date(now - 52 * 60000).toISOString(), projects: { name: 'research-bot' } },
  { id: 'demo-7', name: 'research_agent',    status: 'ok',    duration_ms: 7234, total_tokens: 6120, total_cost_usd: 0.01834, created_at: new Date(now - 78 * 60000).toISOString(), projects: { name: 'research-bot' } },
  { id: 'demo-8', name: 'support_agent_run', status: 'ok',    duration_ms: 2891, total_tokens: 1140, total_cost_usd: 0.00341, created_at: new Date(now - 94 * 60000).toISOString(), projects: { name: 'customer-support' } },
]

export const DEMO_ALERTS = [
  { id: 'alert-1', name: 'High error rate',    metric: 'error_rate',    threshold: 10,   window_minutes: 15, email_recipients: ['team@acme.com'], enabled: true,  created_at: new Date(now - 3 * day).toISOString(), projects: { name: 'customer-support' } },
  { id: 'alert-2', name: 'Latency spike',      metric: 'p95_latency',   threshold: 5000, window_minutes: 15, email_recipients: ['team@acme.com'], enabled: true,  created_at: new Date(now - 5 * day).toISOString(), projects: { name: 'customer-support' } },
  { id: 'alert-3', name: 'Cost over $2/hr',    metric: 'cost_per_hour', threshold: 2,    window_minutes: 60, email_recipients: ['team@acme.com'], enabled: false, created_at: new Date(now - 7 * day).toISOString(), projects: { name: 'research-bot' } },
]

export const DEMO_TRACE_DETAIL = {
  trace: {
    id: 'demo-1',
    name: 'support_agent_run',
    status: 'ok',
    duration_ms: 4231,
    total_tokens: 1420,
    total_cost_usd: 0.00421,
  },
  spans: [
    {
      id: 's1', span_id: 's1', parent_span_id: null,
      name: 'support_agent_run', kind: 'agent', model: null, provider: null,
      duration_ms: 4231, status: 'ok', error_message: null,
      input_tokens: null, output_tokens: null, cost_usd: null,
      input: null, output: null,
      start_time: new Date(now - 5 * 60000).toISOString(),
    },
    {
      id: 's2', span_id: 's2', parent_span_id: 's1',
      name: 'openai.chat (classify)', kind: 'llm', model: 'gpt-4o-mini', provider: 'openai',
      duration_ms: 312, status: 'ok', error_message: null,
      input_tokens: 186, output_tokens: 34, cost_usd: 0.000048,
      input: { messages: [{ role: 'user', content: 'Classify this support ticket: "App keeps crashing on login"' }] },
      output: { content: 'bug_report' },
      start_time: new Date(now - 5 * 60000 + 10).toISOString(),
    },
    {
      id: 's3', span_id: 's3', parent_span_id: 's1',
      name: 'search_knowledge_base', kind: 'tool', model: null, provider: null,
      duration_ms: 891, status: 'ok', error_message: null,
      input_tokens: null, output_tokens: null, cost_usd: null,
      input: { query: 'login crash bug' },
      output: { docs: ['Known issue: iOS 17.4 login crash fixed in v2.3.1', 'Workaround: clear app cache'] },
      start_time: new Date(now - 5 * 60000 + 330).toISOString(),
    },
    {
      id: 's4', span_id: 's4', parent_span_id: 's1',
      name: 'openai.chat (respond)', kind: 'llm', model: 'gpt-4o', provider: 'openai',
      duration_ms: 2891, status: 'ok', error_message: null,
      input_tokens: 820, output_tokens: 380, cost_usd: 0.00381,
      input: { messages: [{ role: 'user', content: 'App keeps crashing on login' }] },
      output: { content: "Hi! This is a known issue on iOS 17.4 that's fixed in our latest update (v2.3.1). Please update the app from the App Store. In the meantime, clearing your app cache should help. Let me know if you need anything else!" },
      start_time: new Date(now - 5 * 60000 + 1230).toISOString(),
    },
    {
      id: 's5', span_id: 's5', parent_span_id: 's1',
      name: 'send_reply', kind: 'tool', model: null, provider: null,
      duration_ms: 137, status: 'ok', error_message: null,
      input_tokens: null, output_tokens: null, cost_usd: null,
      input: { ticket_id: 'TKT-4821', channel: 'email' },
      output: { sent: true, message_id: 'msg_9xK2p' },
      start_time: new Date(now - 5 * 60000 + 4100).toISOString(),
    },
  ],
}

export async function GET() {
  return NextResponse.json({
    stats: DEMO_STATS,
    chart: DEMO_CHART,
    traces: DEMO_TRACES,
    alerts: DEMO_ALERTS,
    traceDetail: DEMO_TRACE_DETAIL,
  })
}
