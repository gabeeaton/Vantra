export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <div className="h-7 w-32 skeleton-shimmer rounded-lg" />
        <div className="h-4 w-20 skeleton-shimmer rounded mt-1.5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-fade-up bg-[#0d0d0d] border border-white/5 rounded-xl p-5">
            <div className="h-3 w-20 skeleton-shimmer rounded mb-4" />
            <div className="h-7 w-16 skeleton-shimmer rounded" />
            <div className="mt-3 h-0.5 w-8 bg-zinc-800 rounded-full" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-5 w-28 skeleton-shimmer rounded" />
        <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
          <div className="border-b border-white/5 px-5 py-3 flex gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 w-16 skeleton-shimmer rounded" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-white/[0.03] px-5 py-3.5 flex gap-8 items-center">
              <div className="h-4 w-36 skeleton-shimmer rounded" />
              <div className="h-3 w-20 skeleton-shimmer rounded" />
              <div className="h-5 w-12 skeleton-shimmer rounded-full" />
              <div className="h-3 w-16 skeleton-shimmer rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
