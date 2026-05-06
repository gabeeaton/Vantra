'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'

interface InviteInfo {
  orgName: string
  invitedBy: string
  email: string
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setInvalid(true) } else { setInvite(d) }
        setLoading(false)
      })
  }, [token])

  async function accept() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback?invite=${token}`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-[family-name:var(--font-inter)]">
      <div className="w-full max-w-sm space-y-8 px-6">
        <Link href="/" className="flex items-center gap-2.5 justify-center">
          <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
          <span className="font-black text-white text-lg tracking-tight">Vantra</span>
        </Link>

        {loading && (
          <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-8 space-y-4">
            <div className="h-5 w-48 skeleton-shimmer rounded mx-auto" />
            <div className="h-4 w-64 skeleton-shimmer rounded mx-auto" />
            <div className="h-11 skeleton-shimmer rounded-xl mt-6" />
          </div>
        )}

        {!loading && invalid && (
          <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-8 text-center space-y-3">
            <p className="text-white font-semibold">Invite invalid or expired</p>
            <p className="text-zinc-500 text-sm">This invite link is no longer valid. Ask your teammate to send a new one.</p>
            <Link href="/" className="text-[#4DE5FC] text-sm hover:underline block mt-4">
              Go to Vantra →
            </Link>
          </div>
        )}

        {!loading && invite && (
          <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-8 text-center space-y-4">
            <div>
              <p className="text-white font-bold text-lg">{invite.orgName}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {invite.invitedBy} invited you to join their team on Vantra
              </p>
            </div>

            <button
              onClick={accept}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-zinc-200 active:bg-zinc-300 transition-colors text-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Accept & sign in with GitHub
            </button>

            <p className="text-zinc-700 text-xs">
              You'll join {invite.orgName}'s workspace on Vantra.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
