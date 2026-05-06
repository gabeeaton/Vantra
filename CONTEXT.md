# Vantra — Full Context File

> This file is the single source of truth for any AI assistant working on this codebase.
> It covers what the product is, why it exists, how it's built, business context, and where it's going.
> Read this before touching any code.

---

## What Vantra Is

Vantra is a B2B SaaS observability platform for AI agents. It gives engineers full visibility into what their AI agents do in production — every LLM call, tool invocation, branching decision, cost, and error.

The product is:
1. **An SDK** (Python, soon TypeScript) that instruments AI agents with 3 lines of code
2. **A web dashboard** that displays traces, costs, errors, and anomalies
3. **An alerting system** that emails engineers when something breaks before users notice

The core aha moment: engineer adds 3 lines of code, runs their agent once, opens the dashboard, and immediately sees the exact tool call that caused a 3x latency spike. No debugging. No guessing.

---

## The Problem Being Solved

Engineers building AI agents — customer support bots, sales agents, document processors, coding assistants — have zero visibility into what those agents do in production. When an agent fails (hallucinating, looping, making wrong tool calls, running up a $200 OpenAI bill), engineers find out from angry users or a surprise invoice, not a dashboard.

Existing tools either:
- Are locked to one framework (LangSmith requires LangChain)
- Require self-hosting with heavy DevOps (Langfuse open source)
- Are outrageously expensive (Datadog LLM, $3K+/month)
- Add latency via proxy architecture (Helicone)
- Are built for ML researchers, not product engineers (Arize Phoenix)

Vantra's wedge: framework-agnostic, 3-line setup, anomaly alerting out of the box, priced for startups.

---

## Who the Customer Is

**Primary buyer:** The engineer at a startup who built an AI agent for their product and has no idea why it's slow or failing in production. They have a company card. $79/month is trivial if it saves them 2 hours of debugging per week.

**Secondary buyer:** The startup itself — once one engineer adopts Vantra, the team upgrades to the Team plan ($299/month).

**Not the target:** Hobbyists, researchers, or anyone building agents for fun. They won't pay.

**Acquisition strategy:** The Sentry playbook — free tier for individual devs, they evangelize inside their company, the company upgrades to a paid team plan. DM engineers at AI startups directly. Don't pitch — get them using it, then charge after they've found one real bug with it.

---

## Positioning

**"Sentry for AI agents."**

Sentry won because it's dead simple, language-agnostic, and alerts you before users complain. Same exact playbook. The comparison immediately clicks for any engineer who has used Sentry (which is everyone).

---

## Competitors

| Tool | Problem |
|---|---|
| LangSmith | LangChain-first, feels heavy, $39/user/month gets expensive fast |
| Langfuse | Open source and solid, but self-host burden and no anomaly alerting. Cloud version is improving. |
| Helicone | Proxy-based (adds latency to every LLM call), limited agent-specific views |
| Datadog LLM | Great if you already pay $3K/month for Datadog. Nobody else. |
| Arize Phoenix | ML-team focused, too academic for product engineers |

**The window:** The space is getting crowded. Langfuse launched cloud hosting. Every major observability vendor is shipping LLM tracing features. The window to establish a wedge is ~12-18 months. Speed matters.

---

## Pricing

| Plan | Price | Spans/mo | Projects | Retention | Alerts | Seats |
|---|---|---|---|---|---|---|
| Free | $0 | 10K | 1 | 7 days | — | 1 |
| Pro | $79/mo | 1M | 10 | 30 days | Email | 1 |
| Team | $299/mo | 10M | Unlimited | 90 days | Email + Slack | 5 |
| Enterprise | Custom | Unlimited | Unlimited | Custom | Custom | Unlimited |

**Rationale:** $79 is below the "expense without approval" threshold at most startups. $299/team is a no-brainer vs. the cost of one production incident. Enterprise ($999+/year) only needs a handful of customers to generate real revenue. $29 was too cheap — that's consumer pricing, not B2B.

**Stripe:** Billing is via Stripe. Products and Price objects need to be created in Stripe dashboard and IDs pasted into env vars (`STRIPE_PRICE_PRO`, `STRIPE_PRICE_TEAM`). Stripe Billing Portal handles plan management — no custom billing UI needed.

---

## Tech Stack

### Why this stack
Chosen for: $0 hosting until real revenue, everything Claude Code knows well, generous free tiers, no DevOps required.

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 16 (App Router) | Full-stack, one repo, Vercel deploys instantly |
| Styling | Tailwind CSS v4 + shadcn/ui | Fast, looks professional |
| Database | Supabase (Postgres) | Free tier, built-in auth, RLS for multi-tenancy |
| Auth | Supabase GitHub OAuth | Natural for developer audience |
| Hosting | Vercel | Zero-config deploys, free tier |
| Payments | Stripe | Standard, developer-friendly |
| Email | Resend | Best DX for transactional email |
| SDK (Python) | PyPI package `vantra` | `pip install vantra` |
| SDK (TS) | npm package `vantra` (not yet built) | `npm install vantra` |

### Next.js version note
**This is Next.js 16, not 14 or 15.** Breaking changes from prior versions:
- `middleware.ts` is now `proxy.ts` with a `proxy` named export (not `middleware`)
- App Router conventions are otherwise similar to 15

### Font
Inter (not Geist). Loaded via `next/font/google`. Variable: `--font-inter`.

---

## Database Schema

All tables live in Supabase Postgres. Row Level Security (RLS) is enabled on all tables. The `org_id` column on every table is the multi-tenancy key.

```
organizations     — one per company. has stripe_customer_id, plan, slug
users             — references auth.users. has org_id, role (owner|member)
api_keys          — hashed API keys for SDK auth. never store plaintext
projects          — one org can have many projects (e.g. different agents)
traces            — one trace = one agent run. has duration, status, cost
spans             — one span = one step within a trace (LLM call, tool call, etc.)
alert_rules       — configurable thresholds per org/project
```

### Key schema notes
- API keys are stored hashed (SHA-256). The raw key is shown once at creation and never stored.
- Spans support nesting via `parent_span_id` (self-referential FK).
- The `users` RLS policy uses `id = auth.uid()` directly — NOT a subquery on the users table, which would cause infinite recursion.
- The ingest endpoints use the Supabase **service role** key (bypasses RLS) because SDK calls have no user session.
- Input/output JSON on spans is truncated to 2000 chars to prevent Postgres bloat.

### RLS policy pattern
```sql
-- All tables except users:
create policy "org_isolation" on <table>
  for all using (org_id = (select org_id from users where id = auth.uid()));

-- Users table specifically (no self-reference):
create policy "org_isolation" on users
  for all using (id = auth.uid());
```

---

## File Structure

```
vantra/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx          — GitHub OAuth login (split-panel design)
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          — sidebar nav with logo, user email
│   │   │   ├── loading.tsx         — skeleton loader (fixes perceived slowness)
│   │   │   ├── page.tsx            — overview: 4 stat cards + recent traces
│   │   │   ├── traces/
│   │   │   │   ├── loading.tsx     — skeleton loader
│   │   │   │   ├── page.tsx        — paginated trace list with status filter
│   │   │   │   └── [id]/page.tsx   — trace detail: waterfall view
│   │   │   ├── alerts/page.tsx     — create/manage alert rules
│   │   │   └── settings/page.tsx   — API keys, plan display, quick start
│   │   └── onboarding/page.tsx     — create org + project + show API key
│   ├── api/
│   │   ├── v1/ingest/
│   │   │   ├── traces/route.ts     — receives trace events from SDK
│   │   │   └── spans/route.ts      — receives batched spans from SDK
│   │   ├── traces/route.ts         — dashboard: list traces
│   │   ├── traces/[id]/route.ts    — dashboard: single trace + spans
│   │   ├── stats/overview/route.ts — dashboard: 4 summary stats
│   │   ├── alerts/route.ts         — CRUD for alert rules
│   │   ├── settings/api-keys/route.ts — CRUD for API keys
│   │   ├── onboarding/route.ts     — creates org, user, project, first API key
│   │   └── webhooks/stripe/        — (stub) Stripe webhook handler
│   ├── auth/callback/route.ts      — Supabase OAuth callback
│   ├── layout.tsx                  — root layout: Inter font, dark bg
│   ├── page.tsx                    — landing page (logged-out home)
│   └── globals.css                 — Tailwind + custom animations
├── components/
│   ├── trace-waterfall.tsx         — THE main UI: nested span timeline
│   └── ui/                         — shadcn components
├── lib/
│   ├── supabase/
│   │   ├── client.ts               — browser client (createBrowserClient)
│   │   └── server.ts               — server client + admin client
│   ├── api-keys.ts                 — generateApiKey(), hashApiKey()
│   └── ingest-auth.ts              — resolveApiKey() for ingest routes
├── sdk/
│   └── python/vantra/
│       ├── __init__.py             — init(), @trace, span() context manager
│       ├── _costs.py               — LLM cost lookup table (prefix matching)
│       └── integrations/
│           ├── openai.py           — monkey-patches openai.chat.completions.create
│           └── anthropic.py        — monkey-patches anthropic.Anthropic.messages.create
├── supabase/
│   └── migrations/001_initial.sql  — full schema + RLS policies
├── proxy.ts                        — Next.js 16 route protection (was middleware.ts)
├── .env.local                      — secrets (never commit)
├── README.md                       — setup guide
└── CONTEXT.md                      — this file
```

---

## Brand & Design

**Colors:**
- Primary accent: `#4DE5FC` (cyan/blue — the "V" in the logo)
- Background: `#000000` / `#080808` / `#0a0a0a` (layered blacks)
- Cards: `#0d0d0d` with `border-white/5`
- Text: white / `zinc-400` / `zinc-600` hierarchy
- Error: `red-400`
- Success: `green-400`
- Warning: `yellow-400`

**Logo:** `/public/logo.jpeg` — used via `next/image` everywhere. The V mark is `#4DE5FC` on black with white elements.

**Font:** Inter (weights 300–900). Variable: `--font-inter`. Mono: Geist Mono for code.

**Animations (defined in globals.css):**
- `animate-fade-up` — page entry animation (opacity + translateY)
- `animate-fade-in` — simple opacity fade
- `animate-glow` — pulsing cyan glow (used on logo)
- `stagger` — cascading delay on child elements
- `glow-card` — subtle cyan border glow on hover
- `skeleton-shimmer` — animated loading placeholder

**Design principles:**
- Dark theme only. Never light mode.
- Everything is `rounded-xl` or `rounded-2xl`. Never sharp corners.
- Tables use `border-white/[0.04]` row dividers, not heavy borders.
- Status badges are pill-shaped with colored bg/border.
- Empty states always have an icon, a headline, a subline, and a CTA.

---

## Python SDK — How It Works

```python
import vantra
vantra.init(api_key="van_live_...", project="my-agent", patch_openai=True, patch_anthropic=True)
```

On `init()`:
1. Stores config in module-level `_config` dict
2. Starts a background daemon thread that flushes the queue every 500ms
3. Monkey-patches `openai.chat.completions.create` and `anthropic.Anthropic.messages.create`

**Queue-based batching:** All events go into a `collections.deque`. The flush thread drains it every 500ms and POSTs to the ingest endpoint. This means:
- SDK never blocks the main thread (critical for latency)
- Network errors are silently swallowed — the customer's agent never crashes due to Vantra

**`@vantra.trace` decorator:** Wraps a function. On call, generates a `trace_id`, records start/end time, catches exceptions, queues a trace event.

**`with vantra.span(...)` context manager:** Yields a `SpanContext` with `set_output()` and `set_tokens()` methods. On exit, queues a span event.

**Cost calculation (`_costs.py`):** Uses prefix matching so `gpt-4o-2024-11-20` correctly matches the `gpt-4o` cost entry. Falls back to `(0.002, 0.002)` per 1K tokens if model is unknown.

**Ingest endpoint URL:** Defaults to `https://vantra.io/api/v1/ingest`. Override with `VANTRA_ENDPOINT` env var (useful for local dev: `http://localhost:3000/api/v1/ingest`).

---

## Ingest API — How It Works

SDK auth uses hashed API keys via the service role (bypasses RLS):

1. SDK sends `Authorization: Bearer van_live_xxx`
2. Ingest route hashes the key with SHA-256
3. Looks up the hash in `api_keys` table using admin client
4. Returns `org_id` for the key
5. Inserts trace/span rows with that `org_id`

Spans support batching — the body can be a single object or an array. The route resolves `trace_id` (client UUID) → DB UUID via a lookup before inserting spans.

Input/output JSON is truncated at 2000 chars server-side to prevent DB bloat.

---

## Authentication Flow

1. User clicks "Continue with GitHub" on `/login`
2. Supabase redirects to GitHub OAuth
3. GitHub redirects to `/auth/callback`
4. Callback exchanges code for session
5. Checks if user has an `org_id` in `users` table
6. If no org → redirect to `/onboarding`
7. If has org → redirect to `/dashboard`

Onboarding flow uses the **service role** (admin client) to bypass RLS when creating the first org/user/project — because the user row doesn't exist yet when the org is being created.

---

## Known Issues & Decisions

| Issue | Decision |
|---|---|
| `users` RLS recursion | Fixed: policy uses `id = auth.uid()` not a subquery |
| Supabase URL had `/rest/v1/` suffix | Fixed in `.env.local` |
| `middleware.ts` deprecated in Next.js 16 | Renamed to `proxy.ts` with `proxy` export |
| Admin client created at module level | Fixed: lazy `getAdminClient()` function to avoid build-time errors |
| SDK blocking main thread | Fixed: background thread + queue, never `httpx.post()` synchronously |
| Trace detail page using `fetch()` to itself | Fixed: now queries Supabase directly as server component |

---

## What's Been Built (Current State)

**Working:**
- GitHub OAuth login
- Onboarding (org + project + API key creation)
- Ingest API (traces + spans, with batching)
- Dashboard overview (stats: traces today, error rate, avg latency, cost)
- Trace list (paginated, filterable by status)
- Trace waterfall (nested spans, timeline bars, expandable input/output, slow-span warnings)
- Settings page (API key CRUD, plan display, quick start)
- Alerts page (create/toggle/delete alert rules)
- Landing page (hero, trace mockup, features, competitor table, pricing, CTA)
- Python SDK (`init`, `@trace`, `span()`, OpenAI + Anthropic auto-patching)
- Skeleton loading states on all dashboard pages
- Full animation system (fade-up, stagger, glow-card, shimmer)
- Logo integrated everywhere

**Not yet built:**
- Stripe billing (price IDs exist in env, checkout flow not wired)
- Resend email (alert emails not actually sending yet)
- TypeScript/JS SDK
- Slack alerts
- Actual anomaly detection cron job
- Team member invites
- Usage enforcement (free tier span limit not enforced)
- Trace search / date range filtering
- Model cost breakdown view
- Weekly digest email
- Docs site

---

## What to Build Next (Priority Order)

1. **Stripe checkout** — pricing page → checkout → webhook → update org plan in DB. Use Stripe Billing Portal for plan management.
2. **Resend email alerts** — wire up the alert rules to actually send emails. Check every 5 minutes via Vercel cron.
3. **Free tier enforcement** — check `spans_this_month` on org before accepting ingest. Return 402 when limit hit.
4. **TypeScript SDK** — port the Python SDK to TypeScript, publish to npm.
5. **Trace search** — add a search input on `/dashboard/traces` that filters by trace name.
6. **Model breakdown view** — a new page showing cost/token breakdown by model. Table: model | calls | tokens | cost | avg latency.
7. **Slack alerts** — add webhook URL field to alert rules. One hour of work, most-requested feature.
8. **Docs site** — single-page Mintlify or Nextra site at `docs.vantra.io`.
9. **Team invites** — invite by email, Supabase Auth handles magic link.
10. **Weekly digest email** — Sunday summary: traces, errors, cost, top expensive agent.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co        # NO trailing /rest/v1/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                          # Never expose client-side

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_PRO=price_xxx                               # $79/mo Price ID
STRIPE_PRICE_TEAM=price_xxx                              # $299/mo Price ID

# Email
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=https://vantra.io                    # http://localhost:3000 in dev
```

---

## Go-To-Market Notes

- **Don't launch publicly before getting 3 paying customers privately.**
- DM engineers at AI startups: "Hey — I saw [company] is building [product]. I'm working on a tool called Vantra that shows you exactly what your AI agents are doing in production. 3-line setup. Would you try it free and give me 15 minutes of feedback?"
- After they find one real bug with it, ask for $79/month.
- Post in AI-focused Slack communities, Discord servers, and X/Twitter.
- The free tier is the acquisition channel. Make it generous enough to get real usage.
- The waterfall trace view is the demo-able aha moment. Lead with that in every sales conversation.

---

## Business Risk Factors

1. **Distribution:** The product works but has no organic distribution yet. This is the main risk.
2. **Langfuse cloud improving:** Their "self-host burden" weakness is shrinking. Need to compete on UI quality and alerting.
3. **Window closing:** Major observability vendors (Datadog, Grafana) are shipping LLM features. 12-18 month window to establish brand.
4. **Solo founder bandwidth:** Many things are stubs (Stripe, Resend, TS SDK). Don't let perfect be the enemy of shipped.

---

## Coding Conventions

- **No comments** unless the WHY is non-obvious.
- **No light mode.** Dark only.
- **Client components** (`'use client'`) for anything with state or browser APIs. Server components for data fetching.
- **Service role** for all writes that happen outside a user session (onboarding, ingest).
- **Never** create the Supabase admin client at module level — always lazily inside a function (avoids build-time env var errors).
- **Truncate** all user-generated content (span inputs/outputs) at 2000 chars before storing.
- **Batch** SDK events — never one HTTP request per span.
- All API routes return `{ error: string }` on failure with appropriate HTTP status codes.
- Use `next/image` for all images.
- Form states: `loading` boolean, `error` string, optimistic UI where possible.
