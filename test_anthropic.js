const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...rest] = trimmed.split('=')
      process.env[k.trim()] ??= rest.join('=').trim()
    }
  }
}

process.env.VANTRA_ENDPOINT ??= 'http://localhost:3000/api/v1/ingest'

// ─── Mock the 'anthropic' module before vantra loads it ────────────────────
const { Anthropic } = require('./sdk/typescript/node_modules/@anthropic-ai/sdk')

// Intercept Messages.prototype.create with a fake response (no API key needed)
const useRealApi = !!process.env.ANTHROPIC_API_KEY
if (!useRealApi) {
  console.log('No ANTHROPIC_API_KEY — running with mocked responses\n')
  const original = Anthropic.Messages.prototype.create
  Anthropic.Messages.prototype.create = async function (kwargs) {
    await new Promise(r => setTimeout(r, 120)) // simulate latency
    return {
      id: 'msg_mock',
      model: kwargs.model,
      content: [{ type: 'text', text: 'The capital of France is Paris.' }],
      usage: { input_tokens: 14, output_tokens: 9 },
      stop_reason: 'end_turn',
    }
  }
}

// Inject mock into require cache under both names vantra might try
const sdkPath = require.resolve('./sdk/typescript/node_modules/@anthropic-ai/sdk')
const sdkCache = require.cache[sdkPath]
require.cache['anthropic'] = sdkCache
try {
  require.cache[require.resolve('anthropic')] = sdkCache
} catch { /* anthropic not resolvable — @anthropic-ai/sdk fallback will be used */ }

// ─── Now init vantra ────────────────────────────────────────────────────────
const vantra = require('./sdk/typescript/dist/index.js')

vantra.init({
  apiKey: process.env.VANTRA_API_KEY,
  project: 'test-agent-anthropic',
})

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? 'mock' })

const runAgent = vantra.trace(async function runAgent(question) {
  // Step 1: classify
  const r1 = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 20,
    messages: [{ role: 'user', content: `In one word, what kind of question is this: '${question}'` }],
  })
  const intent = r1.content[0].text
  console.log('Intent:', intent)

  // Step 2: retrieval span
  await vantra.span('retrieve_context', async (ctx) => {
    await new Promise(r => setTimeout(r, 80))
    ctx.setOutput({ docs: ['France is in Western Europe', 'Paris has been the capital since 987 AD'] })
  }, { kind: 'retrieval' })

  // Step 3: final answer
  const r2 = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{ role: 'user', content: question }],
  })
  return r2.content[0].text
})

;(async () => {
  console.log('Running Anthropic agent...')
  const result = await runAgent('What is the capital of France?')
  console.log('Agent:', result)
  await new Promise(r => setTimeout(r, 1500))
  console.log('Done — check http://localhost:3000/dashboard/traces')
})()
