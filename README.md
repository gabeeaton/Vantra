# Vantra

Observability for AI agents. See every LLM call, tool invocation, latency spike, and cost — in real time.

**Live:** [vantra.dev](https://vantra.dev)

---

## What it does

- **Waterfall traces** — every step of every agent run, nested and timed
- **Cost tracking** — per call, per model, per day
- **Trace search & filtering** — search by name, filter by status, date range, or prompt version
- **Prompt versioning** — tag traces with a version string, filter by it, and compare two versions side by side (error rate, latency, cost)
- **Anomaly alerts** — email when error rate spikes, latency blows up, cost goes off the rails, or daily spend exceeds a budget
- **Weekly digest email** — per-org summary of traces, tokens, cost, error rate, and top models every Monday
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

# Optional: tag with a prompt version so you can filter by it in the dashboard
@vantra.trace(name="my-agent", prompt_version="v2")
async def run_agent_v2(message: str):
    return await agent.run(message)  # async works too
```

Optional `span()` for manual instrumentation:

```python
with vantra.span("retrieve-docs", kind="retriever") as s:
    docs = vector_db.query(query)
    s.set_output(docs)
    s.set_tokens(input_tokens=120, output_tokens=0)
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
}, { promptVersion: 'v2' })  // optional version tag
```

Both SDKs auto-patch OpenAI and Anthropic on `init()`. Zero changes to your agent logic.

Open source: [github.com/gabeeaton/vantra-sdk](https://github.com/gabeeaton/vantra-sdk)

---

## Pricing

Not per seat, ever.

| Plan | Price | Spans | Retention | Alerts |
|---|---|---|---|---|
| Free | $0 | 50K/mo | 30 days | — |
| Indie | $9/mo | 500K/mo | 60 days | Email |
| Pro | $19/mo | 2M/mo | 90 days | Email |
| Team | $79/mo | 10M/mo | 1 year | Email + Slack |
| Enterprise | Custom | Unlimited | Custom | Custom |

---

## Competitors

| Tool | Pricing | Alerts | Notes |
|---|---|---|---|
| LangSmith | $39/seat/mo | Threshold + anomaly | LangChain-optimized, per-seat |
| Langfuse | $29/mo (100K units) | Threshold only | No anomaly detection |
| Helicone | Free / $79/mo | Threshold via evaluators | Proxy-based, adds latency |
| Datadog LLM | $3K+/mo | Full | Enterprise complexity |

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
│   ├── (dashboard)/           # Traces (search/filter), alerts, settings, onboarding
│   ├── changelog/             # Public changelog page
│   ├── docs/                  # Public docs page
│   └── api/
│       ├── v1/ingest/         # SDK ingest (traces + spans)
│       ├── traces/            # Dashboard trace list + detail
│       ├── alerts/            # Alert rules CRUD
│       ├── cron/              # check-alerts, purge-spans, weekly-digest
│       ├── webhooks/stripe/   # Plan sync
│       └── settings/          # API keys + team
├── components/
├── lib/
│   └── digest-email.ts        # Weekly digest HTML email template
└── sdk/
    ├── python/                # vantra on PyPI (v0.1.3)
    └── typescript/            # vantra-sdk on npm (v0.1.3)
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
STRIPE_PRICE_INDIE=
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
cd sdk/python && pytest tests/ -v          # 141 unit tests
python3 sdk/python/tests/test_integration.py  # 53 real-API integration tests
cd sdk/typescript && npm test              # 31 unit tests
cd sdk/typescript && npm run test:integration  # 18 real-API integration tests
```

Integration tests make real Anthropic and OpenAI API calls — verifying tokens, cost, streaming, error spans, `capture_io`, and trace context propagation.

---

## Deployment

Every push to `main` auto-deploys via Vercel.

**Cron jobs** (cron-job.org):
- `https://vantra.dev/api/cron/check-alerts?secret=<CRON_SECRET>` — every 15 min
- `https://vantra.dev/api/cron/purge-spans?secret=<CRON_SECRET>` — daily at 3am
- `https://vantra.dev/api/cron/weekly-digest?secret=<CRON_SECRET>` — Mondays at 9am UTC

**Stripe webhook:** `https://vantra.dev/api/webhooks/stripe`

---

## Roadmap

- [x] Python SDK (PyPI)
- [x] Node.js / TypeScript SDK (npm)
- [x] Open source SDKs
- [x] Trace search and filtering
- [x] Prompt version tagging + version comparison
- [x] Daily budget alerts
- [x] Weekly digest email
- [x] Streaming support (OpenAI + Anthropic, Python + TypeScript)

**Next up**
- [x] p95/p99 latency on the overview page (replaces avg)
- [x] Truncated response detection — flag spans where output_tokens >= max_tokens
- [x] Cost forecasting — monthly projection from 7-day trailing average, shown in cost card
- [x] Rate limit visibility — 429s surfaced in the error rate card
- [x] Simple evals — thumbs up/down on trace detail, indicator in trace list, eval score alert type
- [x] Agent loop detection — alert when a single trace exceeds N spans

**Later**
- [ ] User tracking — attach user_id to traces, see cost/errors/latency per user
- [ ] Session grouping — group multi-turn traces into a conversation thread
- [ ] Anomaly explanation in plain English (LLM call on trace data)
- [ ] LangChain integration
- [ ] LlamaIndex integration
- [ ] Vercel AI SDK integration
- [ ] Dataset curation — save production traces to a test dataset with one click
- [ ] Usage-based billing
- [ ] Helicone migration guide
