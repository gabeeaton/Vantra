'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip } from '@/components/tooltip'

interface Alert {
  id: string
  name: string
  metric: string
  threshold: number
  window_minutes: number
  email_recipients: string[]
  enabled: boolean
  created_at: string
  projects: { name: string } | null
}

const METRICS = [
  { value: 'error_rate', label: 'Error rate', unit: '%', description: 'Alert when error % exceeds threshold' },
  { value: 'p95_latency', label: 'P95 latency', unit: 'ms', description: 'Alert when p95 latency exceeds threshold' },
  { value: 'cost_per_hour', label: 'Hourly cost', unit: '$', description: 'Alert when hourly AI cost exceeds threshold' },
  { value: 'daily_budget', label: 'Daily budget', unit: '$', description: 'Alert when total spend today exceeds this amount (resets at midnight UTC)' },
  { value: 'agent_loop', label: 'Agent loop', unit: 'spans', description: 'Alert when any single trace exceeds this many spans (runaway loop detection)' },
  { value: 'eval_score', label: 'Eval score', unit: '%', description: 'Alert when thumbs-up rate on recently rated traces falls below this threshold (min 5 ratings required)' },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', metric: 'error_rate', threshold: '', email: '', slack: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === 'true'

  useEffect(() => {
    if (isDemo) {
      fetch('/api/demo').then(r => r.json()).then(d => { setAlerts(d.alerts ?? []); setFetching(false) })
      return
    }
    fetch('/api/alerts').then(r => r.json()).then(d => { setAlerts(d.alerts ?? []); setFetching(false) })
  }, [isDemo])

  async function createAlert() {
    if (!form.name || !form.threshold || !form.email) return
    setLoading(true)
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        metric: form.metric,
        threshold: parseFloat(form.threshold),
        email_recipients: [form.email],
        slack_webhook_url: form.slack || null,
      }),
    })
    const data = await res.json()
    if (data.alert) {
      setAlerts([data.alert, ...alerts])
      setShowForm(false)
      setForm({ name: '', metric: 'error_rate', threshold: '', email: '', slack: '' })
    }
    setLoading(false)
  }

  function toggleAlert(id: string, enabled: boolean) {
    setAlerts(alerts.map(a => a.id === id ? { ...a, enabled } : a))
    fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, enabled }),
    })
  }

  async function deleteAlert(id: string) {
    await fetch('/api/alerts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAlerts(alerts.filter(a => a.id !== id))
  }

  const selectedMetric = METRICS.find(m => m.value === form.metric)

  return (
    <div className="space-y-8 animate-fade-up max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Alerts</h1>
          <p className="text-zinc-600 text-sm mt-0.5">Get notified before your users do</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea]"
        >
          + New alert
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[#0d0d0d] border border-[#4DE5FC]/20 rounded-xl p-6 space-y-5 animate-fade-up">
          <h3 className="text-white font-semibold">Create alert rule</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Alert name</Label>
              <Input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="High error rate"
                className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30 focus-visible:border-[#4DE5FC]/30"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs gap-0">
                Metric
                <Tooltip content={
                  <div className="space-y-1.5">
                    <p><span className="text-white font-medium">Error rate:</span> % of calls that failed</p>
                    <p><span className="text-white font-medium">P95 latency:</span> slowest 5% of call durations</p>
                    <p><span className="text-white font-medium">Hourly cost:</span> $ spent in the last hour</p>
                    <p><span className="text-white font-medium">Daily budget:</span> $ spent today, resets midnight UTC</p>
                    <p><span className="text-white font-medium">Agent loop:</span> fires when a single trace exceeds the span count threshold</p>
                    <p><span className="text-white font-medium">Eval score:</span> fires when thumbs-up rate falls below threshold (reversed — fires below, not above)</p>
                  </div>
                } />
              </Label>
              <select
                value={form.metric}
                onChange={e => setForm({ ...form, metric: e.target.value })}
                className="w-full bg-black border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4DE5FC]/30"
              >
                {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Threshold ({selectedMetric?.unit})</Label>
              <Input
                value={form.threshold}
                onChange={e => setForm({ ...form, threshold: e.target.value })}
                placeholder={
                  form.metric === 'error_rate' ? '10' :
                  form.metric === 'p95_latency' ? '5000' :
                  form.metric === 'daily_budget' ? '5.00' :
                  form.metric === 'agent_loop' ? '50' :
                  form.metric === 'eval_score' ? '70' :
                  '1.00'
                }
                type="number"
                className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30"
              />
              <p className="text-zinc-700 text-xs">{selectedMetric?.description}</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs">Email recipient</Label>
              <Input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                type="email"
                className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <Label className="text-zinc-400 text-xs">Slack webhook URL <span className="text-zinc-600">(optional)</span></Label>
              <Input
                value={form.slack}
                onChange={e => setForm({ ...form, slack: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-black border-white/10 text-white placeholder:text-zinc-700 focus-visible:ring-[#4DE5FC]/30"
              />
              <p className="text-zinc-700 text-xs">Create one at api.slack.com/apps → Incoming Webhooks</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={createAlert}
              disabled={loading || !form.name || !form.threshold || !form.email}
              className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea]"
            >
              {loading ? 'Creating...' : 'Create alert'}
            </Button>
            <Button
              onClick={() => setShowForm(false)}
              variant="outline"
              className="border-white/10 text-zinc-400 hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl overflow-hidden glow-card">
        {fetching ? (
          <div className="divide-y divide-white/[0.03]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-5 skeleton-shimmer rounded-full" />
                <div>
                  <div className="h-4 w-32 skeleton-shimmer rounded mb-1.5" />
                  <div className="h-3 w-48 skeleton-shimmer rounded" />
                </div>
                <div className="ml-auto h-5 w-14 skeleton-shimmer rounded-full" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto">
              <span className="text-yellow-400 text-xl">◈</span>
            </div>
            <div>
              <p className="text-white font-medium">No alerts configured</p>
              <p className="text-zinc-600 text-sm mt-1">Create an alert to get notified when something breaks</p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#4DE5FC] text-black font-semibold hover:bg-[#3dd4ea] text-sm"
            >
              Create your first alert
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {alerts.map(alert => {
              const metric = METRICS.find(m => m.value === alert.metric)
              return (
                <div key={alert.id} className="px-6 py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    {/* Toggle */}
                    <button
                      onClick={() => toggleAlert(alert.id, !alert.enabled)}
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${alert.enabled ? 'bg-[#4DE5FC]' : 'bg-zinc-800'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${alert.enabled ? 'translate-x-[20px]' : 'translate-x-0'}`} />
                    </button>

                    <div>
                      <p className="text-white text-sm font-medium">{alert.name}</p>
                      <p className="text-zinc-600 text-xs mt-0.5">
                        {metric?.label} {alert.metric === 'eval_score' ? '<' : '>'} {alert.threshold}{metric?.unit}
                        {alert.metric !== 'daily_budget' && ` · every ${alert.window_minutes}min`}
                        {' · '}{alert.email_recipients?.[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${alert.enabled ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-zinc-600 bg-zinc-800 border-zinc-700'}`}>
                      {alert.enabled ? 'Active' : 'Paused'}
                    </span>
                    {process.env.NODE_ENV === 'development' && (
                      <button
                        onClick={() => fetch(`/api/alerts/${alert.id}/test`, { method: 'POST' })}
                        className="text-zinc-600 hover:text-[#4DE5FC] transition-colors text-xs"
                      >
                        Test
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors text-xs opacity-0 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-[#0d0d0d] border border-white/5 rounded-xl p-5 flex gap-4">
        <span className="text-[#4DE5FC] text-lg flex-shrink-0">◎</span>
        <div>
          <p className="text-white text-sm font-medium mb-1">How alerts work</p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            Vantra checks your metrics every 15 minutes against a rolling window (default 15 min).
            When a threshold is breached, you get an email and/or Slack message instantly. No spam — alerts are rate-limited to once per hour per rule.
          </p>
        </div>
      </div>
    </div>
  )
}
