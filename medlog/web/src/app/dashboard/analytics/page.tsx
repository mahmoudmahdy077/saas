'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Award,
  Loader2
} from 'lucide-react'

interface AnalyticsData {
  monthlyTrend: { month: string; cases: number }[]
  categoryBreakdown: { category: string; count: number }[]
  roleBreakdown: { role: string; count: number }[]
  verificationStatus: { status: string; count: number }[]
  topResidents: { name: string; cases: number; verified: number }[]
  milestoneProgress: { milestone: string; level: number }[]
}

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function EnhancedAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/institution/stats?period=${period}`, {
        credentials: 'include'
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = data ? {
    totalCases: data.monthlyTrend.reduce((sum, m) => sum + m.cases, 0),
    avgMonthly: Math.round(data.monthlyTrend.reduce((sum, m) => sum + m.cases, 0) / Math.max(data.monthlyTrend.length, 1)),
    verifiedRate: data.verificationStatus.length > 0
      ? Math.round((data.verificationStatus.find(s => s.status === 'verified')?.count || 0) /
        data.verificationStatus.reduce((sum, s) => sum + s.count, 0) * 100)
      : 0,
    topCategory: data.categoryBreakdown[0]?.category || 'N/A'
  } : { totalCases: 0, avgMonthly: 0, verifiedRate: 0, topCategory: 'N/A' }

  const trend = data && data.monthlyTrend.length >= 2
    ? ((data.monthlyTrend[data.monthlyTrend.length - 1].cases - data.monthlyTrend[0].cases) / Math.max(data.monthlyTrend[0].cases, 1) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Insights and trends for your program</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgMonthly}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${trend >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {trend >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Trend</p>
              <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Verified Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Volume Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cases" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.categoryBreakdown || []}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(data?.categoryBreakdown || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.roleBreakdown || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data?.verificationStatus || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
              >
                {(data?.verificationStatus || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Residents */}
      {data?.topResidents && data.topResidents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Residents</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Resident</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Cases</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.topResidents.map((resident, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-sm text-gray-500">#{idx + 1}</td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{resident.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{resident.cases}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{resident.verified}</td>
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
