# Vantra

Vantra helps developers understand what their AI agents are doing. It brings traces, LLM costs, latency, and errors into one place so problems are easier to find and fix.

**Live:** [vantra.dev](https://vantra.dev) · **Docs:** [vantra.dev/docs](https://vantra.dev/docs)

## What it does

- Shows each step of an agent run in a waterfall trace.
- Tracks token usage, cost, and latency by model and call.
- Lets you search traces and compare prompt versions.
- Alerts you to error, latency, and spending spikes.

## Get started

Vantra has open-source SDKs for Python and TypeScript. They instrument OpenAI and Anthropic calls without routing requests through a proxy.

### Python

```bash
pip install vantra
```

```python
import vantra

vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message: str):
    return agent.run(message)
```

### TypeScript

```bash
npm install vantra-sdk
```

```typescript
import { init, trace } from 'vantra-sdk'

init({ apiKey: 'van_live_...', project: 'my-agent' })

const runAgent = trace(async function runAgent(message: string) {
  return agent.run(message)
})
```

See the [SDK repository](https://github.com/gabeeaton/vantra-sdk) and [documentation](https://vantra.dev/docs) for streaming, prompt version tags, and manual spans.

## Stack

Next.js, TypeScript, Supabase, Stripe, Resend, and Vercel.
