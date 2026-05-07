'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Input } from '@/components/ui/input'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'org' | 'key'>('org')
  const [orgName, setOrgName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useState<'python' | 'typescript'>('python')
  const [copied, setCopied] = useState(false)

  async function createOrg() {
    if (!orgName.trim() || !projectName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName: orgName.trim(), projectName: projectName.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Something went wrong')
      setLoading(false)
    } else {
      setApiKey(data.apiKey)
      setStep('key')
      setLoading(false)
    }
  }

  function copyKey() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pythonCode = `pip install vantra

import vantra
vantra.init(api_key="${apiKey}", project="${projectName}")

@vantra.trace
def run_agent(message: str):
    # your existing code — untouched
    pass`

  const tsCode = `npm install vantra-sdk

import { init, trace } from 'vantra-sdk'

init({ apiKey: '${apiKey}', project: '${projectName}' })

const runAgent = trace(async function runAgent(message: string) {
  // your existing code — untouched
})`

  if (step === 'key') {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 font-[family-name:var(--font-inter)]">
        <div className="w-full max-w-lg space-y-5 page-enter">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-1 rounded-full bg-[#4DE5FC]/40" />
            <div className="w-6 h-1 rounded-full bg-[#4DE5FC]" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-white">You're set up.</h1>
            <p className="text-zinc-500 text-sm">Save your API key — it won't be shown again.</p>
          </div>

          {/* API key */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 space-y-3 glow-card">
            <p className="text-zinc-600 text-xs font-medium uppercase tracking-wider">API Key</p>
            <div
              onClick={copyKey}
              className="bg-black rounded-lg px-4 py-3 font-mono text-sm text-[#4DE5FC] break-all border border-white/5 cursor-pointer hover:border-[#4DE5FC]/20 transition-colors select-all"
            >
              {apiKey}
            </div>
            <button
              onClick={copyKey}
              className={`w-full py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                copied
                  ? 'border-green-400/30 text-green-400 bg-green-400/5'
                  : 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>

          {/* Quick start */}
          <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 space-y-4 glow-card">
            <div className="flex items-center justify-between">
              <p className="text-zinc-400 text-sm font-medium">Quick start</p>
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
                {(['python', 'typescript'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`text-xs px-3 py-1 rounded-md transition-colors capitalize ${
                      lang === l ? 'bg-[#4DE5FC]/10 text-[#4DE5FC]' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {l === 'typescript' ? 'TypeScript' : 'Python'}
                  </button>
                ))}
              </div>
            </div>
            <pre className="bg-black rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto border border-white/5 leading-relaxed">
              {lang === 'python' ? pythonCode : tsCode}
            </pre>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 rounded-xl bg-[#4DE5FC] text-black font-semibold text-sm hover:bg-[#3dd4ea] transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 font-[family-name:var(--font-inter)]">
      <div className="w-full max-w-sm space-y-7 page-enter">

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-1 rounded-full bg-[#4DE5FC]" />
          <div className="w-6 h-1 rounded-full bg-white/10" />
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Image src="/logo.jpeg" alt="Vantra" width={36} height={36} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your workspace</h1>
          <p className="text-zinc-500 text-sm">Takes about 30 seconds</p>
        </div>

        <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-6 space-y-5 glow-card">
          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-medium">Organization name</label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createOrg()}
              placeholder="Acme Inc"
              className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/20 focus-visible:border-[#4DE5FC]/30"
            />
            <p className="text-zinc-600 text-xs">Your company or team name</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 text-xs font-medium">First project</label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createOrg()}
              placeholder="my-support-agent"
              className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/20 focus-visible:border-[#4DE5FC]/30"
            />
            <p className="text-zinc-600 text-xs">The AI agent or app you're instrumenting</p>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={createOrg}
            disabled={loading || !orgName.trim() || !projectName.trim()}
            className="w-full py-2.5 rounded-xl bg-[#4DE5FC] text-black font-semibold text-sm hover:bg-[#3dd4ea] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
