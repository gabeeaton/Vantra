'use client'

import { useState } from 'react'
import Link from 'next/link'

function CodeBlock({ children, lang }: { children: string; lang: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
        <span className="text-zinc-500 text-xs font-mono">{lang}</span>
      </div>
      <pre className="p-4 text-xs text-zinc-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">{children}</pre>
    </div>
  )
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center mt-0.5">
        <span className="text-[#4DE5FC] text-xs font-bold">{num}</span>
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="text-white font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function DocsQuickstart() {
  const [lang, setLang] = useState<'python' | 'node'>('python')

  return (
    <section id="quickstart" className="space-y-6">
      <h2 className="text-2xl font-bold border-b border-white/5 pb-4">Quickstart</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setLang('python')}
          className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${lang === 'python' ? 'bg-[#4DE5FC]/10 border-[#4DE5FC]/30 text-[#4DE5FC]' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-zinc-300'}`}
        >
          Python
        </button>
        <button
          onClick={() => setLang('node')}
          className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${lang === 'node' ? 'bg-[#4DE5FC]/10 border-[#4DE5FC]/30 text-[#4DE5FC]' : 'bg-zinc-900 border-white/10 text-zinc-500 hover:text-zinc-300'}`}
        >
          Node.js / TypeScript
        </button>
      </div>

      <Step num={1} title="Install the SDK">
        {lang === 'python'
          ? <CodeBlock lang="bash">pip install vantra</CodeBlock>
          : <CodeBlock lang="bash">npm install vantra-sdk</CodeBlock>
        }
      </Step>

      <Step num={2} title="Get your API key">
        <p className="text-zinc-400 text-sm">
          Go to <Link href="/dashboard/settings" className="text-[#4DE5FC] hover:underline">Settings → API Keys</Link> and create a key.
        </p>
      </Step>

      <Step num={3} title="Add 3 lines to your agent">
        {lang === 'python' ? (
          <CodeBlock lang="python">{`import vantra

vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message: str):
    return agent.run(message)  # your existing code`}</CodeBlock>
        ) : (
          <CodeBlock lang="typescript">{`import { init, trace } from 'vantra-sdk'

init({ apiKey: 'van_live_...', project: 'my-agent' })

const runAgent = trace(async function runAgent(message: string) {
  return agent.run(message)  // your existing code
})`}</CodeBlock>
        )}
      </Step>

      <Step num={4} title="Run your agent and open the dashboard">
        <p className="text-zinc-400 text-sm">
          Every trace appears in your <Link href="/dashboard/traces" className="text-[#4DE5FC] hover:underline">Traces dashboard</Link> within seconds. OpenAI and Anthropic calls are captured automatically.
        </p>
      </Step>
    </section>
  )
}
