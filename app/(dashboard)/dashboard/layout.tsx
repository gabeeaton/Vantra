'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard', icon: '▦', label: 'Overview', exact: true },
  { href: '/dashboard/traces', icon: '◎', label: 'Traces', exact: false },
  { href: '/dashboard/alerts', icon: '◈', label: 'Alerts', exact: false },
  { href: '/dashboard/settings', icon: '◉', label: 'Settings', exact: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [email, setEmail] = useState('')

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email)
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] flex font-[family-name:var(--font-inter)]">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 border-r border-white/5 flex-shrink-0 flex-col bg-[#0a0a0a]">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.jpeg"
              alt="Vantra"
              width={28}
              height={28}
              className="rounded-md transition-transform group-hover:scale-105"
            />
            <span className="font-black text-white text-base tracking-tight">Vantra</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 space-y-0.5 pt-3">
          {NAV.map(({ href, icon, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group active:scale-[0.98] ${
                  active
                    ? 'bg-white/[0.07] text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className={`text-xs transition-colors ${active ? 'text-[#4DE5FC]' : 'group-hover:text-[#4DE5FC]'}`}>
                  {icon}
                </span>
                {label}
                {active && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-[#4DE5FC]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer active:scale-[0.98]">
            <div className="w-6 h-6 rounded-full bg-[#4DE5FC]/20 border border-[#4DE5FC]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#4DE5FC] text-xs font-bold">
                {email?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <p className="text-zinc-500 text-xs truncate">{email}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 flex items-center justify-around px-2 py-2 z-50">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-colors ${
                active ? 'text-white' : 'text-zinc-600'
              }`}
            >
              <span className={`text-sm ${active ? 'text-[#4DE5FC]' : ''}`}>{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
