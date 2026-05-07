'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Menu, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setLoggedIn(true)
    })
  }, [])

  function navigate(href: string, key: string) {
    setPending(key)
    startTransition(() => {
      router.push(href)
    })
  }

  const navLink = (href: string, label: string, key: string, extraClass = '') => {
    const isLoading = pending === key && isPending
    return (
      <button
        onClick={() => navigate(href, key)}
        className={`text-sm transition-colors flex items-center gap-1.5 ${isLoading ? 'text-white' : 'text-zinc-400 hover:text-white'} ${extraClass}`}
      >
        {isLoading && <Loader2 size={12} className="animate-spin" />}
        {label}
      </button>
    )
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 px-6 py-4 bg-black/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
          <span className="font-black text-white text-lg tracking-tight">Vantra</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/docs', 'Docs', 'docs')}
          <Link href="/#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          <a href="https://github.com/gabeeaton/vantra-sdk" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors">GitHub</a>
          {loggedIn ? (
            <button
              onClick={() => navigate('/dashboard', 'dashboard')}
              className="text-sm bg-[#4DE5FC] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#3dd4ea] active:scale-[0.97] transition-all flex items-center gap-1.5"
            >
              {pending === 'dashboard' && isPending && <Loader2 size={12} className="animate-spin" />}
              Dashboard
            </button>
          ) : (
            <>
              {navLink('/login', 'Sign in', 'signin')}
              <button
                onClick={() => navigate('/login', 'getstarted')}
                className="text-sm bg-[#4DE5FC] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#3dd4ea] active:scale-[0.97] transition-all flex items-center gap-1.5"
              >
                {pending === 'getstarted' && isPending && <Loader2 size={12} className="animate-spin" />}
                Get started free
              </button>
            </>
          )}
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => navigate(loggedIn ? '/dashboard' : '/login', 'mobile-cta')}
            className="text-xs bg-[#4DE5FC] text-black font-semibold px-3 py-2 rounded-lg hover:bg-[#3dd4ea] transition-colors flex items-center gap-1.5"
          >
            {pending === 'mobile-cta' && isPending && <Loader2 size={12} className="animate-spin" />}
            {loggedIn ? 'Dashboard' : 'Get started'}
          </button>
          <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white transition-colors p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
          {navLink('/docs', 'Docs', 'docs-mobile')}
          <Link href="/#pricing" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-1">Pricing</Link>
          <a href="https://github.com/gabeeaton/vantra-sdk" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors py-1">GitHub</a>
          {loggedIn
            ? navLink('/dashboard', 'Dashboard', 'dashboard-mobile')
            : navLink('/login', 'Sign in', 'signin-mobile')
          }
        </div>
      )}
    </nav>
  )
}
