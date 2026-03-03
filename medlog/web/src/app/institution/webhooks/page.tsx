'use client'

import { useEffect, useState } from 'react'
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Play, 
  Loader2,
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface Webhook {
  id: string
  url: string
  events: string[]
  secret: string
  is_active: boolean
  created_at: string
}

const availableEvents = [
  { value: 'case.created', label: 'Case Created' },
  { value: 'case.updated', label: 'Case Updated' },
  { value: 'case.verified', label: 'Case Verified' },
  { value: 'user.invited', label: 'User Invited' },
  { value: 'user.joined', label: 'User Joined' },
  { value: 'milestone.completed', label: 'Milestone Completed' },
  { value: 'subscription.updated', label: 'Subscription Updated' },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [newWebhook, setNewWebhook] = useState<{ id: string; secret: string } | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    url: '',
    events: [] as string[]
  })

  useEffect(() => {
    fetchWebhooks()
  }, [])

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/institution/webhooks', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setWebhooks(data.webhooks || [])
      }
    } catch (error) {
      console.error('Failed to fetch webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/institution/webhooks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          webhook: formData
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNewWebhook({ id: data.webhook.id, secret: data.webhook.secret })
        fetchWebhooks()
        setShowForm(false)
        setFormData({ url: '', events: [] })
      }
    } catch (error) {
      console.error('Failed to create webhook:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await fetch('/api/institution/webhooks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', webhook: { id } })
      })
      fetchWebhooks()
    } catch (error) {
      console.error('Failed to toggle webhook:', error)
    }
  }

  const handleTest = async (id: string) => {
    setTesting(id)
    try {
      const response = await fetch('/api/institution/webhooks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', webhook: { id } })
      })
      const data = await response.json()
      alert(data.success ? 'Test successful! Check your endpoint.' : `Test failed: ${data.error}`)
    } catch (error) {
      alert('Test failed')
    } finally {
      setTesting(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    try {
      await fetch('/api/institution/webhooks', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', webhook: { id } })
      })
      fetchWebhooks()
    } catch (error) {
      console.error('Failed to delete webhook:', error)
    }
  }

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-600">Configure webhooks to receive real-time notifications</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Webhook className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Real-time Notifications</p>
            <p>Webhooks allow your application to receive HTTP POST requests when events occur in MedLog. Use them to integrate with your own backend systems.</p>
          </div>
        </div>
      </div>

      {newWebhook && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-green-800 mb-1">Webhook Created</p>
              <p className="text-sm text-green-700 mb-2">
                Copy the signing secret. You won't see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded border border-green-300 font-mono text-sm">
                  {newWebhook.secret}
                </code>
              </div>
            </div>
            <button
              onClick={() => setNewWebhook(null)}
              className="text-green-700 hover:bg-green-100 p-1 rounded"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          Add Webhook
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Webhook</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endpoint URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://your-server.com/webhook"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEvents.map(event => (
                  <label key={event.value} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                    />
                    <span className="text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Webhook className="h-4 w-4" />}
              Create Webhook
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Webhook className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No webhooks configured</p>
            <p className="text-sm">Add a webhook to receive real-time notifications</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 truncate max-w-xs block">
                      {webhook.url}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(webhook.events) ? webhook.events : JSON.parse(webhook.events || '[]')).map((event: string) => (
                        <span key={event} className="text-xs px-2 py-1 bg-gray-100 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {webhook.is_active ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-500 text-sm">
                        <XCircle className="h-4 w-4" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleTest(webhook.id)}
                      disabled={testing === webhook.id}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      {testing === webhook.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleToggle(webhook.id)}
                      className="text-gray-600 hover:text-gray-800 mr-3"
                    >
                      {webhook.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(webhook.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
