'use client'

import { TraceWaterfall } from '@/components/trace-waterfall'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { use } from 'react'
import { useSearchParams } from 'next/navigation'

interface Trace {
  id: string
  name: string
  status: string
  duration_ms: number | null
  total_tokens: number
  total_cost_usd: number
}

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
  metadata?: Record<string, unknown> | null
}

export default function TracePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [trace, setTrace] = useState<Trace | null>(null)
  const [spans, setSpans] = useState<Span[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  useEffect(() => {
    if (isDemo) {
      fetch('/api/demo').then(r => r.json()).then(data => {
        setTrace(data.traceDetail.trace)
        setSpans(data.traceDetail.spans ?? [])
        setLoading(false)
      })
      return
    }
    fetch(`/api/traces/${id}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then(data => {
        if (!data) return
        setTrace(data.trace)
        setSpans(data.spans ?? [])
        setLoading(false)
      })
  }, [id, isDemo])

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/traces${isDemo ? '?demo=true' : ''}`} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
          ← Traces
        </Link>
        <span className="text-zinc-700">/</span>
        <span className="text-zinc-500 text-sm font-mono">
          {loading ? <span className="h-4 w-32 skeleton-shimmer rounded inline-block" /> : (trace?.name || id)}
        </span>
      </div>

      {notFound && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-zinc-500">Trace not found</p>
        </div>
      )}

      {loading && !notFound && <TraceDetailSkeleton />}

      {!loading && !notFound && trace && (
        <TraceWaterfall trace={trace} spans={spans} />
      )}
    </div>
  )
}

function TraceDetailSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 flex flex-wrap gap-8">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 skeleton-shimmer rounded mb-2" />
            <div className="h-5 w-20 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="border-b border-white/5 px-4 py-2.5 flex gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-3 w-14 skeleton-shimmer rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-4"
            style={{ paddingLeft: `${16 + (i > 0 ? 20 : 0)}px` }}>
            <div className="h-4 w-40 skeleton-shimmer rounded" />
            <div className="h-5 w-10 skeleton-shimmer rounded-full" />
            <div className="h-3 w-20 skeleton-shimmer rounded" />
            <div className="h-3 w-12 skeleton-shimmer rounded ml-auto" />
            <div className="h-3 w-8 skeleton-shimmer rounded" />
            <div className="h-3 w-12 skeleton-shimmer rounded" />
            <div className="flex-1 h-3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
