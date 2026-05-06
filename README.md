# Vantra

Observability for AI agents. See every LLM call, tool invocation, latency spike, and cost — in real time.

**Live:** [vantra.dev](https://vantra.dev)

---

## Business context

**What problem it solves:** Engineers building AI agents have no visibility into what their agents actually do in production. When an agent fails — hallucinating, looping, making wrong tool calls, or costing 10x what it should — they find out from angry users, not dashboards. There is no "DevTools" for AI agents today.

**Who it's for:** Software engineers and small teams actively shipping AI agents to production. The buying moment is when they're past the prototype stage, running real users, and starting to feel the pain of blind production failures or surprise API bills.

**What it does:** Add 3 lines of Python, get a full dashboard with waterfall traces of every agent step, token counts, cost per run, error tracking, and email/Slack alerts when something goes wrong. OpenAI and Anthropic calls are automatically instrumented — no changes to existing agent code.

**Founder:** 22-year-old college student. Solo project. Built from scratch — auth, payments, SDK, alerting, email, deployment.

**Current status:** Live in production at vantra.dev. Real traces being ingested. Stripe connected (live keys). Free tier open, paid plans at $79/mo and $299/mo.

**Revenue:** $0 (no paying customers yet). Looking for first 10 users.

**Stack:** Next.js 16, Supabase (Postgres + Auth), Stripe, Resend, Vercel, Python SDK (pip installable).

---

## What it does

- **Waterfall traces** — every step of every agent run, nested and timed
- **Cost tracking** — per call, per model, per day
- **Anomaly alerts** — email + Slack when error rate spikes, latency blows up, or cost goes off the rails
- **Works with anything** — OpenAI, Anthropic, LangChain, custom agents
- **3-line setup** — no proxy, no framework lock-in, no infrastructure to run

---

## Pricing

| Plan | Price | Spans | Projects | Retention | Alerts |
|---|---|---|---|---|---|
| Free | $0 | 50K/mo | 1 | 7 days | — |
| Pro | $79/mo | 1M/mo | 10 | 30 days | Email |
| Team | $299/mo | 10M/mo | Unlimited | 90 days | Email + Slack |
| Enterprise | Custom | Unlimited | Unlimited | Custom | Custom |

---

## Competitors

| Tool | Wedge against Vantra |
|---|---|
| LangSmith | LangChain-first, $39/user/month, no anomaly alerts |
| Langfuse | Self-hosted complexity, no alerting |
| Helicone | Proxy-based (adds latency), OpenAI-only, no traces |
| Datadog LLM | $3K+/month, enterprise complexity |

**Vantra's position:** Framework-agnostic, 3-line setup, anomaly alerting built in, priced for startups not enterprises.

---

## Python SDK

```bash
pip install vantra
```

```python
import vantra

vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message: str):
    # your existing agent code — untouched
    return agent.run(message)
```

Auto-patches OpenAI and Anthropic on `init()`. Zero changes to your agent logic.

### Manual spans

```python
with vantra.span("search_web", kind="tool") as span:
    results = search(query)
    span.set_output(results)
```

### SDK options

| Option | Default | Description |
|---|---|---|
| `api_key` | required | Your `van_live_...` key from Settings |
| `project` | required | Project name shown in dashboard |
| `patch_openai` | `True` | Auto-instrument OpenAI calls |
| `patch_anthropic` | `True` | Auto-instrument Anthropic calls |
| `enabled` | `True` | Set `False` to disable in tests |

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 App Router, TypeScript, Tailwind | Fast, full-stack, easy deploy |
| Database | Supabase (Postgres) | Auth + DB in one, generous free tier |
| Auth | Supabase OAuth (GitHub + Google) | No password management |
| Payments | Stripe | Industry standard, webhook-based plan sync |
| Email | Resend | Transactional email for alerts + auth |
| Hosting | Vercel | Zero-config deploys from git |
| Cron | cron-job.org | Free, Vercel free tier only allows daily crons |
| SDK | Python (vantra on PyPI) | Target audience is Python AI devs |

---

## Project structure

```
vantra/
├── app/
│   ├── (auth)/login/          # GitHub + Google OAuth login
│   ├── (dashboard)/
│   │   ├── dashboard/         # Overview, traces, alerts, settings
│   │   └── onboarding/        # Org + project setup after signup
│   ├── docs/                  # Public docs page
│   ├── invite/[token]/        # Team invite accept flow
│   ├── privacy/               # Privacy policy (required for OAuth)
│   ├── terms/                 # Terms of service
│   └── api/
│       ├── v1/ingest/         # SDK ingest (traces + spans)
│       ├── traces/            # Dashboard trace list + detail
│       ├── stats/overview     # 24h stats for dashboard cards
│       ├── stats/chart        # 7-day bucketed data for chart
│       ├── alerts/            # Alert rules CRUD + test endpoint
│       ├── cron/check-alerts/ # Runs every 15min via cron-job.org
│       ├── stripe/checkout    # Create Stripe checkout session
│       ├── stripe/portal      # Stripe billing portal redirect
│       ├── webhooks/stripe/   # Sync plan on subscription changes
│       └── settings/          # API keys + team management
├── components/
│   ├── nav.tsx                # Landing page nav with mobile hamburger
│   ├── trace-waterfall.tsx    # Main trace visualization component
│   ├── code-block.tsx         # Syntax-highlighted code with copy
│   └── scroll-reveal.tsx      # Intersection Observer fade-in
├── lib/
│   ├── supabase/              # Browser + server Supabase clients
│   ├── api-keys.ts            # Key generation + SHA-256 hashing
│   ├── alert-email.ts         # Shared HTML email template
│   ├── ingest-auth.ts         # SDK auth via service role key
│   └── stripe.ts              # Stripe client + plan detection
├── sdk/
│   └── python/
│       ├── vantra/            # SDK source
│       │   ├── __init__.py    # trace decorator, span context manager
│       │   ├── _costs.py      # Model cost lookup (prefix-matched)
│       │   └── integrations/
│       │       ├── openai.py  # Patches Completions.create class method
│       │       └── anthropic.py
│       └── tests/
│           └── test_sdk.py    # 63 unit tests
└── supabase/
    └── migrations/            # DB schema (run in order)
```

---

## Database schema (key tables)

| Table | Purpose |
|---|---|
| `orgs` | One per team/company |
| `users` | Auth users with org_id and role |
| `projects` | Named grouping for traces (e.g. "my-agent") |
| `api_keys` | Hashed keys for SDK auth (prefix `van_live_`) |
| `traces` | One row per `@vantra.trace` call |
| `spans` | One row per LLM call / tool use / manual span |
| `alert_rules` | User-defined thresholds (error_rate, latency, cost) |
| `alert_fired` | Dedup record so alerts don't fire repeatedly |
| `invites` | Token-based team invite links |

---

## Key technical decisions

**Why ContextVar for span collection:** Python's `contextvars.ContextVar` gives each trace its own isolated span list without locks, even in async or multi-threaded code. Spans accumulate in `_pending_spans` during the trace, then the trace is POSTed first, spans second — guaranteeing the trace exists in DB before foreign key references.

**Why patch the class method not the instance:** `openai.resources.chat.completions.Completions.create` is patched at the class level so all client instances (`client = OpenAI()`) are intercepted without the user changing any call sites.

**Why cron-job.org not Vercel cron:** Vercel free plan only supports daily crons. cron-job.org is free and supports any interval. Calls `/api/cron/check-alerts` with `Authorization: Bearer <CRON_SECRET>`.

**Cost prefix matching:** Model costs are sorted by key length descending before prefix matching, so `gpt-4o-mini` matches before `gpt-4o`.

---

## Local development

```bash
git clone <repo>
cd vantra
npm install
cp .env.local.example .env.local
# fill in env vars (see below)
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_TEAM=price_...

RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://vantra.dev
CRON_SECRET=<random string>

VANTRA_API_KEY=van_live_...   # your own key for test scripts
```

### Run SDK tests

```bash
cd sdk/python
pip install pytest httpx openai
pytest tests/ -v
```

---

## Deployment

Deployed on Vercel. Every push to `main` auto-deploys.

```bash
git push origin main
```

**Stripe webhook:** `https://vantra.dev/api/webhooks/stripe`
Events: `customer.subscription.updated`, `customer.subscription.deleted`

**Alert cron:** Set up at cron-job.org to call `https://vantra.dev/api/cron/check-alerts` every 15 minutes with `Authorization: Bearer <CRON_SECRET>`.

---

## Roadmap

- [ ] TypeScript/Node.js SDK (npm)
- [ ] Trace search and filtering
- [ ] Model cost comparison view
- [ ] Weekly digest email (cost/error summary)
- [ ] Usage-based billing (pay per span over limit)
- [ ] Slack alerts (Team plan)
- [ ] Public status page
