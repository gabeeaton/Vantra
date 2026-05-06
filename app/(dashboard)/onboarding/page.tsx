'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'org' | 'key'>('org')
  const [orgName, setOrgName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    } else {
      setApiKey(data.apiKey)
      setStep('key')
    }
    setLoading(false)
  }

  if (step === 'key') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-full max-w-lg px-4 space-y-8">
          <div className="text-center space-y-2">
            <div className="text-green-400 text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white">Your API key</h1>
            <p className="text-zinc-400 text-sm">Copy this now — it won't be shown again.</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 break-all select-all border border-zinc-800">
              {apiKey}
            </div>
            <Button
              onClick={() => navigator.clipboard.writeText(apiKey)}
              variant="outline"
              className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Copy to clipboard
            </Button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-3">
            <p className="text-zinc-400 text-sm font-medium">Quick start</p>
            <pre className="bg-black rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto border border-zinc-800">{`pip install vantra

import vantra
vantra.init(api_key="${apiKey}", project="${projectName}")

@vantra.trace
def run_agent(message: str):
    # your agent code here
    pass`}</pre>
          </div>

          <Button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-white text-black hover:bg-zinc-100"
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-sm px-4 space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Image src="/logo.jpeg" alt="Vantra" width={40} height={40} className="rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your workspace</h1>
          <p className="text-zinc-400 text-sm">Takes 30 seconds</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-zinc-300">Organization name</Label>
            <Input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Inc"
              className="bg-black border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">First project name</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="my-support-agent"
              className="bg-black border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-zinc-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            onClick={createOrg}
            disabled={loading || !orgName.trim() || !projectName.trim()}
            className="w-full bg-white text-black hover:bg-zinc-100"
          >
            {loading ? 'Creating...' : 'Create workspace'}
          </Button>
        </div>
      </div>
    </div>
  )
}
