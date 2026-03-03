'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Trash2, 
  Play, 
  Loader2,
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ReportSchedule {
  id: string
  report_type: string
  frequency: string
  recipients: string[]
  last_run_at: string | null
  next_run_at: string | null
  is_active: boolean
  created_at: string
}

const reportTypeLabels: Record<string, string> = {
  case_volume: 'Case Volume Report',
  minimums: 'Case Minimums Report',
  resident_summary: 'Resident Summary Report',
  milestone: 'Milestone Report'
}

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly'
}

export default function ReportSchedulesPage() {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    report_type: 'case_volume',
    frequency: 'weekly',
    recipients: '',
    is_active: true
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/institution/report-schedules', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const recipients = formData.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.includes('@'))

      const response = await fetch('/api/institution/report-schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          schedule: {
            id: editingId,
            report_type: formData.report_type,
            frequency: formData.frequency,
            recipients,
            is_active: formData.is_active
          }
        })
      })

      if (response.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          report_type: 'case_volume',
          frequency: 'weekly',
          recipients: '',
          is_active: true
        })
        fetchSchedules()
      }
    } catch (error) {
      console.error('Failed to save schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const response = await fetch('/api/institution/report-schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          schedule: { id }
        })
      })

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  }

  const handleRunNow = async (id: string) => {
    try {
      const response = await fetch('/api/institution/report-schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_now',
          schedule: { id }
        })
      })

      if (response.ok) {
        alert('Report generation started. It will be available in the reports section shortly.')
      }
    } catch (error) {
      console.error('Failed to run schedule:', error)
    }
  }

  const handleToggleActive = async (schedule: ReportSchedule) => {
    try {
      const response = await fetch('/api/institution/report-schedules', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          schedule: {
            id: schedule.id,
            is_active: !schedule.is_active
          }
        })
      })

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('Failed to toggle schedule:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduled Reports</h1>
          <p className="text-gray-600">Automatically generate and email reports on a schedule</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setFormData({
              report_type: 'case_volume',
              frequency: 'weekly',
              recipients: '',
              is_active: true
            })
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Schedule' : 'New Report Schedule'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="case_volume">Case Volume Report</option>
                <option value="minimums">Case Minimums Report</option>
                <option value="resident_summary">Resident Summary Report</option>
                <option value="milestone">Milestone Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipients (comma-separated emails)
              </label>
              <input
                type="text"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="email@example.com, another@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {editingId ? 'Update' : 'Create'} Schedule
            </button>
          </div>
        </form>
      )}

      {/* Schedules List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No scheduled reports</p>
            <p className="text-sm">Create a schedule to automatically generate reports</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${schedule.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {schedule.is_active ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {reportTypeLabels[schedule.report_type] || schedule.report_type}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {frequencyLabels[schedule.frequency]}
                        </span>
                        {schedule.next_run_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next: {new Date(schedule.next_run_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {schedule.recipients && schedule.recipients.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Users className="h-3 w-3" />
                          {schedule.recipients.length} recipient(s)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunNow(schedule.id)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                      title="Run Now"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(schedule)}
                      className={`p-2 rounded-lg ${
                        schedule.is_active 
                          ? 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={schedule.is_active ? 'Pause' : 'Activate'}
                    >
                      {schedule.is_active ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
