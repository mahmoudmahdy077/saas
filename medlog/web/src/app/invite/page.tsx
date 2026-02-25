'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Loader2, 
  CheckCircle,
  XCircle,
  Trash2,
  Send
} from 'lucide-react'

interface Invite {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'rejected'
  role: 'consultant' | 'program_director'
  created_at: string
}

export default function InvitePage() {
  const router = useRouter()
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'consultant' | 'program_director'>('consultant')

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setInvites(data.invites || [])
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendInvite = async () => {
    if (!email) return
    
    setSending(true)
    try {
      const response = await fetch('/api/invites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (response.ok) {
        await fetchInvites()
        setEmail('')
      }
    } catch (error) {
      console.error('Failed to send invite:', error)
    } finally {
      setSending(false)
    }
  }

  const cancelInvite = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invite?')) return

    try {
      const response = await fetch(`/api/invites?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        setInvites(invites.filter(i => i.id !== id))
      }
    } catch (error) {
      console.error('Failed to cancel invite:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
            <Loader2 className="h-3 w-3" /> Pending
          </span>
        )
      case 'accepted':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="h-3 w-3" /> Accepted
          </span>
        )
      case 'rejected':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cases
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Invite Reviewers</h1>
        <p className="text-gray-600">Invite consultants or program directors to verify your cases</p>
      </div>

      {/* Send Invite */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Send New Invite</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="consultant@hospital.com"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="consultant">Consultant</option>
              <option value="program_director">Program Director</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={sendInvite}
              disabled={sending || !email}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Pending & Sent Invites</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          </div>
        ) : invites.length === 0 ? (
          <div className="p-8 text-center">
            <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invites sent yet</p>
            <p className="text-sm text-gray-400">Invite consultants to verify your cases</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invites.map((invite) => (
              <div key={invite.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-sm text-gray-500">
                      Invited as {invite.role === 'consultant' ? 'Consultant' : 'Program Director'} • {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(invite.status)}
                  {invite.status === 'pending' && (
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Send an invite to your consultant or program director</li>
          <li>2. They will receive an email and create a free account</li>
          <li>3. Once they accept, they can verify your cases</li>
          <li>4. Verified cases appear with a badge on your CV exports</li>
        </ul>
      </div>
    </div>
  )
}
