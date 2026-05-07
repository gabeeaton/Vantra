'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tooltip } from '@/components/tooltip'

interface Trace {
  id: string
  name: string
  status: string
  duration_ms: number | null
  total_cost_usd: number
  total_tokens: number
  created_at: string
  metadata: Record<string, string> | null
  projects: { name: string } | null
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: 'text-green-400 bg-green-400/10',
    error: 'text-red-400 bg-red-400/10',
    timeout: 'text-yellow-400 bg-yellow-400/10',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? 'text-zinc-400 bg-zinc-800'}`}>
      {status}
    </span>
  )
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const dateRangeInvalid = !!(dateFrom && dateTo && dateTo < dateFrom)
  const [promptVersion, setPromptVersion] = useState('')
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  // Pick up ?prompt_version= from URL (e.g. deep-linked from compare page)
  useEffect(() => {
    const v = searchParams.get('prompt_version')
    if (v) setPromptVersion(v)
  }, [])
  const limit = 50
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search)
      setOffset(0)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  useEffect(() => {
    if (isDemo) {
      fetch('/api/demo').then(r => r.json()).then(d => {
        setTraces(d.traces ?? [])
        setTotal(d.traces?.length ?? 0)
        setLoading(false)
      })
      return
    }
    if (dateRangeInvalid) return
    setLoading(true)
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
    if (statusFilter) params.set('status', statusFilter)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (dateFrom) params.set('date_from', new Date(dateFrom + 'T00:00:00').toISOString())
    if (dateTo) params.set('date_to', new Date(dateTo + 'T23:59:59.999').toISOString())
    if (promptVersion) params.set('prompt_version', promptVersion)
    fetch(`/api/traces?${params}`).then((r) => r.json()).then((d) => {
      setTraces(d.traces ?? [])
      setTotal(d.total ?? 0)
      setLoading(false)
    })
  }, [offset, statusFilter, debouncedSearch, dateFrom, dateTo, promptVersion, isDemo])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Traces</h1>
          <p className="text-zinc-500 text-sm mt-1">{total.toLocaleString()} total</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/traces/compare"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Compare versions
          </Link>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex gap-2">
            {['', 'ok', 'error'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setOffset(0) }}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${statusFilter === s ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {s === '' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by trace name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          maxLength={200}
          className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setOffset(0) }}
              className={`bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors [color-scheme:dark] ${dateRangeInvalid ? 'border-red-500/50' : 'border-zinc-800 focus:border-zinc-600'}`}
            />
            <span className="text-zinc-600 text-sm">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setOffset(0) }}
              className={`bg-zinc-900 border rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none transition-colors [color-scheme:dark] ${dateRangeInvalid ? 'border-red-500/50' : 'border-zinc-800 focus:border-zinc-600'}`}
            />
            {(search || dateFrom || dateTo || promptVersion) && (
              <button
                onClick={() => { setSearch(''); setDateFrom(''); setDateTo(''); setPromptVersion(''); setOffset(0) }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2"
              >
                Clear
              </button>
            )}
          </div>
          {dateRangeInvalid && (
            <p className="text-red-400 text-xs pl-1">"From" date must be before "to" date</p>
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Project</th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">
                Version
                <Tooltip content="Prompt version tag set in your SDK with prompt_version='v1'. Click a badge to filter by that version, or use Compare versions to diff two versions side by side." />
              </th>
              <th className="text-left py-3 px-4 text-zinc-500 font-medium">Status</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Duration</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Tokens</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Cost</th>
              <th className="text-right py-3 px-4 text-zinc-500 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {traces.map((trace) => (
              <tr
                key={trace.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors clickable"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5">
                    {trace.metadata?.rating === 'up' && <span className="text-green-400 text-xs leading-none">↑</span>}
                    {trace.metadata?.rating === 'down' && <span className="text-red-400 text-xs leading-none">↓</span>}
                    <Link
                      href={`/dashboard/traces/${trace.id}${isDemo ? '?demo=true' : ''}`}
                      className="text-white hover:text-zinc-300 font-mono text-xs"
                    >
                      {trace.name || 'Unnamed trace'}
                    </Link>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-500 text-xs">{trace.projects?.name ?? '-'}</td>
                <td className="py-3 px-4">
                  {trace.metadata?.prompt_version ? (
                    <button
                      onClick={() => { setPromptVersion(p => p === trace.metadata!.prompt_version ? '' : trace.metadata!.prompt_version); setOffset(0) }}
                      className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${promptVersion === trace.metadata.prompt_version ? 'text-violet-300 bg-violet-400/20 ring-1 ring-violet-400/40' : 'text-violet-400 bg-violet-400/10 hover:bg-violet-400/20'}`}
                    >
                      {trace.metadata.prompt_version}
                    </button>
                  ) : (
                    <span className="text-zinc-700 text-xs">—</span>
                  )}
                </td>
                <td className="py-3 px-4"><StatusBadge status={trace.status} /></td>
                <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">
                  {trace.duration_ms != null ? `${trace.duration_ms.toLocaleString()}ms` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-zinc-500 text-xs tabular-nums">
                  {trace.total_tokens?.toLocaleString() ?? '-'}
                </td>
                <td className="py-3 px-4 text-right text-zinc-500 text-xs tabular-nums">
                  {trace.total_cost_usd ? `$${Number(trace.total_cost_usd).toFixed(5)}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-zinc-500 text-xs">
                  {new Date(trace.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="divide-y divide-white/[0.03]">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-5 py-3.5">
                <div className="h-4 w-40 skeleton-shimmer rounded" />
                <div className="h-3 w-20 skeleton-shimmer rounded" />
                <div className="h-5 w-10 skeleton-shimmer rounded-full" />
                <div className="h-3 w-16 skeleton-shimmer rounded ml-auto" />
                <div className="h-3 w-10 skeleton-shimmer rounded" />
                <div className="h-3 w-14 skeleton-shimmer rounded" />
                <div className="h-3 w-20 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : traces.length === 0 ? (
          <div className="py-14 px-8 flex flex-col items-center gap-6 text-center">
            <div>
              <p className="text-white font-medium mb-1">No traces yet</p>
              <p className="text-zinc-500 text-sm">Instrument your agent with 3 lines of Python</p>
            </div>
            <div className="w-full max-w-lg text-left bg-black border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#4DE5FC]/60" />
                <span className="text-zinc-500 text-xs font-mono">python</span>
              </div>
              <pre className="p-5 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">{`import vantra

vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message):
    return agent.run(message)  # your existing code`}</pre>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="/dashboard/settings" className="text-[#4DE5FC] hover:underline">Get your API key →</a>
              <a href="/docs" className="text-zinc-500 hover:text-zinc-300">Read the docs</a>
            </div>
          </div>
        ) : null}

        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <span className="text-zinc-500 text-xs">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={offset + limit >= total}
                onClick={() => setOffset(offset + limit)}
                className="px-3 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
