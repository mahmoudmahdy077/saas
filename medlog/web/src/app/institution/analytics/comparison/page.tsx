'use client'

import { useEffect, useState } from 'react'
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Award,
  Loader2,
  BarChart3,
  Activity
} from 'lucide-react'

interface ResidentComparison {
  id: string
  full_name: string
  specialty_name: string
  total_cases: number
  verified_cases: number
  verification_rate: number
  categories_logged: number
  performance_vs_average: {
    cases: number
    verified: number
    cases_percent: number
  }
  ranking: {
    by_cases: number
    by_verified: number
    by_categories: number
  }
}

export default function ResidentComparisonPage() {
  const [data, setData] = useState<{
    residents: ResidentComparison[]
    averages: { totalCases: number; verifiedCases: number }
    period: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchComparison()
  }, [period])

  const fetchComparison = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/institution/analytics/comparison?period=${period}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const topByCases = data?.residents[0]
  const topByVerified = [...(data?.residents || [])].sort((a, b) => b.verified_cases - a.verified_cases)[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resident Comparison</h1>
          <p className="text-gray-600">Compare performance across residents</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white"
        >
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Leader Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Most Cases</h2>
          </div>
          {topByCases && (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{topByCases.full_name}</div>
              <div className="text-2xl text-primary-600">{topByCases.total_cases} cases</div>
              <div className="text-sm text-gray-500 mt-1">Rank #{topByCases.ranking.by_cases}</div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Most Verified</h2>
          </div>
          {topByVerified && (
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{topByVerified.full_name}</div>
              <div className="text-2xl text-green-600">{topByVerified.verified_cases} verified</div>
              <div className="text-sm text-gray-500 mt-1">Rank #{topByVerified.ranking.by_verified}</div>
            </div>
          )}
        </div>
      </div>

      {/* Averages */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Program Averages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{data?.averages.totalCases}</div>
            <div className="text-sm text-gray-500">Avg Cases</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{data?.averages.verifiedCases}</div>
            <div className="text-sm text-gray-500">Avg Verified</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((data?.residents.reduce((sum, r) => sum + r.verification_rate, 0) || 0) / Math.max(data?.residents.length || 1))}%
            </div>
            <div className="text-sm text-gray-500">Avg Verification Rate</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((data?.residents.reduce((sum, r) => sum + r.categories_logged, 0) || 0) / Math.max(data?.residents.length || 1))}
            </div>
            <div className="text-sm text-gray-500">Avg Categories</div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">All Residents</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">vs Avg</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.residents.map((resident) => (
                <tr key={resident.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{resident.full_name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {resident.specialty_name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{resident.total_cases}</span>
                      {resident.performance_vs_average.cases >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{resident.verified_cases}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      resident.verification_rate >= 80 ? 'bg-green-100 text-green-700' :
                      resident.verification_rate >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {resident.verification_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={resident.performance_vs_average.cases_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {resident.performance_vs_average.cases_percent >= 0 ? '+' : ''}{resident.performance_vs_average.cases_percent}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      <div>#{resident.ranking.by_cases} cases</div>
                      <div>#{resident.ranking.by_verified} verified</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
