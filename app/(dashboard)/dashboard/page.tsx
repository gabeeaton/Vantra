'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  tracesToday: number
  errorsLast24h: number
  totalCostToday: number
  avgLatencyMs: number
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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats/overview').then((r) => r.json()).then(setStats)
    fetch('/api/traces?limit=8')
      .then((r) => r.json())
      .then((d) => { setTraces(d.traces ?? []); setLoading(false) })
  }, [])

  const errorRate = stats && stats.tracesToday > 0
    ? ((stats.errorsLast24h / stats.tracesToday) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-8 animate-fade-up">
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard
          label="Traces today"
          value={stats?.tracesToday ?? null}
          format={(v) => v.toLocaleString()}
          accent="#4DE5FC"
        />
        <StatCard
          label="Error rate"
          value={stats ? parseFloat(errorRate) : null}
          format={(v) => `${v}%`}
          accent={parseFloat(errorRate) > 5 ? '#ef4444' : '#22c55e'}
          sub={stats ? `${stats.errorsLast24h} errors` : undefined}
        />
        <StatCard
          label="Avg latency"
          value={stats?.avgLatencyMs ?? null}
          format={(v) => `${v.toLocaleString()}ms`}
          accent="#a78bfa"
        />
        <StatCard
          label="Cost today"
          value={stats?.totalCostToday ?? null}
          format={(v) => `$${v.toFixed(4)}`}
          accent="#fb923c"
        />
      </div>

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

function StatCard({ label, value, format, accent, sub }: {
  label: string
  value: number | null
  format: (v: number) => string
  accent: string
  sub?: string
}) {
  return (
    <div className="animate-fade-up bg-[#0d0d0d] border border-white/5 rounded-xl p-5 glow-card">
      <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
      <p className="text-2xl font-bold text-white tabular-nums" style={{ color: value !== null ? undefined : '#3f3f46' }}>
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
        <p className="text-zinc-600 text-sm mt-1">Send your first trace to see data here</p>
      </div>
      <code className="inline-block text-xs text-[#4DE5FC] bg-[#4DE5FC]/5 border border-[#4DE5FC]/20 px-4 py-2 rounded-lg">
        pip install vantra
      </code>
    </div>
  )
}
