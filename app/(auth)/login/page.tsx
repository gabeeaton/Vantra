'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { GitBranch, DollarSign, Bell } from 'lucide-react'

export default function LoginPage() {
  async function signInWithGitHub() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-black flex font-[family-name:var(--font-inter)]">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#080808] border-r border-white/5 flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
          <span className="font-black text-white text-lg tracking-tight">Vantra</span>
        </Link>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Full visibility into<br />
              <span className="text-[#4DE5FC]">every agent run.</span>
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              See every LLM call, tool invocation, and cost — in real time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { Icon: GitBranch, text: 'Waterfall traces for every agent run' },
              { Icon: DollarSign, text: 'Per-call cost tracking across all models' },
              { Icon: Bell, text: 'Anomaly alerts before users complain' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center flex-shrink-0">
                  <item.Icon size={13} className="text-[#4DE5FC]" strokeWidth={1.75} />
                </div>
                <span className="text-zinc-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-700 text-sm">© 2025 Vantra</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
            <span className="font-black text-white text-lg tracking-tight">Vantra</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to Vantra</h1>
            <p className="text-zinc-500 text-sm">Connect your GitHub account to continue</p>
          </div>

          <button
            onClick={signInWithGitHub}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-zinc-200 active:bg-zinc-300 transition-colors duration-150 cursor-pointer text-sm"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <p className="text-center text-zinc-700 text-xs">
            By continuing you agree to our Terms of Service.
            <br />No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}
