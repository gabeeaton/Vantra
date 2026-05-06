'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <span className="text-red-400 text-xl">!</span>
      </div>
      <div>
        <p className="text-white font-semibold">Something went wrong</p>
        <p className="text-zinc-500 text-sm mt-1">An unexpected error occurred loading this page.</p>
      </div>
      <button
        onClick={reset}
        className="text-sm text-[#4DE5FC] hover:underline"
      >
        Try again
      </button>
    </div>
  )
}
