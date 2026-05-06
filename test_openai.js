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

const vantra = require('./sdk/typescript/dist/index.js')
const { OpenAI } = require('./sdk/typescript/node_modules/openai')

vantra.init({
  apiKey: process.env.VANTRA_API_KEY,
  project: 'test-agent-node',
})

const client = new OpenAI()

const runAgent = vantra.trace(async function runAgent(question) {
  // Step 1: classify — auto-patching captures tokens/cost
  const r1 = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `In one word, what kind of question is this: '${question}'` }],
  })
  const intent = r1.choices[0].message.content
  console.log('Intent:', intent)

  // Step 2: fake retrieval tool span
  await vantra.span('retrieve_context', async (ctx) => {
    await new Promise(r => setTimeout(r, 80))
    ctx.setOutput({ docs: ['France is in Western Europe', 'Paris has been the capital since 987 AD'] })
  }, { kind: 'retrieval' })

  // Step 3: generate final answer — auto-patched
  const r2 = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: question }],
  })
  return r2.choices[0].message.content
})

;(async () => {
  console.log('Running Node.js agent...')
  const result = await runAgent('What is the capital of France?')
  console.log('Agent:', result)
  await new Promise(r => setTimeout(r, 1500))
  console.log('Done — check http://localhost:3000/dashboard/traces')
})()
