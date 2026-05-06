import Link from 'next/link'
import Image from 'next/image'
import { CodeBlockServer } from '@/components/code-block-server'
import { Nav } from '@/components/nav'
import { DocsQuickstart } from '@/components/docs-quickstart'

export const metadata = {
  title: 'Docs — Vantra',
  description: 'Get started with Vantra in under 5 minutes. Install the SDK, add 3 lines, and see every LLM call in your dashboard.',
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-inter)]">
      <Nav />

      <div className="max-w-5xl mx-auto px-6 py-16 flex gap-16 overflow-x-hidden">
        {/* Sidebar */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            {[
              { href: '#quickstart', label: 'Quickstart' },
              { href: '#install', label: 'Installation' },
              { href: '#init', label: 'vantra.init()' },
              { href: '#trace', label: '@vantra.trace' },
              { href: '#span', label: 'vantra.span()' },
              { href: '#openai', label: 'OpenAI auto-patch' },
              { href: '#anthropic', label: 'Anthropic auto-patch' },
              { href: '#example', label: 'Full example' },
              { href: '#faq', label: 'FAQ' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block text-sm text-zinc-500 hover:text-white transition-colors py-1"
              >
                {item.label}
              </a>
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 space-y-16 page-enter">

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 text-[#4DE5FC] text-xs font-medium px-3 py-1.5 rounded-full">
                Python SDK · v0.1
              </span>
              <a
                href="https://github.com/gabeeaton/vantra-sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 text-zinc-400 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Open source · MIT
              </a>
            </div>
            <h1 className="text-4xl font-black mb-4">Get started with Vantra</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Add full observability to any Python AI agent in under 5 minutes.
              No changes to your agent logic required.
            </p>
          </div>

          {/* Quickstart */}
          <DocsQuickstart />

          {/* Install */}
          <section id="install" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">Installation</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Python 3.8+ or Node.js 14+. Both SDKs are open source on{' '}
              <a href="https://github.com/gabeeaton/vantra-sdk" target="_blank" rel="noopener noreferrer" className="text-[#4DE5FC] hover:underline">GitHub</a>.
            </p>
            <CodeBlockServer lang="bash">{`# Python
pip install vantra

# Node.js / TypeScript
npm install vantra-sdk`}</CodeBlockServer>
          </section>

          {/* init */}
          <section id="init" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">vantra.init()</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Call once at the start of your application, before any traced functions run.
            </p>
            <CodeBlockServer lang="python">{`vantra.init(
    api_key="van_live_...",   # required
    project="my-agent",       # optional — groups traces in dashboard
)`}</CodeBlockServer>

            <Table
              headers={['Parameter', 'Type', 'Required', 'Description']}
              rows={[
                ['api_key', 'str', 'Yes', 'Your Vantra API key from Settings'],
                ['project', 'str', 'No', 'Project name shown in the dashboard'],
              ]}
            />
          </section>

          {/* @trace */}
          <section id="trace" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">@vantra.trace</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Decorator that wraps a function as a root trace. Every call creates a new trace
              in the dashboard with timing, status, and any nested spans.
            </p>
            <CodeBlockServer lang="python">{`@vantra.trace
def run_agent(message: str) -> str:
    result = call_llm(message)
    return result

# Also works on async functions
@vantra.trace
async def run_agent_async(message: str) -> str:
    result = await call_llm_async(message)
    return result`}</CodeBlockServer>

            <Callout>
              If the decorated function raises an exception, the trace is automatically marked as
              <span className="text-red-400 font-mono"> error</span> and the error message is captured.
            </Callout>
          </section>

          {/* span() */}
          <section id="span" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">vantra.span()</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Context manager for creating child spans inside a trace. Use this to instrument
              individual steps — tool calls, retrievals, chains.
            </p>
            <CodeBlockServer lang="python">{`@vantra.trace
def run_agent(message: str) -> str:
    with vantra.span("search_knowledge", kind="tool") as span:
        results = search(message)
        span.set_output({"results": results})

    with vantra.span("generate_response", kind="llm") as span:
        response = llm.chat(message, context=results)
        span.set_output({"response": response})

    return response`}</CodeBlockServer>

            <Table
              headers={['Parameter', 'Type', 'Description']}
              rows={[
                ['name', 'str', 'Span name shown in the waterfall'],
                ['kind', 'str', '"llm" | "tool" | "retrieval" | "chain" | "agent"'],
              ]}
            />
          </section>

          {/* OpenAI */}
          <section id="openai" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">OpenAI auto-patch</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Vantra automatically patches the OpenAI client after <code className="text-[#4DE5FC] bg-white/5 px-1.5 py-0.5 rounded text-xs">vantra.init()</code> is called.
              Every <code className="text-[#4DE5FC] bg-white/5 px-1.5 py-0.5 rounded text-xs">chat.completions.create</code> call is captured as an LLM span — including tokens, cost, model, and latency.
            </p>
            <CodeBlockServer lang="python">{`import vantra
import openai

vantra.init(api_key="van_live_...", project="my-agent")

client = openai.OpenAI()

@vantra.trace
def ask(question: str) -> str:
    # This call is automatically captured — no extra code needed
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": question}]
    )
    return response.choices[0].message.content`}</CodeBlockServer>
          </section>

          {/* Anthropic */}
          <section id="anthropic" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">Anthropic auto-patch</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Same as OpenAI — Anthropic's <code className="text-[#4DE5FC] bg-white/5 px-1.5 py-0.5 rounded text-xs">messages.create</code> is automatically captured.
            </p>
            <CodeBlockServer lang="python">{`import vantra
import anthropic

vantra.init(api_key="van_live_...", project="my-agent")

client = anthropic.Anthropic()

@vantra.trace
def ask(question: str) -> str:
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{"role": "user", "content": question}]
    )
    return response.content[0].text`}</CodeBlockServer>
          </section>

          {/* Full example */}
          <section id="example" className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">Full example</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A complete support agent with nested spans, tool calls, and automatic LLM capture:
            </p>
            <CodeBlockServer lang="python">{`import vantra
import openai

vantra.init(api_key="van_live_...", project="support-agent")

client = openai.OpenAI()

def search_knowledge_base(query: str) -> list[str]:
    # your retrieval logic
    return ["relevant doc 1", "relevant doc 2"]

def send_email(to: str, body: str) -> bool:
    # your email logic
    return True

@vantra.trace
def handle_support_ticket(ticket: dict) -> str:
    # Step 1: classify
    with vantra.span("classify", kind="llm"):
        classification = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Classify this support ticket."},
                {"role": "user", "content": ticket["message"]},
            ]
        )
        category = classification.choices[0].message.content

    # Step 2: search
    with vantra.span("search_kb", kind="tool") as span:
        docs = search_knowledge_base(ticket["message"])
        span.set_output({"docs": docs, "count": len(docs)})

    # Step 3: respond
    with vantra.span("generate_response", kind="llm"):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are a support agent. Context: {docs}"},
                {"role": "user", "content": ticket["message"]},
            ]
        )
        reply = response.choices[0].message.content

    # Step 4: send
    with vantra.span("send_email", kind="tool"):
        send_email(ticket["email"], reply)

    return reply


if __name__ == "__main__":
    handle_support_ticket({
        "message": "My payment isn't going through",
        "email": "user@example.com",
    })`}</CodeBlockServer>
          </section>

          {/* FAQ */}
          <section id="faq" className="space-y-6">
            <h2 className="text-2xl font-bold border-b border-white/5 pb-4">FAQ</h2>

            {[
              {
                q: 'Does Vantra add latency to my agent?',
                a: 'No. All trace data is sent in a background thread with a queue. Your agent function returns immediately — Vantra never blocks the main thread.',
              },
              {
                q: 'What happens if the Vantra API is down?',
                a: 'Spans are queued in memory and retried. If they fail after retries, they are silently dropped — your agent keeps running either way.',
              },
              {
                q: 'Does it work with LangChain or LlamaIndex?',
                a: 'Yes. Use @vantra.trace on your top-level chain or agent function, and vantra.span() around individual steps. The LLM calls inside are auto-patched.',
              },
              {
                q: 'Is my prompt data sent to Vantra?',
                a: 'Yes — inputs and outputs are captured so you can inspect them in the trace waterfall. Payloads over 2KB are truncated. Contact us if you need input/output capture disabled.',
              },
              {
                q: 'How do I get my API key?',
                a: 'Go to Settings → API Keys → Create key. Keys start with van_live_.',
              },
            ].map((item) => (
              <div key={item.q} className="space-y-2">
                <h3 className="text-white font-semibold text-sm">{item.q}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </section>

          {/* CTA */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
            <p className="text-zinc-400 text-sm mb-6">Free for up to 10K spans/month. No credit card required.</p>
            <Link
              href="/login"
              className="inline-block bg-[#4DE5FC] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#3dd4ea] transition-colors"
            >
              Create free account
            </Link>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 mt-16">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.jpeg" alt="Vantra" width={24} height={24} className="rounded-md" />
            <span className="font-black text-white text-sm tracking-tight">Vantra</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2025 Vantra</p>
        </div>
      </footer>
    </div>
  )
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="w-7 h-7 rounded-full bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[#4DE5FC] text-xs font-bold">{num}</span>
      </div>
      <div className="flex-1 space-y-3">
        <h3 className="text-white font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  )
}


function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-white/5 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-zinc-900/50 border-b border-white/5">
            {headers.map(h => (
              <th key={h} className="text-left px-4 py-2.5 text-zinc-400 font-medium text-xs">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-2.5 text-xs ${j === 0 ? 'text-[#4DE5FC] font-mono' : 'text-zinc-400'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#4DE5FC]/5 border border-[#4DE5FC]/20 rounded-xl px-4 py-3 text-zinc-400 text-sm leading-relaxed">
      <span className="text-[#4DE5FC] font-semibold">Note: </span>
      {children}
    </div>
  )
}
