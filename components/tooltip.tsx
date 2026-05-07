'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Tooltip({ content }: { content: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const show = () => {
    if (ref.current) setRect(ref.current.getBoundingClientRect())
    setVisible(true)
  }

  const tooltip = visible && rect && createPortal(
    <div
      style={{
        position: 'fixed',
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
        transform: 'translate(-50%, -100%)',
        zIndex: 9999,
      }}
      className="w-56 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 leading-relaxed pointer-events-none font-[family-name:var(--font-inter)]"
    >
      {content}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
    </div>,
    document.body
  )

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex align-middle ml-1 w-3.5 h-3.5 rounded-full bg-zinc-800 text-zinc-500 text-[9px] font-bold items-center justify-center cursor-default hover:bg-zinc-700 hover:text-zinc-300 transition-colors select-none"
      >
        ?
      </span>
      {mounted && tooltip}
    </>
  )
}
