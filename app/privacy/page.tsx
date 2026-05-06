export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-inter)]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <a href="/" className="text-[#4DE5FC] text-sm hover:underline">← Vantra</a>
        <h1 className="text-3xl font-bold mt-8 mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-12">Last updated: May 5, 2026</p>

        <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">What we collect</h2>
            <p>Vantra collects data you send via our SDK — trace names, span names, LLM model names, token counts, costs, latencies, and error messages. We also collect your email address and GitHub/Google account information when you sign up.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">How we use it</h2>
            <p>We use this data solely to provide the Vantra dashboard and alerting service to you. We do not sell your data to third parties, use it for advertising, or share it with anyone outside of Vantra.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Data storage</h2>
            <p>Your data is stored in Supabase (PostgreSQL) hosted on AWS in the US East region. Data is retained according to your plan: 7 days (Free), 30 days (Pro), or 90 days (Team).</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Third-party services</h2>
            <p>We use Supabase for database and authentication, Stripe for payments, and Resend for transactional email. Each of these services has their own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Your rights</h2>
            <p>You can delete your account and all associated data at any time by contacting us at <a href="mailto:hello@vantra.dev" className="text-[#4DE5FC] hover:underline">hello@vantra.dev</a>. We will delete your data within 30 days.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Cookies</h2>
            <p>We use cookies only for authentication (Supabase session). We do not use tracking or advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@vantra.dev" className="text-[#4DE5FC] hover:underline">hello@vantra.dev</a>.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
