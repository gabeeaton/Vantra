export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-inter)]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="text-[#4DE5FC] text-sm hover:underline">← Vantra</a>
        <h1 className="text-3xl font-bold mt-8 mb-2">Changelog</h1>
        <p className="text-zinc-500 text-sm mb-12">What we've shipped, in order.</p>

        <div className="space-y-12">

          <div className="border-l-2 border-[#4DE5FC]/30 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#4DE5FC]" />
            <div className="text-xs text-zinc-500 mb-2">May 7, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">Dashboard: p95 latency, rate limits, cost forecast, truncation detection</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• Overview now shows p95 latency (with avg as secondary) instead of avg alone</li>
              <li>• Rate-limited spans (429s) surfaced in the error rate card</li>
              <li>• Monthly cost projection shown in the cost card, based on 7-day trailing average</li>
              <li>• Truncated response detection in trace waterfall: flags LLM spans where output hit the token limit</li>
            </ul>
          </div>

          <div className="border-l-2 border-zinc-800 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-600" />
            <div className="text-xs text-zinc-500 mb-2">May 7, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">Pricing update</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• New Indie plan: $9/mo, 500K spans/month, 60-day retention</li>
              <li>• Pro: $19/mo, 2M spans/month (was $29, 1M)</li>
              <li>• Team: $79/mo (was $299)</li>
              <li>• Not per seat, ever</li>
              <li>• Docs FAQ now searchable with accordion UI</li>
            </ul>
          </div>

          <div className="border-l-2 border-zinc-800 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-600" />
            <div className="text-xs text-zinc-500 mb-2">May 6, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">v0.1.3 — Streaming, prompt versioning, trace search, weekly digest</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• Streaming support: <code className="text-[#4DE5FC] text-xs">stream=True</code> calls now captured automatically for both OpenAI and Anthropic, in Python and TypeScript</li>
              <li>• Prompt version tagging: pass <code className="text-[#4DE5FC] text-xs">prompt_version="v2"</code> to <code className="text-[#4DE5FC] text-xs">@vantra.trace</code> and filter traces by version in the dashboard</li>
              <li>• Version comparison: select two prompt versions to see error rate, latency, and cost side by side</li>
              <li>• Trace search: filter by name, status, date range, or prompt version</li>
              <li>• Daily budget alerts: get notified when spend exceeds a threshold, resets at midnight UTC</li>
              <li>• Weekly digest: Monday morning email with traces, tokens, cost, error rate, and top models per org</li>
              <li>• Python SDK: 141 unit tests + 53 real-API integration tests</li>
              <li>• TypeScript SDK: 31 unit tests + 18 real-API integration tests</li>
            </ul>
          </div>

          <div className="border-l-2 border-zinc-800 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-600" />
            <div className="text-xs text-zinc-500 mb-2">May 6, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">v0.1.2 — Async support, capture_io, full message history</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• Python SDK: <code className="text-[#4DE5FC] text-xs">@vantra.trace</code> now works on <code className="text-[#4DE5FC] text-xs">async def</code> functions</li>
              <li>• Python SDK: <code className="text-[#4DE5FC] text-xs">capture_io=False</code> suppresses prompt/response capture for sensitive workloads</li>
              <li>• Python SDK: <code className="text-[#4DE5FC] text-xs">span.set_input()</code> for manually logging span inputs</li>
              <li>• Python SDK: fixed Anthropic integration — tokens and cost now tracked correctly</li>
              <li>• Python SDK: full conversation history captured, not just the last message</li>
              <li>• TypeScript SDK: fixed async trace timing — duration and tokens now accurate</li>
              <li>• TypeScript SDK: Anthropic patching fixed for <code className="text-[#4DE5FC] text-xs">@anthropic-ai/sdk</code></li>
            </ul>
          </div>

          <div className="border-l-2 border-zinc-800 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-600" />
            <div className="text-xs text-zinc-500 mb-2">May 4, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">v0.1.1 — TypeScript SDK, Slack alerts, team invites</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• TypeScript / Node.js SDK published to npm (<code className="text-[#4DE5FC] text-xs">npm install vantra-sdk</code>)</li>
              <li>• Slack webhook alerts — get notified in any channel</li>
              <li>• Team invites — add teammates to your org by email</li>
              <li>• Anomaly alerts for error rate, p95 latency, and cost per hour</li>
            </ul>
          </div>

          <div className="border-l-2 border-zinc-800 pl-6 relative">
            <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-zinc-600" />
            <div className="text-xs text-zinc-500 mb-2">May 1, 2026</div>
            <h2 className="text-white font-semibold text-base mb-3">v0.1.0 — Launch</h2>
            <ul className="space-y-1.5 text-zinc-400 text-sm">
              <li>• Python SDK on PyPI — <code className="text-[#4DE5FC] text-xs">pip install vantra</code></li>
              <li>• Auto-patches OpenAI and Anthropic on <code className="text-[#4DE5FC] text-xs">init()</code></li>
              <li>• Waterfall trace view with per-span timing</li>
              <li>• Cost tracking per call, per model, per day</li>
              <li>• Dashboard with real-time traces and cost overview</li>
              <li>• Free tier: 50K spans/month, 30-day retention</li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 text-sm">
            Ship something worth mentioning?{' '}
            <a href="https://github.com/gabeeaton/vantra-sdk" className="text-zinc-400 hover:text-white transition-colors">
              Follow on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
