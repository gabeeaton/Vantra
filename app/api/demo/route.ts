import { NextResponse } from 'next/server'

const now = Date.now()
const day = 86400000

export const DEMO_STATS = {
  tracesToday: 1847,
  errorsLast24h: 12,
  totalCostToday: 4.2831,
  avgLatencyMs: 1243,
}

export const DEMO_CHART = {
  days: [
    { date: d(-6), traces: 312, tokens: 48200, cost: 0.94, errors: 3 },
    { date: d(-5), traces: 489, tokens: 71800, cost: 1.42, errors: 5 },
    { date: d(-4), traces: 203, tokens: 31400, cost: 0.61, errors: 1 },
    { date: d(-3), traces: 671, tokens: 98700, cost: 1.91, errors: 8 },
    { date: d(-2), traces: 544, tokens: 82100, cost: 1.58, errors: 4 },
    { date: d(-1), traces: 892, tokens: 134600, cost: 2.61, errors: 9 },
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

function d(offsetDays: number) {
  const date = new Date(now + offsetDays * day)
  return date.toISOString().slice(0, 10)
}

export async function GET() {
  return NextResponse.json({
    stats: DEMO_STATS,
    chart: DEMO_CHART,
    traces: DEMO_TRACES,
  })
}
