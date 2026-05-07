'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'Is pricing per seat?',
    a: 'No. All plans are per organization, not per user. Add your whole team without paying more.',
  },
  {
    q: 'Does Vantra add latency to my agent?',
    a: 'No. All trace data is sent in a background thread with a queue. Your agent function returns immediately. Vantra never blocks the main thread.',
  },
  {
    q: 'Does it work with streaming?',
    a: 'Yes. OpenAI and Anthropic streaming responses are fully supported in both Python and TypeScript. Token counts and cost are captured as the stream completes.',
  },
  {
    q: 'Does it work with LangChain or LlamaIndex?',
    a: 'Yes. LLM calls inside LangChain and LlamaIndex chains are auto-patched, so token usage and cost are captured automatically without any extra instrumentation. Use @vantra.trace on your top-level function and vantra.span() for individual steps.',
  },
  {
    q: 'What counts as a span toward my monthly limit?',
    a: 'Every individual span you send counts: LLM calls, tool invocations, vantra.span() blocks, and top-level @vantra.trace calls. You control what gets instrumented, so you only pay for what you track.',
  },
  {
    q: 'Is my prompt data sent to Vantra?',
    a: 'Yes. Inputs and outputs are captured so you can inspect them in the trace waterfall. Payloads over 2KB are truncated. Set capture_io=False in vantra.init() to disable input/output capture entirely.',
  },
  {
    q: 'What happens to my data?',
    a: 'Trace data is stored securely and never used to train models. You can disable input/output capture with capture_io=False if you are handling sensitive data.',
  },
  {
    q: 'What happens if the Vantra API is down?',
    a: 'Spans are queued in memory and retried. If they fail after retries, they are silently dropped. Your agent keeps running either way.',
  },
  {
    q: 'How do I get my API key?',
    a: 'Go to Settings, then API Keys, then Create key. Keys start with van_live_.',
  },
]

export function DocsFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden">
      {FAQS.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-white font-medium text-sm pr-4">{item.q}</span>
            <span className={`text-zinc-500 text-lg flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
