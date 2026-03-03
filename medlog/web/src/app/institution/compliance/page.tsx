'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Calendar,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

type ReportType = 'case_volume' | 'minimums' | 'resident_summary' | 'milestone'

export default function CompliancePage() {
  const searchParams = useSearchParams()
  const [activeReport, setActiveReport] = useState<ReportType>('case_volume')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [period, setPeriod] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [residentFilter, setResidentFilter] = useState('')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'minimums' || tab === 'volume' || tab === 'summary' || tab === 'milestone') {
      setActiveReport(tab === 'volume' ? 'case_volume' : tab === 'summary' ? 'resident_summary' : tab)
    }
    fetchReport()
  }, [activeReport, period, startDate, endDate, residentFilter])

  const fetchReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('type', activeReport)
      if (period) params.set('period', period)
      if (startDate && endDate) {
        params.set('start_date', startDate)
        params.set('end_date', endDate)
      }
      if (residentFilter) params.set('resident_id', residentFilter)

      const response = await fetch(`/api/reports?${params.toString()}`, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReportLabel = (type: ReportType) => {
    switch (type) {
      case 'case_volume': return 'Case Volume'
      case 'minimums': return 'Case Minimums'
      case 'resident_summary': return 'Resident Summary'
      case 'milestone': return 'Milestones'
    }
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/institution/admin" className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ACGME Compliance Reports</h1>
            <p className="text-gray-600">Generate compliance reports for accreditation</p>
          </div>
        </div>
        <button
          onClick={fetchReport}
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Report Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 flex gap-2">
        {(['case_volume', 'minimums', 'resident_summary', 'milestone'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveReport(type)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeReport === type
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {getReportLabel(type)}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Time</option>
              <option value="2026-01">January 2026</option>
              <option value="2025-12">December 2025</option>
              <option value="2025-11">November 2025</option>
              <option value="2025">Year 2025</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Start Date"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="End Date"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by resident ID (optional)"
            value={residentFilter}
            onChange={(e) => setResidentFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
            <p className="mt-4 text-gray-500">Generating report...</p>
          </div>
        ) : !reportData ? (
          <div className="p-12 text-center text-gray-500">
            Select a report type and filters to generate a report
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Summary Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {activeReport === 'case_volume' && reportData.summary && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Cases</p>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_cases}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Total Residents</p>
                    <p className="text-2xl font-bold text-green-900">{reportData.summary.total_residents}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Avg Cases/Resident</p>
                    <p className="text-2xl font-bold text-purple-900">{reportData.summary.avg_cases_per_resident}</p>
                  </div>
                </>
              )}
              {activeReport === 'minimums' && reportData.summary && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Residents</p>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_residents}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Fully Compliant</p>
                    <p className="text-2xl font-bold text-green-900">{reportData.summary.fully_compliant}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-red-600">At Risk</p>
                    <p className="text-2xl font-bold text-red-900">{reportData.summary.at_risk}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Avg Compliance</p>
                    <p className="text-2xl font-bold text-purple-900">{reportData.summary.avg_compliance}%</p>
                  </div>
                </>
              )}
              {activeReport === 'resident_summary' && reportData.summary && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Residents</p>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_residents}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Total Cases</p>
                    <p className="text-2xl font-bold text-green-900">{reportData.summary.total_cases}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Avg Verification</p>
                    <p className="text-2xl font-bold text-purple-900">{reportData.summary.avg_verification_rate}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600">Avg Cases/Resident</p>
                    <p className="text-2xl font-bold text-orange-900">{reportData.summary.avg_cases_per_resident}</p>
                  </div>
                </>
              )}
              {activeReport === 'milestone' && reportData.summary && (
                <>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Residents</p>
                    <p className="text-2xl font-bold text-blue-900">{reportData.summary.total_residents}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Avg Program Level</p>
                    <p className="text-2xl font-bold text-purple-900">{reportData.summary.avg_program_level}</p>
                  </div>
                </>
              )}
            </div>

            {/* Case Volume Report */}
            {activeReport === 'case_volume' && (
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">By Resident</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Resident</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Total</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Primary</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Assistant</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Observer</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Verified</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Categories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.by_resident?.map((row: any) => (
                        <tr key={row.resident_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{row.full_name}</td>
                          <td className="py-3 px-2 text-right">{row.total_cases}</td>
                          <td className="py-3 px-2 text-right">{row.primary_cases}</td>
                          <td className="py-3 px-2 text-right">{row.assistant_cases}</td>
                          <td className="py-3 px-2 text-right">{row.observer_cases}</td>
                          <td className="py-3 px-2 text-right">{row.verified_cases}</td>
                          <td className="py-3 px-2 text-right">{row.categories_covered}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {reportData.by_category && reportData.by_category.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {reportData.by_category.map((cat: any) => (
                        <div key={cat.category} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900">{cat.category}</p>
                          <p className="text-lg font-bold text-primary-600">{cat.case_count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Case Minimums Report */}
            {activeReport === 'minimums' && (
              <div className="p-6">
                {reportData.residents?.map((resident: any) => (
                  <div key={resident.resident_id} className="mb-6 pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{resident.resident_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(resident.overall_compliance)}`}>
                        {resident.overall_compliance}% Compliant
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {resident.categories?.map((cat: any) => (
                        <div key={cat.category} className="bg-gray-50 rounded p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 truncate">{cat.category}</span>
                            {cat.compliant ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="font-medium">{cat.actual}/{cat.required}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resident Summary Report */}
            {activeReport === 'resident_summary' && (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Resident</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Cases</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Verified</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Categories</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Streak</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-600">Doc Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.residents?.map((row: any) => (
                        <tr key={row.resident_id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{row.full_name}</td>
                          <td className="py-3 px-2 text-right">{row.total_cases}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`font-medium ${row.verification_rate >= 80 ? 'text-green-600' : row.verification_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {row.verification_rate}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">{row.categories_logged}</td>
                          <td className="py-3 px-2 text-right">{row.current_streak}</td>
                          <td className="py-3 px-2 text-right">{row.documentation_quality}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Milestone Report */}
            {activeReport === 'milestone' && (
              <div className="p-6">
                {reportData.residents?.map((resident: any) => (
                  <div key={resident.resident_id} className="mb-6 pb-6 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{resident.resident_name}</h3>
                      <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        Avg Level: {resident.average_milestone_level}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {resident.milestones?.map((m: any) => (
                        <div key={m.milestone_number} className="bg-gray-50 rounded p-2 text-center">
                          <p className="text-xs text-gray-500">M{m.milestone_number}</p>
                          <p className="text-sm font-medium truncate">{m.competency_area}</p>
                          <p className={`text-lg font-bold ${m.current_level ? 'text-primary-600' : 'text-gray-400'}`}>
                            {m.current_level || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
