'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  Star,
  Users,
  Calendar,
  Download,
  Send,
  Eye
} from 'lucide-react'

interface Resident {
  id: string
  full_name: string
  email: string
  specialty: string
  current_streak: number
}

interface Report {
  id: string
  resident_id: string
  resident?: Resident
  period: string
  type: string
  case_count: number
  grades: Record<string, number>
  ai_insights: string
  pd_notes: string
  created_at: string
}

interface GradingCategory {
  key: string
  label: string
  maxScore: number
}

const GRADING_CATEGORIES: GradingCategory[] = [
  { key: 'case_volume', label: 'Case Volume', maxScore: 100 },
  { key: 'case_diversity', label: 'Case Diversity', maxScore: 100 },
  { key: 'primary_operator', label: 'Primary Operator Rate', maxScore: 100 },
  { key: 'documentation', label: 'Documentation Quality', maxScore: 100 },
  { key: 'professionalism', label: 'Professionalism', maxScore: 100 },
  { key: 'overall', label: 'Overall Performance', maxScore: 100 },
]

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedResident, setSelectedResident] = useState('')
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly')
  const [period, setPeriod] = useState('')
  const [grades, setGrades] = useState<Record<string, number>>({})
  const [pdNotes, setPdNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [reportsRes, residentsRes] = await Promise.all([
        fetch('/api/institution/reports', { credentials: 'include' }),
        fetch('/api/institution/residents', { credentials: 'include' })
      ])

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data.reports || [])
      }

      if (residentsRes.ok) {
        const data = await residentsRes.json()
        setResidents(data.residents || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (key: string, value: number) => {
    setGrades(prev => ({ ...prev, [key]: value }))
  }

  const createReport = async () => {
    if (!selectedResident || !period) {
      alert('Please select a resident and period')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/institution/reports', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resident_id: selectedResident,
          type: reportType,
          period,
          grades,
          pd_notes: pdNotes
        })
      })

      if (response.ok) {
        await fetchData()
        setShowCreate(false)
        resetForm()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to create report')
      }
    } catch (error) {
      console.error('Failed to create report:', error)
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setSelectedResident('')
    setReportType('monthly')
    setPeriod('')
    setGrades({})
    setPdNotes('')
  }

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getAverageGrade = (reportGrades: Record<string, number>) => {
    const values = Object.values(reportGrades)
    if (values.length === 0) return 0
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/institution/admin" className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Grading</h1>
            <p className="text-gray-600">Generate and review resident performance reports</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Report
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">All Reports</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No reports generated yet. Create your first report.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {reports.map((report) => (
              <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.resident?.full_name || 'Resident'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">{report.period}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500 capitalize">{report.type}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{report.case_count} cases</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {report.grades && Object.keys(report.grades).length > 0 && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(getAverageGrade(report.grades))}`}>
                        Avg: {getAverageGrade(report.grades)}%
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-400 hover:text-primary-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create Report</h3>
              <button onClick={() => { setShowCreate(false); resetForm() }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resident & Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resident
                  </label>
                  <select
                    value={selectedResident}
                    onChange={(e) => setSelectedResident(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Resident</option>
                    {residents.map(r => (
                      <option key={r.id} value={r.id}>{r.full_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period (YYYY-MM or YYYY)
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder={reportType === 'monthly' ? '2024-01' : '2024'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Grading */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Performance Grades
                </h4>
                <div className="space-y-4">
                  {GRADING_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-center gap-4">
                      <label className="w-48 text-sm text-gray-700">{cat.label}</label>
                      <input
                        type="range"
                        min="0"
                        max={cat.maxScore}
                        value={grades[cat.key] || 0}
                        onChange={(e) => handleGradeChange(cat.key, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm font-medium text-center">
                        {grades[cat.key] || 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PD Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PD Notes
                </label>
                <textarea
                  value={pdNotes}
                  onChange={(e) => setPdNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional feedback for the resident..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowCreate(false); resetForm() }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createReport}
                disabled={creating || !selectedResident || !period}
                className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {creating ? 'Creating...' : 'Create Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Resident</p>
                <p className="font-medium text-gray-900">{selectedReport.resident?.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Period</p>
                  <p className="font-medium text-gray-900">{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedReport.type}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cases Logged</p>
                <p className="font-medium text-gray-900">{selectedReport.case_count}</p>
              </div>

              {selectedReport.grades && Object.keys(selectedReport.grades).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Grades</p>
                  <div className="space-y-2">
                    {Object.entries(selectedReport.grades).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700 capitalize">{key.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-sm font-medium ${getGradeColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.ai_insights && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">AI Insights</p>
                  <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg">{selectedReport.ai_insights}</p>
                </div>
              )}

              {selectedReport.pd_notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">PD Notes</p>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedReport.pd_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
