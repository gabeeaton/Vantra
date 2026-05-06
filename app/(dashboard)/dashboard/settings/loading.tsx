export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <div className="h-7 w-24 skeleton-shimmer rounded-lg" />
        <div className="h-3 w-48 skeleton-shimmer rounded mt-1.5" />
      </div>
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <div className="h-4 w-20 skeleton-shimmer rounded mb-1" />
          <div className="h-3 w-40 skeleton-shimmer rounded" />
        </div>
        <div className="px-6 py-4 border-b border-white/5 flex gap-3">
          <div className="flex-1 h-9 skeleton-shimmer rounded-lg" />
          <div className="h-9 w-28 skeleton-shimmer rounded-lg" />
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="h-4 w-28 skeleton-shimmer rounded mb-1.5" />
              <div className="h-3 w-44 skeleton-shimmer rounded" />
            </div>
            <div className="h-3 w-12 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <div className="h-4 w-12 skeleton-shimmer rounded mb-1" />
          <div className="h-3 w-36 skeleton-shimmer rounded" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border-b border-white/[0.04] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="h-4 w-16 skeleton-shimmer rounded mb-1.5" />
              <div className="h-3 w-56 skeleton-shimmer rounded" />
            </div>
            <div className="h-8 w-24 skeleton-shimmer rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
