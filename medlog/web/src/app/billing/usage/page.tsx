'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'

interface UsageData {
  plan: string
  limits: {
    ai_analyses: number
    storage_mb: number
    cases_per_month: number
  }
  usage: {
    ai_analyses: number
    ai_cost: number
    cases_count: number
  }
  overages: string[]
  period: {
    start: string
    end: string
  }
}

export default function UsageBillingPage() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/billing/usage', {
        credentials: 'include'
      })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min(100, (used / limit) * 100)
  }

  const getUsageColor = (percent: number) => {
    if (percent >= 100) return 'bg-red-500'
    if (percent >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>Unable to load usage data</p>
      </div>
    )
  }

  const aiPercent = getUsagePercent(data.usage.ai_analyses, data.limits.ai_analyses)
  const casesPercent = getUsagePercent(data.usage.cases_count, data.limits.cases_per_month)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usage & Billing</h1>
        <p className="text-gray-600">Track your usage and manage overages</p>
      </div>

      {/* Plan Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{data.plan}</p>
          </div>
          <a
            href="/settings?tab=billing"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Upgrade Plan
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Usage period: {new Date(data.period.start).toLocaleDateString()} - {new Date(data.period.end).toLocaleDateString()}
        </p>
      </div>

      {/* Overages Alert */}
      {data.overages.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">Usage Overages</h2>
              <ul className="mt-2 space-y-1">
                {data.overages.map((overage, idx) => (
                  <li key={idx} className="text-red-700">{overage}</li>
                ))}
              </ul>
              <p className="text-sm text-red-600 mt-3">
                Overages will be charged at the end of the billing period.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Analyses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">AI Analyses</p>
              <p className="text-sm text-gray-500">
                {data.limits.ai_analyses === -1 ? 'Unlimited' : `${data.limits.ai_analyses} included`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Used: {data.usage.ai_analyses}</span>
              {data.limits.ai_analyses !== -1 && (
                <span className="text-gray-600">Remaining: {Math.max(0, data.limits.ai_analyses - data.usage.ai_analyses)}</span>
              )}
            </div>
            
            {data.limits.ai_analyses !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(aiPercent)}`}
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
            )}

            <div className="flex justify-between text-sm pt-2">
              <span className="text-gray-500">Cost: ${data.usage.ai_cost.toFixed(4)}</span>
              {aiPercent >= 80 && data.limits.ai_analyses !== -1 && (
                <span className="text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {aiPercent >= 100 ? 'Limit reached' : 'Near limit'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Cases */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Cases This Month</p>
              <p className="text-sm text-gray-500">
                {data.limits.cases_per_month === -1 ? 'Unlimited' : `${data.limits.cases_per_month} included`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Logged: {data.usage.cases_count}</span>
              {data.limits.cases_per_month !== -1 && (
                <span className="text-gray-600">Remaining: {Math.max(0, data.limits.cases_per_month - data.usage.cases_count)}</span>
              )}
            </div>

            {data.limits.cases_per_month !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(casesPercent)}`}
                  style={{ width: `${casesPercent}%` }}
                />
              </div>
            )}

            {casesPercent >= 80 && data.limits.cases_per_month !== -1 && (
              <div className="flex items-center gap-1 text-yellow-600 text-sm pt-2">
                <AlertTriangle className="h-3 w-3" />
                {casesPercent >= 100 ? 'Limit reached' : 'Approaching limit'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overage Pricing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overage Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="font-medium">AI Analyses</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">$0.01</p>
            <p className="text-sm text-gray-500">per analysis</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Cases</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">$0.05</p>
            <p className="text-sm text-gray-500">per case over limit</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-green-800 mb-3">Tips to Reduce Usage</h2>
        <ul className="space-y-2 text-sm text-green-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5" />
            Use bulk import for adding multiple cases at once
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5" />
            Run AI analysis only on complex cases that need detailed feedback
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5" />
            Upgrade to Pro for 500 AI analyses/month
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5" />
            Enterprise plans include unlimited AI analyses
          </li>
        </ul>
      </div>
    </div>
  )
}
