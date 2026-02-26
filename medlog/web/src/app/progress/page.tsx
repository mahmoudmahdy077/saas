'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Target,
  Award,
  Activity,
  Users,
  BarChart3
} from 'lucide-react'

interface ProgressData {
  total_cases: number
  cases_by_category: Record<string, Record<string, number>>
  cases_by_status: { status: string; count: number }[]
  training_year: number
  requirements: any[]
  minimums: any[]
}

export default function ProgressPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/progress?action=my')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then(data => {
        setProgress(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consultant_verified': return 'text-green-600 bg-green-50'
      case 'pd_approved': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Digestive': 'bg-orange-500',
      'Musculoskeletal': 'bg-blue-500',
      'Vascular': 'bg-red-500',
      'Integumentary': 'bg-pink-500',
      'Spine': 'bg-purple-500',
      'Endocrine': 'bg-yellow-500',
      'Other': 'bg-gray-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 text-slate-600 hover:underline"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const totalByStatus = progress?.cases_by_status?.reduce((acc, s) => acc + s.count, 0) || 0

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Progress</h1>
          <p className="text-slate-600 mt-1">Track your case logging progress and requirements</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Cases</p>
                <p className="text-2xl font-bold text-slate-900">{progress?.total_cases || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Verified</p>
                <p className="text-2xl font-bold text-slate-900">
                  {progress?.cases_by_status?.find(s => s.status === 'consultant_verified')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {progress?.cases_by_status?.find(s => s.status === 'pending')?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Training Year</p>
                <p className="text-2xl font-bold text-slate-900">PGY-{progress?.training_year || 1}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Cases by Category
              </h2>
            </div>

            {progress?.cases_by_category && Object.keys(progress.cases_by_category).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(progress.cases_by_category).map(([category, roles]) => {
                  const total = (roles.primary || 0) + (roles.assistant || 0) + (roles.observer || 0)
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                          <span className="font-medium text-slate-900">{category}</span>
                        </div>
                        <span className="text-sm text-slate-600">{total} cases</span>
                      </div>
                      <div className="flex gap-1 h-2">
                        {roles.primary > 0 && (
                          <div
                            className="bg-slate-900 rounded-full"
                            style={{ width: `${(roles.primary / total) * 100}%` }}
                          />
                        )}
                        {roles.assistant > 0 && (
                          <div
                            className="bg-slate-400 rounded-full"
                            style={{ width: `${(roles.assistant / total) * 100}%` }}
                          />
                        )}
                        {roles.observer > 0 && (
                          <div
                            className="bg-slate-200 rounded-full"
                            style={{ width: `${(roles.observer / total) * 100}%` }}
                          />
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-slate-500">
                        <span>Primary: {roles.primary || 0}</span>
                        <span>Assistant: {roles.assistant || 0}</span>
                        <span>Observer: {roles.observer || 0}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No cases logged yet</p>
            )}

            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-900 rounded-full" />
                <span>Primary</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-400 rounded-full" />
                <span>Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-200 rounded-full" />
                <span>Observer</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Cases by Status
              </h2>
            </div>

            {progress?.cases_by_status && progress.cases_by_status.length > 0 ? (
              <div className="space-y-4">
                {progress.cases_by_status.map((item) => {
                  const percentage = totalByStatus > 0 ? (item.count / totalByStatus) * 100 : 0
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="text-sm text-slate-600">{item.count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No cases logged yet</p>
            )}
          </div>
        </div>

        {progress?.minimums && progress.minimums.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Case Minimums
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Procedure Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Minimum Required</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Completed</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {progress.minimums.map((min: any, idx: number) => {
                    const categoryCases = progress.cases_by_category?.[min.procedure_category] || {}
                    const completed = categoryCases.primary || 0
                    const percentage = min.minimum_number > 0 
                      ? Math.min((completed / min.minimum_number) * 100, 100) 
                      : 0
                    const isComplete = completed >= min.minimum_number

                    return (
                      <tr key={idx} className="border-b border-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getCategoryColor(min.procedure_category)}`} />
                            <span className="text-sm text-slate-900">{min.procedure_category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">-</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{min.minimum_number}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={isComplete ? 'text-green-600 font-medium' : 'text-slate-900'}>
                            {completed}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-slate-900'}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-12">{percentage.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(!progress?.minimums || progress.minimums.length === 0) && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Case Minimums Configured</h3>
              <p className="text-slate-500">
                Your program hasn't set up case minimums yet. Contact your program administrator.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
