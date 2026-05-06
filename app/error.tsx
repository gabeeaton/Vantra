'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
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
    <html>
      <body className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-white font-semibold">Something went wrong</p>
          <p className="text-zinc-500 text-sm">An unexpected error occurred.</p>
          <div className="flex gap-4 justify-center">
            <button onClick={reset} className="text-sm text-[#4DE5FC] hover:underline">
              Try again
            </button>
            <Link href="/" className="text-sm text-zinc-500 hover:text-white">
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
