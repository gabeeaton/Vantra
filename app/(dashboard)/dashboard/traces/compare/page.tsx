'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface VersionStats {
  version: string
  count: number
  error_rate: number
  avg_duration_ms: number | null
  avg_cost_usd: number
  total_cost_usd: number
}

export default function CompareVersionsPage() {
  const [versions, setVersions] = useState<VersionStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/traces/versions')
      .then(r => r.json())
      .then(d => { setVersions(d.versions ?? []); setLoading(false) })
  }, [])

  const toggle = (v: string) => {
    setSelected(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 2 ? [...prev, v] : [prev[1], v]
    )
  }

  const compared = selected.map(v => versions.find(x => x.version === v)).filter(Boolean) as VersionStats[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/traces" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Traces
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-2xl font-bold text-white">Compare versions</h1>
      </div>
      <p className="text-zinc-500 text-sm -mt-2">Select up to two versions to compare side by side.</p>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 skeleton-shimmer rounded-xl" />
          ))}
        </div>
      ) : versions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-white font-medium mb-1">No versioned traces yet</p>
          <p className="text-zinc-500 text-sm mb-4">Pass <code className="text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded text-xs font-mono">prompt_version</code> to your trace decorator to start tagging runs.</p>
          <pre className="inline-block text-left bg-black border border-white/10 rounded-xl px-5 py-4 text-xs text-zinc-300 font-mono">{`@vantra.trace(name="my-agent", prompt_version="v1")
def run_agent(message):
    ...`}</pre>
        </div>
      ) : (
        <>
          {/* Version table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-zinc-500 font-medium w-8" />
                  <th className="text-left py-3 px-4 text-zinc-500 font-medium">Version</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-medium">Traces</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-medium">Error rate</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-medium">Avg duration</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-medium">Avg cost</th>
                  <th className="text-right py-3 px-4 text-zinc-500 font-medium">Total cost</th>
                  <th className="py-3 px-4 w-8" />
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => {
                  const isSelected = selected.includes(v.version)
                  const selIdx = selected.indexOf(v.version)
                  return (
                    <tr
                      key={v.version}
                      onClick={() => toggle(v.version)}
                      className={`border-b border-white/[0.03] cursor-pointer transition-colors ${isSelected ? 'bg-violet-400/5' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="py-3 px-4">
                        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${isSelected ? 'bg-violet-500 border-violet-500' : 'border-zinc-700'}`}>
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected ? 'text-violet-300 bg-violet-400/20 ring-1 ring-violet-400/40' : 'text-violet-400 bg-violet-400/10'}`}>
                          {v.version}
                        </span>
                        {selIdx === 0 && <span className="ml-2 text-[10px] text-violet-400 font-medium">A</span>}
                        {selIdx === 1 && <span className="ml-2 text-[10px] text-blue-400 font-medium">B</span>}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">{v.count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-xs tabular-nums">
                        <span className={v.error_rate > 0.1 ? 'text-red-400' : 'text-zinc-400'}>
                          {(v.error_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">
                        {v.avg_duration_ms != null ? `${v.avg_duration_ms.toLocaleString()}ms` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">
                        {v.avg_cost_usd ? `$${v.avg_cost_usd.toFixed(5)}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400 text-xs tabular-nums">
                        {v.total_cost_usd ? `$${v.total_cost_usd.toFixed(4)}` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/traces?prompt_version=${encodeURIComponent(v.version)}`}
                          onClick={e => e.stopPropagation()}
                          className="text-zinc-600 hover:text-zinc-300 text-xs transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Side-by-side comparison */}
          {compared.length === 2 && (
            <ComparePanel a={compared[0]} b={compared[1]} />
          )}
          {compared.length === 1 && (
            <p className="text-zinc-600 text-sm text-center py-4">Select one more version to compare.</p>
          )}
          {compared.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-4">Select two versions above to compare them.</p>
          )}
        </>
      )}
    </div>
  )
}

function ComparePanel({ a, b }: { a: VersionStats; b: VersionStats }) {
  const rows: { label: string; aVal: string; bVal: string; winner?: 'a' | 'b' | 'tie' }[] = [
    {
      label: 'Traces',
      aVal: a.count.toLocaleString(),
      bVal: b.count.toLocaleString(),
    },
    {
      label: 'Error rate',
      aVal: `${(a.error_rate * 100).toFixed(1)}%`,
      bVal: `${(b.error_rate * 100).toFixed(1)}%`,
      winner: a.error_rate < b.error_rate ? 'a' : b.error_rate < a.error_rate ? 'b' : 'tie',
    },
    {
      label: 'Avg duration',
      aVal: a.avg_duration_ms != null ? `${a.avg_duration_ms.toLocaleString()}ms` : '-',
      bVal: b.avg_duration_ms != null ? `${b.avg_duration_ms.toLocaleString()}ms` : '-',
      winner: (a.avg_duration_ms != null && b.avg_duration_ms != null)
        ? a.avg_duration_ms < b.avg_duration_ms ? 'a' : b.avg_duration_ms < a.avg_duration_ms ? 'b' : 'tie'
        : undefined,
    },
    {
      label: 'Avg cost',
      aVal: a.avg_cost_usd ? `$${a.avg_cost_usd.toFixed(5)}` : '-',
      bVal: b.avg_cost_usd ? `$${b.avg_cost_usd.toFixed(5)}` : '-',
      winner: a.avg_cost_usd < b.avg_cost_usd ? 'a' : b.avg_cost_usd < a.avg_cost_usd ? 'b' : 'tie',
    },
    {
      label: 'Total cost',
      aVal: a.total_cost_usd ? `$${a.total_cost_usd.toFixed(4)}` : '-',
      bVal: b.total_cost_usd ? `$${b.total_cost_usd.toFixed(4)}` : '-',
    },
  ]

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-3 border-b border-zinc-800">
        <div className="py-3 px-4 text-zinc-500 text-xs font-medium" />
        <div className="py-3 px-4 border-l border-zinc-800">
          <span className="text-xs font-medium text-violet-400 mr-1.5">A</span>
          <span className="text-xs font-mono text-violet-300 bg-violet-400/10 px-1.5 py-0.5 rounded">{a.version}</span>
        </div>
        <div className="py-3 px-4 border-l border-zinc-800">
          <span className="text-xs font-medium text-blue-400 mr-1.5">B</span>
          <span className="text-xs font-mono text-blue-300 bg-blue-400/10 px-1.5 py-0.5 rounded">{b.version}</span>
        </div>
      </div>
      {rows.map(row => (
        <div key={row.label} className="grid grid-cols-3 border-b border-white/[0.03]">
          <div className="py-3 px-4 text-zinc-500 text-xs">{row.label}</div>
          <div className={`py-3 px-4 border-l border-zinc-800/50 text-xs tabular-nums flex items-center gap-1.5 ${row.winner === 'a' ? 'text-green-400' : 'text-zinc-400'}`}>
            {row.aVal}
            {row.winner === 'a' && <span className="text-[10px] text-green-500">✓</span>}
          </div>
          <div className={`py-3 px-4 border-l border-zinc-800/50 text-xs tabular-nums flex items-center gap-1.5 ${row.winner === 'b' ? 'text-green-400' : 'text-zinc-400'}`}>
            {row.bVal}
            {row.winner === 'b' && <span className="text-[10px] text-green-500">✓</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
