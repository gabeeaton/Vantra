'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Menu, Loader2 } from 'lucide-react'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function navigate(href: string) {
    if (href.startsWith('#')) return // hash links are instant, no state needed
    setPending(href)
    startTransition(() => {
      router.push(href)
    })
  }

  const navLink = (href: string, label: string, extraClass = '') => {
    const isLoading = pending === href && isPending
    return (
      <button
        onClick={() => navigate(href)}
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
          {navLink('/docs', 'Docs')}
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          {navLink('/login', 'Sign in')}
          <button
            onClick={() => navigate('/login')}
            className="text-sm bg-[#4DE5FC] text-black font-semibold px-4 py-2 rounded-lg hover:bg-[#3dd4ea] active:scale-[0.97] transition-all flex items-center gap-1.5"
          >
            {pending === '/login' && isPending && <Loader2 size={12} className="animate-spin" />}
            Get started free
          </button>
        </div>

        {/* Mobile: CTA + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-xs bg-[#4DE5FC] text-black font-semibold px-3 py-2 rounded-lg hover:bg-[#3dd4ea] transition-colors flex items-center gap-1.5"
          >
            {pending === '/login' && isPending && <Loader2 size={12} className="animate-spin" />}
            Get started
          </button>
          <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white transition-colors p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex flex-col gap-4">
          {navLink('/docs', 'Docs')}
          <Link href="#pricing" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors py-1">Pricing</Link>
          {navLink('/login', 'Sign in')}
        </div>
      )}
    </nav>
  )
}
