'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { GitBranch, DollarSign, Bell, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState<'github' | 'google' | null>(null)

  async function signIn(provider: 'github' | 'google') {
    setLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
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
              See every LLM call, tool invocation, and cost in real time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { Icon: GitBranch, text: 'Waterfall traces for every agent run' },
              { Icon: DollarSign, text: 'Per-call cost tracking across all models' },
              { Icon: Bell, text: 'Anomaly alerts before users complain' },
            ].map((item, i) => (
              <div key={item.text} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-7 h-7 rounded-md bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center flex-shrink-0">
                  <item.Icon size={13} className="text-[#4DE5FC]" strokeWidth={1.75} />
                </div>
                <span className="text-zinc-400 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-zinc-700 text-sm">© 2026 Vantra</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6 animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
            <span className="font-black text-white text-lg tracking-tight">Vantra</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Sign in to Vantra</h1>
            <p className="text-zinc-500 text-sm">Start monitoring your AI agents in minutes</p>
          </div>

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => signIn('google')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3.5 px-6 rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'google' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            </button>

            {/* GitHub */}
            <button
              onClick={() => signIn('github')}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-3 bg-[#0d0d0d] text-white font-semibold py-3.5 px-6 rounded-xl border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-150 cursor-pointer text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading === 'github' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              {loading === 'github' ? 'Signing in...' : 'Continue with GitHub'}
            </button>
          </div>

          <p className="text-center text-zinc-700 text-xs">
            By continuing you agree to our Terms of Service.
            <br />No credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}
