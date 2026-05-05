# Vantra

Observability for AI agents. See every LLM call, tool invocation, latency spike, and cost — in real time.

## What it does

Engineers building AI agents have no visibility into what their agents actually do in production. When an agent fails — hallucinating, looping, making wrong tool calls — they find out from angry users, not dashboards.

Vantra fixes that. Add 3 lines of code to any Python agent and instantly get:

- **Waterfall traces** — every step of every agent run, nested and timed
- **Cost tracking** — per call, per model, per day
- **Anomaly alerts** — email when error rate spikes, latency blows up, or cost goes off the rails
- **Works with anything** — OpenAI, Anthropic, LangChain, custom agents

## Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Database | Supabase (Postgres + Auth) |
| Auth | Supabase GitHub OAuth |
| Payments | Stripe |
| Email | Resend |
| Hosting | Vercel |
| SDK | Python (PyPI), TypeScript (npm) |

## Getting started

### 1. Clone and install

```bash
git clone <repo>
cd vantra
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:

```bash
# Copy and run the contents of:
supabase/migrations/001_initial.sql
```

3. Enable GitHub OAuth: **Authentication → Providers → GitHub**
   - Create a GitHub OAuth app at github.com/settings/developers
   - Callback URL: `https://<your-project>.supabase.co/auth/v1/callback`
   - Paste Client ID + Secret into Supabase

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_TEAM=price_xxx

RESEND_API_KEY=re_...

NEXT_PUBLIC_APP_URL=https://vantra.io
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
| `api_key` | required | Your `van_live_...` key |
| `project` | required | Project name in dashboard |
| `patch_openai` | `True` | Auto-instrument OpenAI calls |
| `patch_anthropic` | `True` | Auto-instrument Anthropic calls |

---

## Pricing

| Plan | Price | Spans | Projects | Retention |
|---|---|---|---|---|
| Free | $0 | 10K/mo | 1 | 7 days |
| Pro | $79/mo | 1M/mo | 10 | 30 days |
| Team | $299/mo | 10M/mo | Unlimited | 90 days |
| Enterprise | Custom | Unlimited | Unlimited | Custom |

---

## Project structure

```
vantra/
├── app/
│   ├── (auth)/login/          # GitHub OAuth login
│   ├── (dashboard)/
│   │   ├── dashboard/         # Overview, traces, alerts, settings
│   │   └── onboarding/        # Org + project setup
│   └── api/
│       ├── v1/ingest/         # SDK ingest endpoints
│       ├── traces/            # Dashboard trace API
│       ├── stats/             # Overview stats
│       ├── alerts/            # Alert rules CRUD
│       └── settings/          # API key management
├── components/
│   └── trace-waterfall.tsx    # The main visualization
├── lib/
│   ├── supabase/              # Browser + server clients
│   ├── api-keys.ts            # Key generation + hashing
│   └── ingest-auth.ts         # SDK auth via service role
├── sdk/
│   └── python/vantra/         # Python SDK source
└── supabase/
    └── migrations/            # Database schema
```

---

## Ingest API

The SDK posts to these endpoints. You can also call them directly.

```
POST /api/v1/ingest/traces
POST /api/v1/ingest/spans
Authorization: Bearer van_live_...
```

Spans support batching — send an array to reduce HTTP overhead.

---

## Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Stripe webhooks

Point your Stripe webhook to `https://vantra.io/api/webhooks/stripe` and enable the `customer.subscription.updated` and `customer.subscription.deleted` events.

---

## Competitors

| Tool | Problem |
|---|---|
| LangSmith | LangChain-first, $39/user/month |
| Langfuse | No anomaly alerting |
| Helicone | Proxy-based (adds latency) |
| Datadog LLM | $3K+/month |

**Vantra's wedge:** framework-agnostic, 3-line setup, anomaly alerting out of the box, priced for startups.

---

## Roadmap

- [ ] Slack alerts
- [ ] TypeScript SDK (npm)
- [ ] Model cost comparison view
- [ ] Trace search and filtering
- [ ] Weekly digest email
- [ ] Team member invites
- [ ] Usage-based billing
# Vantra
