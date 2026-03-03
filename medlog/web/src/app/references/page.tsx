'use client'

import { useEffect, useState } from 'react'
import { 
  Mail, 
  Plus, 
  Loader2, 
  FileText, 
  CheckCircle, 
  XCircle,
  Trash2,
  Send,
  User
} from 'lucide-react'

interface ReferenceRequest {
  id: string
  resident_id: string
  requester_id: string
  recipient_email: string
  recipient_name: string
  status: 'pending' | 'submitted' | 'declined'
  letter_content: string
  submitted_at: string
  created_at: string
  resident_name?: string
  requester_name?: string
}

export default function ReferencesPage() {
  const [requests, setRequests] = useState<ReferenceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [role, setRole] = useState<string>('')

  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_email: '',
    resident_id: ''
  })

  const [residents, setResidents] = useState<{ id: string; full_name: string }[]>([])

  useEffect(() => {
    fetchReferences()
    fetchRole()
  }, [])

  const fetchRole = async () => {
    try {
      const response = await fetch('/api/auth/user', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setRole(data.profile?.role || '')
      }
    } catch (error) {
      console.error('Failed to fetch role:', error)
    }
  }

  const fetchReferences = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/references', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to fetch references:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResidents = async () => {
    try {
      const response = await fetch('/api/institution/residents', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setResidents(data.residents || [])
      }
    } catch (error) {
      console.error('Failed to fetch residents:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await fetch('/api/references', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          request: formData
        })
      })
      setShowForm(false)
      setFormData({ recipient_name: '', recipient_email: '', resident_id: '' })
      fetchReferences()
    } catch (error) {
      console.error('Failed to create reference request:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reference request?')) return

    try {
      await fetch('/api/references', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', request: { id } })
      })
      fetchReferences()
    } catch (error) {
      console.error('Failed to delete reference:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reference Letters</h1>
          <p className="text-gray-600">Request and manage reference letters</p>
        </div>
        {role !== 'resident' && (
          <button
            onClick={() => { setShowForm(true); fetchResidents(); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Request Reference
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">New Reference Request</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resident</label>
              <select
                value={formData.resident_id}
                onChange={(e) => setFormData({ ...formData, resident_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">Select resident...</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referee Name</label>
              <input
                type="text"
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="Dr. John Smith"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Referee Email</label>
              <input
                type="email"
                value={formData.recipient_email}
                onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                placeholder="john.smith@hospital.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
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
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Request
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reference requests</p>
            <p className="text-sm">Reference requests will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((req) => (
              <div key={req.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      req.status === 'submitted' ? 'bg-green-100' : 
                      req.status === 'declined' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {req.status === 'submitted' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : req.status === 'declined' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Mail className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {req.recipient_name || req.recipient_email}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {role === 'resident' ? `Requested by ${req.requester_name}` : `For ${req.resident_name}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'submitted' ? 'bg-green-100 text-green-700' :
                      req.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {req.letter_content && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">{req.letter_content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
