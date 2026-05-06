'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
}

interface Member {
  id: string
  email: string
  role: string
  created_at: string
}

interface Invite {
  id: string
  email: string
  created_at: string
  expires_at: string
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [plan, setPlan] = useState<string>('free')
  const [newKeyName, setNewKeyName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [copied, setCopied] = useState(false)
  const [billingLoading, setBillingLoading] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)

  const [justUpgraded, setJustUpgraded] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setJustUpgraded(params.get('upgraded') === 'true')
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/settings/api-keys').then(r => r.json()),
      fetch('/api/settings/team').then(r => r.json()),
    ]).then(([keys, team]) => {
      setKeys(keys.keys ?? [])
      setPlan(keys.plan ?? 'free')
      setMembers(team.members ?? [])
      setInvites(team.invites ?? [])
      setFetching(false)
    })
  }, [])

  async function upgrade(plan: string) {
    setBillingLoading(plan)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setBillingLoading(null)
  }

  async function manageSubscription() {
    setBillingLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setBillingLoading(null)
  }

  async function createKey() {
    if (!newKeyName.trim()) return
    setLoading(true)
    const res = await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName }),
    })
    const data = await res.json()
    setNewKey(data.apiKey)
    setNewKeyName('')
    fetch('/api/settings/api-keys').then(r => r.json()).then(d => setKeys(d.keys ?? []))
    setLoading(false)
  }

  async function deleteKey(id: string) {
    await fetch('/api/settings/api-keys', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setKeys(keys.filter(k => k.id !== id))
  }

  async function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    await fetch('/api/settings/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    setInviteEmail('')
    setInviteSent(true)
    setTimeout(() => setInviteSent(false), 3000)
    fetch('/api/settings/team').then(r => r.json()).then(d => { setMembers(d.members ?? []); setInvites(d.invites ?? []) })
    setInviteLoading(false)
  }

  async function cancelInvite(id: string) {
    await fetch('/api/settings/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setInvites(invites.filter(i => i.id !== id))
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-zinc-600 text-sm mt-0.5">Manage your API keys and account</p>
      </div>

      {/* New key revealed */}
      {newKey && (
        <div className="bg-[#4DE5FC]/5 border border-[#4DE5FC]/20 rounded-xl p-5 space-y-3 animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="text-[#4DE5FC] text-sm font-semibold">New API key created</span>
            <span className="text-zinc-600 text-xs">— copy it now, it won't be shown again</span>
          </div>
          <div className="flex gap-2">
            <code className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#4DE5FC] font-mono break-all">
              {newKey}
            </code>
            <Button
              onClick={copyKey}
              variant="outline"
              className="border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 flex-shrink-0"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      )}

      {/* API Keys section */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden glow-card">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">API Keys</h2>
            <p className="text-zinc-600 text-xs mt-0.5">Used to authenticate SDK requests</p>
          </div>
        </div>

        {/* Create new key */}
        <div className="px-6 py-4 border-b border-white/5 flex gap-3">
          <Input
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createKey()}
            placeholder="Key name (e.g. Production)"
            className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30 focus-visible:border-[#4DE5FC]/30"
          />
          <Button
            onClick={createKey}
            disabled={loading || !newKeyName.trim()}
            className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea] flex-shrink-0"
          >
            {loading ? 'Creating...' : 'Create key'}
          </Button>
        </div>

        {/* Keys list */}
        {fetching ? (
          <div className="divide-y divide-white/[0.04]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="h-4 w-28 skeleton-shimmer rounded mb-1.5" />
                  <div className="h-3 w-40 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="py-10 text-center text-zinc-600 text-sm">No API keys yet</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {keys.map(key => (
              <div key={key.id} className="px-6 py-4 flex items-center justify-between group">
                <div>
                  <p className="text-white text-sm font-medium">{key.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Created {new Date(key.created_at).toLocaleDateString()}
                    {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(key.id)}
                  className="text-zinc-600 hover:text-red-400 transition-colors text-xs"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Billing section */}
      {justUpgraded && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-4 text-green-400 text-sm font-medium animate-fade-up">
          ✓ Plan upgraded successfully. Welcome to the next tier.
        </div>
      )}

      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden glow-card">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Plan</h2>
          <p className="text-zinc-600 text-xs mt-0.5">Your current subscription</p>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {[
            { plan: 'free', label: 'Free', price: '$0', desc: '10K spans/month · 1 project · 7-day retention', current: plan === 'free' },
            { plan: 'pro', label: 'Pro', price: '$79/mo', desc: '1M spans/month · 10 projects · 30-day retention · Email alerts', current: plan === 'pro' },
            { plan: 'team', label: 'Team', price: '$299/mo', desc: '10M spans/month · Unlimited projects · 90-day retention · Slack alerts', current: plan === 'team' },
          ].map((tier) => (
            <div key={tier.plan} className="px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{tier.label}</span>
                  <span className="text-zinc-500 text-xs">{tier.price}</span>
                  {tier.current && (
                    <span className="text-xs bg-[#4DE5FC]/10 text-[#4DE5FC] border border-[#4DE5FC]/20 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                <p className="text-zinc-600 text-xs mt-0.5">{tier.desc}</p>
              </div>
              {!tier.current && (
                <Button
                  onClick={() => tier.plan === 'free' ? manageSubscription() : upgrade(tier.plan)}
                  disabled={billingLoading !== null}
                  className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea] text-xs h-8 px-4"
                >
                  {billingLoading === tier.plan ? 'Redirecting...' : 'Upgrade'}
                </Button>
              )}
              {tier.current && (
                <button
                  onClick={manageSubscription}
                  disabled={billingLoading !== null}
                  className="text-zinc-500 text-xs hover:text-white transition-colors"
                >
                  {billingLoading === 'portal' ? 'Loading...' : 'Manage'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden glow-card">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold text-sm">Team</h2>
            <p className="text-zinc-600 text-xs mt-0.5">Invite teammates to your workspace</p>
          </div>
        </div>

        {/* Invite form */}
        <div className="px-6 py-4 border-b border-white/5 flex gap-3">
          <Input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()}
            placeholder="teammate@company.com"
            type="email"
            className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30 focus-visible:border-[#4DE5FC]/30"
          />
          <Button
            onClick={sendInvite}
            disabled={inviteLoading || !inviteEmail.trim()}
            className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea] flex-shrink-0"
          >
            {inviteSent ? '✓ Sent' : inviteLoading ? 'Sending...' : 'Invite'}
          </Button>
        </div>

        {/* Members */}
        {fetching ? (
          <div className="divide-y divide-white/[0.04]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full skeleton-shimmer" />
                <div className="h-4 w-40 skeleton-shimmer rounded" />
                <div className="ml-auto h-4 w-12 skeleton-shimmer rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {members.map(m => (
              <div key={m.id} className="px-6 py-3.5 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#4DE5FC]/10 border border-[#4DE5FC]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4DE5FC] text-xs font-bold">{m.email?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-white text-sm">{m.email}</p>
                <span className="ml-auto text-xs text-zinc-600 capitalize">{m.role}</span>
              </div>
            ))}
            {invites.map(inv => (
              <div key={inv.id} className="px-6 py-3.5 flex items-center gap-3 group">
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-zinc-500 text-xs font-bold">{inv.email?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-zinc-400 text-sm">{inv.email}</p>
                <span className="text-xs text-zinc-600 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full ml-1">Pending</span>
                <button
                  onClick={() => cancelInvite(inv.id)}
                  className="ml-auto text-zinc-700 hover:text-red-400 transition-colors text-xs"
                >
                  Cancel
                </button>
              </div>
            ))}
            {members.length === 0 && invites.length === 0 && (
              <div className="py-8 text-center text-zinc-600 text-sm">Only you so far — invite your team</div>
            )}
          </div>
        )}
      </div>

      {/* Quick start */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden glow-card">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Quick start</h2>
        </div>
        <div className="px-6 py-5">
          <pre className="bg-black border border-white/5 rounded-lg p-4 text-xs text-zinc-400 overflow-x-auto font-mono leading-relaxed">
{`pip install vantra

import vantra
vantra.init(api_key="van_live_...", project="my-agent")

@vantra.trace
def run_agent(message: str):
    # your agent code — untouched
    return agent.run(message)`}
          </pre>
        </div>
      </div>
    </div>
  )
}
