'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

interface Span {
  id: string
  span_id: string
  parent_span_id: string | null
  name: string
  kind: string
  model: string | null
  provider: string | null
  duration_ms: number | null
  status: string
  error_message: string | null
  input_tokens: number | null
  output_tokens: number | null
  cost_usd: number | null
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  start_time: string
}

interface Trace {
  id: string
  name: string
  status: string
  duration_ms: number | null
  total_tokens: number
  total_cost_usd: number
}

interface TraceWaterfallProps {
  trace: Trace
  spans: Span[]
}

const KIND_COLORS: Record<string, string> = {
  llm: 'bg-[#4DE5FC]/10 text-[#4DE5FC] border-[#4DE5FC]/20',
  tool: 'bg-green-500/10 text-green-400 border-green-500/20',
  retrieval: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  chain: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  agent: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

function buildTree(spans: Span[]): Map<string | null, Span[]> {
  const tree = new Map<string | null, Span[]>()
  for (const span of spans) {
    const key = span.parent_span_id ?? null
    if (!tree.has(key)) tree.set(key, [])
    tree.get(key)!.push(span)
  }
  return tree
}

function SpanRow({
  span,
  depth,
  traceDuration,
  traceStart,
  tree,
}: {
  span: Span
  depth: number
  traceDuration: number
  traceStart: number
  tree: Map<string | null, Span[]>
}) {
  const [expanded, setExpanded] = useState(span.status === 'error')
  const children = tree.get(span.span_id) ?? []

  const spanStart = new Date(span.start_time).getTime()
  const offsetMs = spanStart - traceStart
  const leftPct = traceDuration > 0 ? (offsetMs / traceDuration) * 100 : 0
  const widthPct = traceDuration > 0 && span.duration_ms
    ? Math.max((span.duration_ms / traceDuration) * 100, 0.5)
    : 1

  const isSlowLlm = span.kind === 'llm' && span.duration_ms && span.duration_ms > 3000

  const isError = span.status === 'error'

  return (
    <>
      <tr
        className={`border-b border-white/[0.04] transition-colors cursor-pointer group ${isError ? 'bg-red-950/20 hover:bg-red-950/30 border-l-2 border-l-red-500/60' : 'hover:bg-white/[0.02]'}`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Name */}
        <td className="py-2.5 px-4">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            <span className="text-zinc-600 text-xs w-3">{children.length > 0 ? (expanded ? '▼' : '▶') : ' '}</span>
            <span className={`text-sm font-mono ${isError ? 'text-red-300' : 'text-zinc-200'}`}>{span.name}</span>
            {isError && <span className="text-red-400 text-xs font-medium">error</span>}
            {!isError && isSlowLlm && <span className="text-yellow-500 text-xs">⚠ slow</span>}
          </div>
        </td>

        {/* Kind */}
        <td className="py-2.5 px-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded border ${KIND_COLORS[span.kind] ?? KIND_COLORS.chain}`}>
            {span.kind}
          </span>
        </td>

        {/* Model */}
        <td className="py-2.5 px-3 text-zinc-500 text-xs font-mono">
          {span.model ?? '-'}
        </td>

        {/* Duration */}
        <td className="py-2.5 px-3 text-right text-zinc-400 text-xs tabular-nums">
          {span.duration_ms != null ? `${span.duration_ms}ms` : '-'}
        </td>

        {/* Tokens */}
        <td className="py-2.5 px-3 text-right text-zinc-500 text-xs tabular-nums">
          {span.input_tokens != null
            ? `${(span.input_tokens + (span.output_tokens ?? 0)).toLocaleString()}`
            : '-'}
        </td>

        {/* Cost */}
        <td className="py-2.5 px-3 text-right text-zinc-500 text-xs tabular-nums">
          {span.cost_usd != null ? `$${Number(span.cost_usd).toFixed(5)}` : '-'}
        </td>

        {/* Timeline bar */}
        <td className="py-2.5 px-4 w-48">
          <div className="relative h-4 bg-zinc-800 rounded overflow-hidden">
            <div
              className={`absolute top-0 h-full rounded ${span.status === 'error' ? 'bg-red-500/70' : span.kind === 'llm' ? 'bg-[#4DE5FC]/50' : span.kind === 'tool' ? 'bg-green-500/50' : 'bg-zinc-600/50'}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            />
          </div>
        </td>
      </tr>

      {/* Expanded input/output */}
      {expanded && (
        <tr className="border-b border-white/[0.04] bg-black/30">
          <td colSpan={7} className="px-8 py-4">
            <div className="grid grid-cols-2 gap-4">
              {span.input && (
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Input</p>
                  <pre className="bg-black rounded-lg p-3 text-xs text-zinc-300 overflow-auto max-h-48 border border-zinc-800">
                    {JSON.stringify(span.input, null, 2)}
                  </pre>
                </div>
              )}
              {span.output && (
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Output</p>
                  <pre className="bg-black rounded-lg p-3 text-xs text-zinc-300 overflow-auto max-h-48 border border-zinc-800">
                    {JSON.stringify(span.output, null, 2)}
                  </pre>
                </div>
              )}
              {span.error_message && (
                <div className="col-span-2 space-y-1">
                  <p className="text-red-500 text-xs font-medium uppercase tracking-wider">Error</p>
                  <pre className="bg-red-950/30 rounded-lg p-3 text-xs text-red-300 border border-red-900/50">
                    {span.error_message}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Children */}
      {expanded && children.map((child) => (
        <SpanRow
          key={child.id}
          span={child}
          depth={depth + 1}
          traceDuration={traceDuration}
          traceStart={traceStart}
          tree={tree}
        />
      ))}
    </>
  )
}

export function TraceWaterfall({ trace, spans }: TraceWaterfallProps) {
  const tree = buildTree(spans)
  const rootSpans = tree.get(null) ?? spans.filter((s) => !s.parent_span_id)
  const traceDuration = trace.duration_ms ?? 0
  const traceStart = spans.length > 0 ? new Date(spans[0].start_time).getTime() : 0

  const statusColor = trace.status === 'ok' ? 'text-green-400' : 'text-red-400'
  const firstError = spans.find(s => s.status === 'error')

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {firstError && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl px-5 py-3.5 flex items-start gap-3">
          <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
          <div>
            <p className="text-red-300 text-sm font-medium">Error in <span className="font-mono">{firstError.name}</span></p>
            {firstError.error_message && (
              <p className="text-red-400/70 text-xs mt-0.5 font-mono">{firstError.error_message}</p>
            )}
          </div>
        </div>
      )}

      {/* Trace header */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 flex flex-wrap gap-6">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Trace</p>
          <p className="text-white font-mono text-sm">{trace.name || 'Unnamed'}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Duration</p>
          <p className="text-white text-sm">{traceDuration ? `${traceDuration.toLocaleString()}ms` : '-'}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Tokens</p>
          <p className="text-white text-sm">{trace.total_tokens?.toLocaleString() ?? '-'}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Cost</p>
          <p className="text-white text-sm">${Number(trace.total_cost_usd).toFixed(5)}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</p>
          <p className={`text-sm font-medium ${statusColor}`}>{trace.status}</p>
        </div>
      </div>

      {/* Spans table */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2.5 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider">Span</th>
              <th className="text-left py-2.5 px-3 text-zinc-600 font-medium text-xs uppercase tracking-wider">Kind</th>
              <th className="text-left py-2.5 px-3 text-zinc-600 font-medium text-xs uppercase tracking-wider">Model</th>
              <th className="text-right py-2.5 px-3 text-zinc-600 font-medium text-xs uppercase tracking-wider">Duration</th>
              <th className="text-right py-2.5 px-3 text-zinc-600 font-medium text-xs uppercase tracking-wider">Tokens</th>
              <th className="text-right py-2.5 px-3 text-zinc-600 font-medium text-xs uppercase tracking-wider">Cost</th>
              <th className="text-left py-2.5 px-4 text-zinc-600 font-medium text-xs uppercase tracking-wider w-48">Timeline</th>
            </tr>
          </thead>
          <tbody>
            {rootSpans.map((span) => (
              <SpanRow
                key={span.id}
                span={span}
                depth={0}
                traceDuration={traceDuration}
                traceStart={traceStart}
                tree={tree}
              />
            ))}
          </tbody>
        </table>

        {spans.length === 0 && (
          <div className="py-12 text-center text-zinc-500 text-sm">No spans recorded for this trace</div>
        )}
      </div>
    </div>
  )
}
