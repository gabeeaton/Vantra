# Vantra

Observability for AI agents. See every LLM call, tool invocation, latency spike, and cost — in real time.

**Live:** [vantra.dev](https://vantra.dev)

---

## What it does

- **Waterfall traces** — every step of every agent run, nested and timed
- **Cost tracking** — per call, per model, per day
- **Anomaly alerts** — email + Slack when error rate spikes, latency blows up, or cost goes off the rails
- **Works with anything** — OpenAI, Anthropic, LangChain, custom agents
- **3-line setup** — no proxy, no framework lock-in, no infrastructure to run

---

## SDKs

### Python

```bash
pip install vantra
```

```python
import vantra

vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message: str):
    return agent.run(message)  # your existing code — untouched
```

### Node.js / TypeScript

```bash
npm install vantra-sdk
```

```typescript
import { init, trace } from 'vantra-sdk'

init({ apiKey: 'van_live_...', project: 'my-agent' })

const runAgent = trace(async function runAgent(message: string) {
  return agent.run(message)  // your existing code
})
```

Both SDKs auto-patch OpenAI and Anthropic on `init()`. Zero changes to your agent logic.

Open source: [github.com/gabeeaton/vantra-sdk](https://github.com/gabeeaton/vantra-sdk)

---

## Pricing

| Plan | Price | Spans | Retention | Alerts |
|---|---|---|---|---|
| Free | $0 | 50K/mo | 30 days | — |
| Pro | $29/mo | 1M/mo | 90 days | Email |
| Team | $299/mo | 10M/mo | 1 year | Email + Slack |
| Enterprise | Custom | Unlimited | Custom | Custom |

---

## Competitors

| Tool | Wedge against Vantra |
|---|---|
| LangSmith | LangChain-first, $39/user/month, no anomaly alerts |
| Langfuse | Self-hosted complexity, no alerting |
| Helicone | Proxy-based (adds latency), OpenAI-only, no traces |
| Datadog LLM | $3K+/month, enterprise complexity |

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind |
| Database | Supabase (Postgres + Auth) |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |
| Cron | cron-job.org |
| SDKs | Python (PyPI) + Node.js (npm) |

---

## Project structure

```
vantra/
├── app/
│   ├── (auth)/login/          # GitHub + Google OAuth
│   ├── (dashboard)/           # Traces, alerts, settings, onboarding
│   ├── docs/                  # Public docs page
│   └── api/
│       ├── v1/ingest/         # SDK ingest (traces + spans)
│       ├── traces/            # Dashboard trace list + detail
│       ├── alerts/            # Alert rules CRUD
│       ├── cron/              # check-alerts + purge-spans
│       ├── webhooks/stripe/   # Plan sync
│       └── settings/          # API keys + team
├── components/
├── lib/
└── sdk/
    ├── python/                # vantra on PyPI (v0.1.2)
    └── typescript/            # vantra-sdk on npm (v0.1.2)
```

---

## Local development

```bash
git clone <repo>
cd vantra
npm install
cp .env.local.example .env.local
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_TEAM=

RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=https://vantra.dev
CRON_SECRET=

OPENAI_API_KEY=     # for test scripts only
VANTRA_API_KEY=     # your own van_live_ key for test scripts
```

### Test scripts

```bash
# Python OpenAI agent test (mocked — no real key needed)
python3 test_openai.py

# Python Anthropic agent test (mocked)
python3 test_anthropic.py

# Node.js OpenAI agent test
node test_openai.js

# Node.js Anthropic agent test (mocked)
node test_anthropic.js
```

### SDK tests

```bash
cd sdk/python && pytest tests/ -v   # 63 tests
```

---

## Deployment

Every push to `main` auto-deploys via Vercel.

**Cron jobs** (cron-job.org):
- `https://vantra.dev/api/cron/check-alerts?secret=<CRON_SECRET>` — every 15 min
- `https://vantra.dev/api/cron/purge-spans?secret=<CRON_SECRET>` — daily at 3am

**Stripe webhook:** `https://vantra.dev/api/webhooks/stripe`

---

## Roadmap

- [x] Python SDK (PyPI)
- [x] Node.js / TypeScript SDK (npm)
- [x] Open source SDKs
- [ ] Trace search and filtering
- [ ] Weekly digest email
- [ ] Usage-based billing
- [ ] Helicone migration guide
