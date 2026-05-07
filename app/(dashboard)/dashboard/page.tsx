'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface Stats {
  tracesToday: number
  errorsLast24h: number
  totalCostToday: number
  avgLatencyMs: number
  p95LatencyMs: number
  p99LatencyMs: number
  rateLimitCount: number
}

interface Trace {
  id: string
  name: string
  status: string
  duration_ms: number
  total_tokens: number
  total_cost_usd: number
  created_at: string
  projects: { name: string } | null
}

interface DayBucket {
  date: string
  traces: number
  tokens: number
  cost: number
  errors: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])
  const [chart, setChart] = useState<DayBucket[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  useEffect(() => {
    if (isDemo) {
      fetch('/api/demo').then((r) => r.json()).then((d) => {
        setStats(d.stats)
        setChart(d.chart.days ?? [])
        setTraces(d.traces ?? [])
        setLoading(false)
      })
      return
    }
    fetch('/api/stats/overview').then((r) => r.json()).then(setStats)
    fetch(`/api/stats/chart?tz_offset=${new Date().getTimezoneOffset()}`).then((r) => r.json()).then((d) => setChart(d.days ?? []))
    fetch('/api/traces?limit=8')
      .then((r) => r.json())
      .then((d) => { setTraces(d.traces ?? []); setLoading(false) })
  }, [isDemo])

  const errorRate = stats && stats.tracesToday > 0
    ? ((stats.errorsLast24h / stats.tracesToday) * 100).toFixed(1)
    : '0'

  // Cost forecast: 7-day average daily cost × 30
  const totalCost7d = chart.reduce((sum, d) => sum + d.cost, 0)
  const projectedMonthly = chart.length > 0 ? (totalCost7d / chart.length) * 30 : null

  const hasData = !loading && traces.length > 0
  const [showFirstTrace, setShowFirstTrace] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll every 5s when no traces yet — stops as soon as first trace arrives
  useEffect(() => {
    if (hasData || isDemo || loading) return
    pollingRef.current = setInterval(() => {
      fetch('/api/traces?limit=8')
        .then(r => r.json())
        .then(d => {
          const t = d.traces ?? []
          if (t.length > 0) {
            setTraces(t)
            if (!localStorage.getItem('vantra_first_trace_seen')) {
              setShowFirstTrace(true)
              localStorage.setItem('vantra_first_trace_seen', '1')
            }
            if (pollingRef.current) clearInterval(pollingRef.current)
          }
        })
    }, 5000)
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [hasData, isDemo, loading])

  return (
    <div className="space-y-8 animate-fade-up">

      {showFirstTrace && <FirstTraceBanner onDismiss={() => setShowFirstTrace(false)} />}
      {!loading && !hasData && !isDemo && <GettingStarted />}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-600 text-sm mt-0.5">Last 24 hours</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#4DE5FC] rounded-full animate-pulse" />
          <span className="text-zinc-500 text-xs">Live</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Traces (24h)" value={stats?.tracesToday ?? null} format={(v) => v.toLocaleString()} accent="#4DE5FC" delay={0} />
        <StatCard
          label="Error rate"
          value={stats ? parseFloat(errorRate) : null}
          format={(v) => `${v}%`}
          accent={parseFloat(errorRate) > 5 ? '#ef4444' : '#22c55e'}
          sub={stats ? `${stats.errorsLast24h} errors${stats.rateLimitCount > 0 ? ` · ${stats.rateLimitCount} rate limited` : ''}` : undefined}
          delay={60}
        />
        <StatCard
          label="p95 latency"
          value={stats?.p95LatencyMs ?? null}
          format={(v) => `${v.toLocaleString()}ms`}
          accent="#a78bfa"
          sub={stats?.avgLatencyMs != null ? `avg ${stats.avgLatencyMs.toLocaleString()}ms` : undefined}
          delay={120}
        />
        <StatCard
          label="Cost (24h)"
          value={stats?.totalCostToday ?? null}
          format={(v) => `$${v.toFixed(4)}`}
          accent="#fb923c"
          sub={projectedMonthly != null ? `~$${projectedMonthly.toFixed(2)}/mo projected` : undefined}
          delay={180}
        />
      </div>

      {/* 7-day chart */}
      {chart.length > 0 && chart.some(d => d.traces > 0) && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Traces — last 7 days</p>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={chart} barCategoryGap="30%">
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                tick={{ fill: '#52525b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => new Date(v + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                formatter={(v, name) => [v, name === 'traces' ? 'Traces' : String(name)]}
              />
              <Bar dataKey="traces" fill="#4DE5FC" opacity={0.7} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent traces */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent traces</h2>
          <Link href="/dashboard/traces" className="text-xs text-zinc-500 hover:text-[#4DE5FC] transition-colors">
            View all →
          </Link>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
          {loading ? (
            <TraceRowSkeleton />
          ) : traces.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-3 px-5 text-zinc-600 font-medium text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left py-3 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Project</th>
                    <th className="text-left py-3 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-3 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Duration</th>
                    <th className="text-right py-3 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Tokens</th>
                    <th className="text-right py-3 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Cost</th>
                    <th className="text-right py-3 px-5 text-zinc-600 font-medium text-xs uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {traces.map((trace) => (
                    <tr
                      key={trace.id}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors clickable"
                    >
                      <td className="py-3 px-5">
                        <Link href={`/dashboard/traces/${trace.id}`} className="text-white hover:text-[#4DE5FC] transition-colors font-medium text-sm">
                          {trace.name || 'Unnamed trace'}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-zinc-600 text-xs">{trace.projects?.name ?? '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={trace.status} />
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">
                        {trace.duration_ms ? `${trace.duration_ms.toLocaleString()}ms` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500 text-xs tabular-nums">
                        {trace.total_tokens ? trace.total_tokens.toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500 text-xs tabular-nums">
                        {trace.total_cost_usd ? `$${Number(trace.total_cost_usd).toFixed(5)}` : '—'}
                      </td>
                      <td className="py-3 px-5 text-right text-zinc-600 text-xs">
                        {new Date(trace.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, format, accent, sub, delay = 0 }: {
  label: string
  value: number | null
  format: (v: number) => string
  accent: string
  sub?: string
  delay?: number
}) {
  return (
    <div
      className="animate-fade-up card-hover bg-[#0d0d0d] border border-white/5 rounded-xl p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
      <p className="text-2xl font-bold tabular-nums" style={{ color: value !== null ? 'white' : '#3f3f46' }}>
        {value !== null ? format(value) : '—'}
      </p>
      {sub && <p className="text-zinc-600 text-xs mt-1">{sub}</p>}
      <div className="mt-3 h-0.5 w-8 rounded-full" style={{ backgroundColor: accent, opacity: 0.6 }} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ok: 'text-green-400 bg-green-400/10 border-green-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
    timeout: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'}`}>
      {status}
    </span>
  )
}

function TraceRowSkeleton() {
  return (
    <div className="divide-y divide-white/[0.03]">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-5 py-3.5" style={{ animationDelay: `${i * 40}ms` }}>
          <div className="h-4 w-36 skeleton-shimmer rounded" />
          <div className="h-3 w-20 skeleton-shimmer rounded" />
          <div className="h-5 w-10 skeleton-shimmer rounded-full" />
          <div className="h-3 w-14 skeleton-shimmer rounded ml-auto" />
          <div className="h-3 w-10 skeleton-shimmer rounded" />
          <div className="h-3 w-16 skeleton-shimmer rounded" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-20 text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center mx-auto">
        <span className="text-[#4DE5FC] text-xl">◎</span>
      </div>
      <div>
        <p className="text-white font-medium">No traces yet</p>
        <p className="text-zinc-600 text-sm mt-1">Follow the steps above to send your first trace</p>
      </div>
    </div>
  )
}

function FirstTraceBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="bg-green-400/10 border border-green-400/20 rounded-xl px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-green-400 text-base">✓</span>
        <div>
          <p className="text-green-400 font-semibold text-sm">You're live.</p>
          <p className="text-zinc-400 text-xs mt-0.5">First trace received. Click any row to see the full waterfall.</p>
        </div>
      </div>
      <button onClick={onDismiss} className="text-zinc-600 hover:text-zinc-400 text-lg leading-none">×</button>
    </div>
  )
}

function GettingStarted() {
  const [lang, setLang] = useState<'python' | 'typescript'>('python')

  const installCode = lang === 'python' ? 'pip install vantra' : 'npm install vantra-sdk'
  const initCode = lang === 'python'
    ? `import vantra\nvantra.init(api_key="van_live_...", project="my-agent")\n\n@vantra.trace\ndef run_agent(...):\n    ...  # your existing code`
    : `import { init, trace } from 'vantra-sdk'\n\ninit({ apiKey: 'van_live_...', project: 'my-agent' })\n\nconst runAgent = trace(async function runAgent() {\n  // your existing code\n})`

  const steps = [
    {
      n: '1',
      title: 'Install the SDK',
      code: installCode,
    },
    {
      n: '2',
      title: 'Use your API key',
      body: 'You received it after setup. Find it again in Settings any time.',
      link: { href: '/dashboard/settings', label: 'Settings → API Keys' },
    },
    {
      n: '3',
      title: 'Add to your agent',
      code: initCode,
    },
    {
      n: '4',
      title: 'Run your agent',
      body: 'Traces appear here automatically. OpenAI and Anthropic calls are captured with no extra code.',
    },
  ]

  return (
    <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-sm">Get started in 2 minutes</h2>
          <p className="text-zinc-600 text-xs mt-0.5">Follow these steps to send your first trace</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setLang('python')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${lang === 'python' ? 'bg-[#4DE5FC]/10 text-[#4DE5FC]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Python
          </button>
          <button
            onClick={() => setLang('typescript')}
            className={`text-xs px-3 py-1 rounded-md transition-colors ${lang === 'typescript' ? 'bg-[#4DE5FC]/10 text-[#4DE5FC]' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            TypeScript
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step) => (
          <div key={step.n} className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#4DE5FC] text-[10px] font-bold">{step.n}</span>
            </div>
            <div className="space-y-1.5">
              <p className="text-white text-xs font-medium">{step.title}</p>
              {step.body && <p className="text-zinc-500 text-xs">{step.body}</p>}
              {step.link && (
                <a href={step.link.href} className="text-[#4DE5FC] text-xs hover:underline">{step.link.label}</a>
              )}
              {step.code && (
                <pre className="text-[11px] text-[#4DE5FC] bg-[#4DE5FC]/5 border border-[#4DE5FC]/10 rounded-lg px-3 py-2 font-mono overflow-x-auto">{step.code}</pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
