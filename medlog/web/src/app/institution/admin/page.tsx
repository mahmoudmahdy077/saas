'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Institution {
  id: string
  name: string
  resident_count: number
  case_count: number
  specialties: number
}

interface Specialty {
  id: string
  name: string
  description: string
  resident_count: number
  case_count: number
}

interface Report {
  id: string
  period: string
  type: string
  case_count: number
  average_grade: number
  created_at: string
}

export default function InstitutionAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [recentReports, setRecentReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [residents, setResidents] = useState<any[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedResident, setSelectedResident] = useState<any>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [editSpecialty, setEditSpecialty] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, instRes, resRes] = await Promise.all([
        fetch('/api/auth/user', { credentials: 'include' }),
        fetch('/api/institution/stats', { credentials: 'include' }),
        fetch('/api/institution/residents', { credentials: 'include' })
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData.profile)

        if (userData.profile?.role !== 'institution_admin') {
          router.push('/dashboard')
          return
        }
      }

      if (instRes.ok) {
        const instData = await instRes.json()
        setInstitution(instData.institution)
        setSpecialties(instData.specialties || [])
        setRecentReports(instData.reports || [])
      }

      if (resRes.ok) {
        const resData = await resRes.json()
        setResidents(resData.residents || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    {
      name: 'Total Residents',
      value: institution?.resident_count || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Cases',
      value: institution?.case_count || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Specialties',
      value: institution?.specialties || 0,
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Reviews',
      value: 12,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
  ]

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'resident' })
      })
      if (res.ok) {
        setShowInviteModal(false)
        setInviteEmail('')
        alert('Invitation sent successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to send invitation')
      }
    } catch (error) {
      console.error('Invite error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleEditResident = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    try {
      const res = await fetch('/api/institution/residents', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resident_id: selectedResident.id, specialty_id: editSpecialty })
      })
      if (res.ok) {
        setShowEditModal(false)
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update resident')
      }
    } catch (error) {
      console.error('Update error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleRemoveResident = async (residentId: string) => {
    if (!confirm('Are you sure you want to remove this resident from the institution?')) return

    try {
      const res = await fetch(`/api/institution/residents?resident_id=${residentId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to remove resident')
      }
    } catch (error) {
      console.error('Removal error:', error)
    }
  }

  // ... (existing helper components if any)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Admin</h1>
          <p className="text-gray-600">{institution?.name || 'Institution Dashboard'}</p>
        </div>
        <Link
          href="/institution/settings"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'specialties', 'reports', 'residents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div
                key={stat.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/institution/specialties"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Specialties</h3>
                  <p className="text-sm text-gray-600">Add or edit departments</p>
                </div>
              </div>
            </Link>

            <Link
              href="/institution/reports"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-600">Monthly and annual summaries</p>
                </div>
              </div>
            </Link>

            <Link
              href="/institution/compliance"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ACGME Compliance</h3>
                  <p className="text-sm text-gray-600">Case minimums & milestones</p>
                </div>
              </div>
            </Link>

            <Link
              href="/institution/templates"
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-primary-200 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Custom Templates</h3>
                  <p className="text-sm text-gray-600">Create case templates</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
              <Link
                href="/institution/reports"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            {recentReports.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No reports generated yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-gray-900">{report.period}</p>
                      <p className="text-sm text-gray-500 capitalize">{report.type} Report</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {report.case_count} cases
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${report.average_grade >= 80 ? 'bg-green-100 text-green-700' :
                        report.average_grade >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        Avg: {report.average_grade}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'specialties' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Specialty Departments</h2>
            <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4" />
              Add Specialty
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {specialties.map((specialty) => (
              <div key={specialty.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-gray-900">{specialty.name}</p>
                  <p className="text-sm text-gray-500">{specialty.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {specialty.resident_count} residents
                  </span>
                  <span className="text-sm text-gray-600">
                    {specialty.case_count} cases
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {specialties.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No specialties configured. Add your first specialty department.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Monthly Report</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Annual Report</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-700">Resident Summary</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">All Reports</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-gray-900">{report.period}</p>
                    <p className="text-sm text-gray-500 capitalize">{report.type} Report</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{report.case_count} cases</span>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Download
                    </button>
                  </div>
                </div>
              ))}
              {recentReports.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No reports generated yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite New Resident</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                  placeholder="resident@hospital.com"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Resident: {selectedResident?.full_name}</h2>
            <form onSubmit={handleEditResident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Specialty</label>
                <select
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select Specialty</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* (Existing page content... replace residents tab) */}
      {activeTab === 'residents' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Resident List</h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Invite Resident
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Specialty</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Streak</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {residents.map((resident) => (
                  <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-medium text-sm">
                          {resident.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{resident.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {resident.specialty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {resident.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                        <span>🔥</span>
                        <span>{resident.current_streak}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedResident(resident)
                            setEditSpecialty('') // Or find current specialist ID
                            setShowEditModal(true)
                          }}
                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveResident(resident.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
