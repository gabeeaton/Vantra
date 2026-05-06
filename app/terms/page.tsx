export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="text-[#4DE5FC] text-sm hover:underline">← Vantra</a>
        <h1 className="text-3xl font-bold mt-8 mb-2">Terms of Service</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: May 5, 2026</p>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">Acceptance</h2>
            <p>By using Vantra you agree to these terms. If you don't agree, don't use the service.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">The service</h2>
            <p>Vantra provides observability tooling for AI agents. We offer a dashboard, SDK, and alerting system to help you monitor LLM calls, costs, and errors in production.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Your account</h2>
            <p>You are responsible for keeping your API keys secure. Do not share your keys publicly. You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Acceptable use</h2>
            <p>You may not use Vantra to send illegal content, spam, or data that violates third-party rights. You may not attempt to reverse-engineer, scrape, or abuse our infrastructure.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Billing</h2>
            <p>Paid plans are billed monthly. You can cancel at any time. No refunds for partial months. We reserve the right to change pricing with 30 days notice.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Uptime</h2>
            <p>We aim for high availability but do not guarantee 100% uptime. The SDK is designed to fail silently — if Vantra is unavailable, your agent continues to work unaffected.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Limitation of liability</h2>
            <p>Vantra is provided "as is." We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Termination</h2>
            <p>We may suspend or terminate your account for violations of these terms. You may cancel your account at any time by contacting <a href="mailto:hello@vantra.dev" className="text-[#4DE5FC] hover:underline">hello@vantra.dev</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:hello@vantra.dev" className="text-[#4DE5FC] hover:underline">hello@vantra.dev</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
