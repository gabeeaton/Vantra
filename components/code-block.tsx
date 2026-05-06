'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  html: string
  raw: string
  lang: string
}

export function CodeBlock({ html, raw, lang }: Props) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(raw.trim())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4DE5FC]/60" />
          <span className="text-zinc-500 text-xs font-mono">{lang}</span>
        </div>
        <button
          onClick={copy}
          className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
          aria-label="Copy code"
        >
          {copied ? <Check size={16} className="text-[#4DE5FC]" /> : <Copy size={16} />}
        </button>
      </div>
      <div
        className="p-5 text-sm overflow-x-auto [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!font-[family-name:var(--font-geist-mono)] [&_code]:!font-[family-name:var(--font-geist-mono)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
