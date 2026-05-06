export default function AlertsLoading() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-20 skeleton-shimmer rounded-lg" />
          <div className="h-3 w-40 skeleton-shimmer rounded mt-1.5" />
        </div>
        <div className="h-9 w-28 skeleton-shimmer rounded-lg" />
      </div>
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-6 py-4 flex items-center gap-4">
            <div className="w-10 h-5 skeleton-shimmer rounded-full" />
            <div>
              <div className="h-4 w-32 skeleton-shimmer rounded mb-1.5" />
              <div className="h-3 w-52 skeleton-shimmer rounded" />
            </div>
            <div className="ml-auto h-5 w-14 skeleton-shimmer rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
