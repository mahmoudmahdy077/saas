'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  Plus, 
  Copy, 
  CheckCircle, 
  XCircle,
  Calendar,
  Lock,
  Eye,
  Edit,
  Download,
  Trash2,
  Loader2
} from 'lucide-react'

interface ShareLink {
  id: string
  token: string
  type: 'time_limited' | 'permanent' | 'password_protected'
  expires_at: string | null
  permissions: 'view' | 'edit' | 'export'
  access_count: number
  created_at: string
}

export default function SharePage() {
  const router = useRouter()
  const [links, setLinks] = useState<ShareLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'time_limited' as 'time_limited' | 'permanent' | 'password_protected',
    expiresIn: '7',
    password: '',
    permissions: 'view' as 'view' | 'edit' | 'export',
  })

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/share', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error('Failed to fetch links:', error)
    } finally {
      setLoading(false)
    }
  }

  const createLink = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchLinks()
        setShowModal(false)
        setFormData({
          type: 'time_limited',
          expiresIn: '7',
          password: '',
          permissions: 'view',
        })
      }
    } catch (error) {
      console.error('Failed to create link:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/share?id=${id}`, { method: 'DELETE', credentials: 'include' })
      if (response.ok) {
        setLinks(links.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete link:', error)
    }
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const getPermissionIcon = (perm: string) => {
    switch (perm) {
      case 'view': return Eye
      case 'edit': return Edit
      case 'export': return Download
      default: return Eye
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'time_limited': return 'Time Limited'
      case 'permanent': return 'Permanent'
      case 'password_protected': return 'Password Protected'
      default: return type
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Share Your Logbook</h1>
            <p className="text-gray-600">Create shareable links for job applications</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Link
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No share links yet</h3>
          <p className="text-gray-500 mb-4">Create a link to share your case log with others</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            Create your first link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {links.map((link) => {
            const PermissionIcon = getPermissionIcon(link.permissions)
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date()
            
            return (
              <div key={link.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <LinkIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {getTypeLabel(link.type)}
                        </p>
                        {isExpired ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            <XCircle className="h-3 w-3" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <PermissionIcon className="h-3 w-3" />
                          {link.permissions.charAt(0).toUpperCase() + link.permissions.slice(1)}
                        </span>
                        {link.type === 'time_limited' && link.expires_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Expires {new Date(link.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        {link.type === 'password_protected' && (
                          <span className="flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Password protected
                          </span>
                        )}
                        <span>{link.access_count} views</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(link.token)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      {copied === link.token ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Share Link</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['time_limited', 'permanent', 'password_protected'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, type: type as any })}
                      className={`p-3 rounded-lg border text-sm font-medium ${
                        formData.type === type
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'time_limited' ? 'Time Limited' : 
                       type === 'permanent' ? 'Permanent' : 'Password'}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === 'time_limited' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expires In</label>
                  <select
                    value={formData.expiresIn}
                    onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              )}

              {formData.type === 'password_protected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'view', label: 'View Only', icon: Eye },
                    { value: 'edit', label: 'Can Edit', icon: Edit },
                    { value: 'export', label: 'Export', icon: Download },
                  ].map((perm) => (
                    <button
                      key={perm.value}
                      onClick={() => setFormData({ ...formData, permissions: perm.value as any })}
                      className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-1 ${
                        formData.permissions === perm.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <perm.icon className="h-4 w-4" />
                      {perm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createLink}
                disabled={creating}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Link'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
