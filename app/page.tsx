import Link from 'next/link'
import Image from 'next/image'
import { ScrollReveal } from '@/components/scroll-reveal'
import { Nav } from '@/components/nav'
import { GitBranch, DollarSign, Bell, Puzzle, SearchCode, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-inter)]">
      <Nav />

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center overflow-hidden">
        {/* Ambient top glow — very subtle */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(77,229,252,0.07),transparent)] -z-10" />


        <h1 className="hero-title text-5xl sm:text-7xl font-black tracking-tight leading-none mb-6">
          See inside your
          <br />
          <span className="text-[#4DE5FC]">AI agents.</span>
        </h1>

        <p className="hero-sub text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Vantra gives engineers full visibility into every LLM call, tool invocation, and decision their agents make in production — before users find the bugs.
        </p>

        <div className="hero-cta flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link href="/login" className="bg-[#4DE5FC] text-black font-bold px-8 py-4 rounded-xl hover:bg-[#3dd4ea] active:scale-[0.98] transition-all text-base">
            Start for free
          </Link>
          <a href="#how-it-works" className="border border-white/10 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/[0.06] active:scale-[0.98] transition-all text-base">
            See how it works
          </a>
        </div>
        <p className="hero-footnote text-zinc-600 text-sm">No credit card required · 3-line setup · works with any framework</p>
      </section>

      {/* Fake terminal / trace preview */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <ScrollReveal>
        <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-zinc-500 text-xs font-mono">vantra — trace: support_agent_run</span>
          </div>

          {/* Trace header */}
          <div className="flex gap-8 px-6 py-4 border-b border-white/5">
            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Duration</p><p className="text-white font-semibold">4,231ms</p></div>
            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Tokens</p><p className="text-white font-semibold">1,420</p></div>
            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Cost</p><p className="text-white font-semibold">$0.0042</p></div>
            <div><p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</p><p className="text-green-400 font-semibold">ok</p></div>
          </div>

          {/* Spans */}
          <div className="overflow-x-auto">
            <div className="divide-y divide-white/5 min-w-[640px]">
              {[
                { name: 'support_agent_run', kind: 'agent', model: '', duration: '4,231ms', tokens: '', cost: '', bar: { left: 0, width: 100, color: 'bg-zinc-600' }, indent: 0 },
                { name: 'openai.chat (classify)', kind: 'llm', model: 'gpt-4o-mini', duration: '312ms', tokens: '220', cost: '$0.0001', bar: { left: 0, width: 8, color: 'bg-blue-500' }, indent: 1 },
                { name: 'tool.search_knowledge', kind: 'tool', model: '', duration: '891ms', tokens: '', cost: '', bar: { left: 8, width: 21, color: 'bg-green-500' }, indent: 1 },
                { name: 'openai.chat (respond)', kind: 'llm', model: 'gpt-4o', duration: '2,891ms', tokens: '1,240', cost: '$0.0041', bar: { left: 29, width: 68, color: 'bg-blue-500' }, indent: 1, slow: true },
                { name: 'tool.send_email', kind: 'tool', model: '', duration: '137ms', tokens: '', cost: '', bar: { left: 97, width: 3, color: 'bg-green-500' }, indent: 1 },
              ].map((span, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-2.5 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 w-64 flex-shrink-0" style={{ paddingLeft: `${span.indent * 20}px` }}>
                    <span className="text-zinc-200 text-xs font-mono truncate">{span.name}</span>
                    {span.slow && <span className="text-yellow-500 text-xs">⚠</span>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${span.kind === 'llm' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : span.kind === 'tool' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                    {span.kind}
                  </span>
                  <span className="text-zinc-500 text-xs font-mono w-24 flex-shrink-0">{span.model}</span>
                  <span className="text-zinc-400 text-xs tabular-nums w-16 flex-shrink-0 text-right">{span.duration}</span>
                  <div className="flex-1 relative h-3 bg-zinc-800 rounded overflow-hidden min-w-[80px]">
                    <div className={`absolute top-0 h-full rounded opacity-70 ${span.bar.color}`} style={{ left: `${span.bar.left}%`, width: `${span.bar.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5">
        <ScrollReveal>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">3 lines. Full visibility.</h2>
          <p className="text-zinc-400 text-lg">Add Vantra to any Python or Node.js agent in under a minute.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
              <div className="w-2 h-2 rounded-full bg-[#4DE5FC]" />
              <span className="text-zinc-500 text-xs font-mono">agent.py</span>
            </div>
            <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto">
              <span className="text-zinc-500">{"# Before: flying blind"}</span>{"\n"}
              <span className="text-zinc-500">{"# After: full observability"}</span>{"\n\n"}
              <span className="text-[#4DE5FC]">import</span> <span className="text-white">vantra</span>{"\n"}
              <span className="text-white">vantra</span><span className="text-zinc-400">.</span><span className="text-[#4DE5FC]">init</span><span className="text-zinc-400">(</span>{"\n"}
              {"  "}<span className="text-zinc-400">api_key=</span><span className="text-green-400">"van_live_..."</span><span className="text-zinc-400">,</span>{"\n"}
              {"  "}<span className="text-zinc-400">project=</span><span className="text-green-400">"my-agent"</span>{"\n"}
              <span className="text-zinc-400">)</span>{"\n\n"}
              <span className="text-[#4DE5FC]">@vantra.trace</span>{"\n"}
              <span className="text-purple-400">def</span> <span className="text-white">run_agent</span><span className="text-zinc-400">(message):</span>{"\n"}
              {"  "}<span className="text-zinc-500">{"# your existing code, untouched"}</span>{"\n"}
              {"  "}<span className="text-purple-400">return</span> <span className="text-white">agent</span><span className="text-zinc-400">.</span><span className="text-white">run</span><span className="text-zinc-400">(message)</span>
            </pre>
          </div>

          <div className="space-y-6">
            {[
              { num: '01', title: 'Install the SDK', body: 'pip install vantra or npm install @gabeeaton/vantra — works with OpenAI, Anthropic, LangChain, or raw API calls.' },
              { num: '02', title: 'Add 3 lines', body: 'init() + one decorator. No changes to your agent logic. Auto-patches LLM clients.' },
              { num: '03', title: 'See everything', body: 'Every LLM call, tool use, latency, token count, and cost — live in your dashboard.' },
            ].map((step) => (
              <div key={step.num} className="flex gap-4">
                <span className="text-[#4DE5FC] font-black text-lg tabular-nums flex-shrink-0">{step.num}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{step.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Everything you need to ship with confidence</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Built for engineers who are tired of finding out about agent failures from angry users.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { Icon: GitBranch, title: 'Waterfall traces', body: 'See every step of every agent run. Nested spans, latency bars, input/output inspection — like Chrome DevTools for your agent.' },
            { Icon: DollarSign, title: 'Cost tracking', body: 'Know exactly what each agent run costs. Per model, per project, per day. Catch cost spikes before your bill does.' },
            { Icon: Bell, title: 'Anomaly alerts', body: 'Get emailed when error rate spikes, latency blows up, or cost goes off the rails. Before your users notice.' },
            { Icon: Puzzle, title: 'Framework agnostic', body: 'LangChain, LlamaIndex, raw OpenAI/Anthropic, custom agents — if it makes LLM calls, Vantra captures it.' },
            { Icon: SearchCode, title: 'Error drill-down', body: 'When a span fails, see the exact input that caused it, the error message, and which tool or model was responsible.' },
            { Icon: BarChart3, title: 'Usage analytics', body: 'Dashboards for token usage, model distribution, and latency trends. Make data-driven decisions about your stack.' },
          ].map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 60}>
              <div className="card-hover bg-zinc-950 border border-white/5 rounded-2xl p-6 h-full">
                <div className="w-9 h-9 rounded-lg bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center mb-4">
                  <f.Icon size={16} className="text-[#4DE5FC]" strokeWidth={1.75} />
                </div>
                <h3 className="font-bold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Competitor comparison */}
      <section className="max-w-4xl mx-auto px-6 py-24 border-t border-white/5">
        <ScrollReveal>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">Why Vantra</h2>
          <p className="text-zinc-400">The others are either too expensive, too complex, or built for someone else.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 pr-6 text-zinc-500 font-medium">Tool</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium">Setup</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium">Pricing</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium">Alerts</th>
                <th className="text-left py-3 px-4 text-zinc-500 font-medium">Framework</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="bg-[#4DE5FC]/5 border border-[#4DE5FC]/20 rounded-xl">
                <td className="py-3 pr-6 font-bold text-[#4DE5FC]">Vantra</td>
                <td className="py-3 px-4 text-green-400">3 lines</td>
                <td className="py-3 px-4 text-green-400">Free → $29/mo</td>
                <td className="py-3 px-4 text-green-400">Anomaly detection built-in</td>
                <td className="py-3 px-4 text-green-400">Any</td>
              </tr>
              <tr>
                <td className="py-3 pr-6 text-zinc-300">LangSmith</td>
                <td className="py-3 px-4 text-zinc-500">Medium</td>
                <td className="py-3 px-4 text-zinc-500">$39/seat/mo</td>
                <td className="py-3 px-4 text-zinc-500">Limited</td>
                <td className="py-3 px-4 text-zinc-500">LangChain-optimized</td>
              </tr>
              <tr>
                <td className="py-3 pr-6 text-zinc-300">Langfuse</td>
                <td className="py-3 px-4 text-zinc-500">Medium</td>
                <td className="py-3 px-4 text-zinc-500">Free (self-host) or $29/mo</td>
                <td className="py-3 px-4 text-zinc-500">Basic</td>
                <td className="py-3 px-4 text-zinc-500">Any</td>
              </tr>
              <tr>
                <td className="py-3 pr-6 text-zinc-300">Datadog LLM</td>
                <td className="py-3 px-4 text-zinc-500">Complex</td>
                <td className="py-3 px-4 text-red-400">$3K+/mo</td>
                <td className="py-3 px-4 text-green-400">Yes</td>
                <td className="py-3 px-4 text-zinc-500">Any</td>
              </tr>
            </tbody>
          </table>
        </div>
        </ScrollReveal>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24 border-t border-white/5">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Simple pricing</h2>
            <p className="text-zinc-400">Start free. Pay when you scale.</p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              features: ['50K spans/month', '1 project', '30-day retention', 'Waterfall traces', 'Cost tracking'],
              cta: 'Start free',
              highlight: false,
            },
            {
              name: 'Pro',
              price: '$29',
              period: 'per month',
              features: ['1M spans/month', '10 projects', '90-day retention', 'Email alerts', 'All Free features'],
              cta: 'Get started',
              highlight: true,
              badge: 'Launch pricing',
            },
            {
              name: 'Team',
              price: '$299',
              period: 'per month',
              features: ['10M spans/month', 'Unlimited projects', '1-year retention', 'Slack alerts', 'Priority support'],
              cta: 'Get started',
              highlight: false,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              period: '',
              features: ['Unlimited spans', 'Private deploy', 'SSO / SAML', 'SLA + dedicated support', 'Custom retention'],
              cta: 'Contact us',
              highlight: false,
            },
          ].map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 80}>
              <div className={`rounded-2xl p-6 border h-full ${plan.highlight ? 'bg-[#4DE5FC]/5 border-[#4DE5FC]/40' : 'bg-zinc-950 border-white/5'}`}>
                {plan.highlight && (
                  <div className="text-[#4DE5FC] text-xs font-bold uppercase tracking-wider mb-3">Most popular</div>
                )}
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">/{plan.period}</span>
                  {'badge' in plan && plan.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4DE5FC] bg-[#4DE5FC]/10 px-1.5 py-0.5 rounded">{plan.badge}</span>
                  )}
                </div>
                <ul className="mt-6 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <span className="text-[#4DE5FC]">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? 'bg-[#4DE5FC] text-black hover:bg-[#3dd4ea]' : 'border border-white/10 text-white hover:bg-white/5'}`}>
                  {plan.cta}
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <ScrollReveal>
          <h2 className="text-5xl font-black mb-6">
            Stop guessing.<br />
            <span className="text-[#4DE5FC]">Start seeing.</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8">Join engineers who ship AI agents with confidence.</p>
          <Link href="/login" className="inline-block bg-[#4DE5FC] text-black font-bold px-10 py-4 rounded-xl hover:bg-[#3dd4ea] transition-colors text-lg">
            Get started free
          </Link>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-zinc-600 text-sm">© 2026 Vantra. Built by Gabe Eaton.</p>
            <iframe src="https://vantradev.betteruptime.com/badge?theme=dark" width="250" height="30" frameBorder={0} scrolling="no" style={{ colorScheme: 'normal' }} />
          </div>
        </div>
      </footer>
    </div>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/logo.jpeg" alt="Vantra" width={32} height={32} className="rounded-lg" />
      <span className="font-black text-white text-lg tracking-tight">Vantra</span>
    </div>
  )
}
