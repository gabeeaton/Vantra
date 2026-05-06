export default function TracesLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="h-7 w-20 skeleton-shimmer rounded-lg" />
        <div className="h-3 w-16 skeleton-shimmer rounded mt-1.5" />
      </div>
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="border-b border-white/5 px-5 py-3 flex gap-8">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-3 w-14 skeleton-shimmer rounded" />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.03] px-5 py-3.5 flex gap-6 items-center">
            <div className="h-4 w-40 skeleton-shimmer rounded" />
            <div className="h-3 w-20 skeleton-shimmer rounded" />
            <div className="h-5 w-10 skeleton-shimmer rounded-full" />
            <div className="h-3 w-14 skeleton-shimmer rounded ml-auto" />
            <div className="h-3 w-12 skeleton-shimmer rounded" />
            <div className="h-3 w-16 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
