export default function TraceDetailLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-4 w-16 skeleton-shimmer rounded" />
        <div className="h-4 w-4 skeleton-shimmer rounded" />
        <div className="h-4 w-32 skeleton-shimmer rounded" />
      </div>

      {/* Trace header */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 flex flex-wrap gap-8">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-16 skeleton-shimmer rounded mb-2" />
            <div className="h-5 w-20 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Spans table */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="border-b border-white/5 px-4 py-2.5 flex gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-3 w-14 skeleton-shimmer rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-4 py-3 flex items-center gap-4" style={{ paddingLeft: `${16 + (i > 0 ? 20 : 0)}px` }}>
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
