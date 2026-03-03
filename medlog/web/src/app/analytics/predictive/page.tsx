'use client'

import { useEffect, useState } from 'react'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Lightbulb, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

interface Prediction {
  milestoneId: string
  milestoneName: string
  currentLevel: number
  targetLevel: number
  estimatedCompletionDate: string
  confidence: number
  weeklyProgressRate: number
  casesNeeded: number
  recommendations: string[]
}

interface OverallPrediction {
  predictedGraduationDate: string
  averageConfidence: number
  onTrack: boolean
}

export default function PredictiveAnalyticsPage() {
  const [data, setData] = useState<{
    predictions: Prediction[]
    overall_prediction: OverallPrediction
    stats: { weekly_cases: number; weekly_rate: string; total_tracked_weeks: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [residentId, setResidentId] = useState<string>('')

  useEffect(() => {
    fetchPredictions()
  }, [])

  const fetchPredictions = async (resId?: string) => {
    setLoading(true)
    try {
      const url = resId ? `/api/analytics/predictive?resident_id=${resId}` : '/api/analytics/predictive'
      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResidentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResidentId(e.target.value)
    fetchPredictions(e.target.value || undefined)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'bg-green-100 text-green-700'
    if (level >= 3) return 'bg-yellow-100 text-yellow-700'
    if (level >= 2) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
          <p className="text-gray-600">AI-powered milestone completion predictions</p>
        </div>
      </div>

      {/* Overall Prediction */}
      {data?.overall_prediction && (
        <div className={`rounded-xl p-6 border ${
          data.overall_prediction.onTrack 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-4">
            {data.overall_prediction.onTrack ? (
              <CheckCircle className="h-10 w-10 text-green-600" />
            ) : (
              <AlertCircle className="h-10 w-10 text-yellow-600" />
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {data.overall_prediction.onTrack ? 'On Track for Completion' : 'May Need Additional Focus'}
              </h2>
              <p className="text-gray-600">
                Predicted completion: <span className="font-medium">{data.overall_prediction.predictedGraduationDate}</span>
                {' '}({data.overall_prediction.averageConfidence.toFixed(0)}% confidence)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Weekly Cases</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats.weekly_cases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats.weekly_rate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Weeks Tracked</p>
              <p className="text-2xl font-bold text-gray-900">{data?.stats.total_tracked_weeks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Milestone Predictions</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {data?.predictions.map((prediction) => (
            <div key={prediction.milestoneId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{prediction.milestoneName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(prediction.currentLevel)}`}>
                      Level {prediction.currentLevel}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Level {prediction.targetLevel}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Estimated</div>
                  <div className="font-medium text-gray-900">
                    {prediction.estimatedCompletionDate === 'Unknown' ? (
                      <span className="text-gray-400">Unknown</span>
                    ) : (
                      new Date(prediction.estimatedCompletionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })
                    )}
                  </div>
                  <div className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
                    {prediction.confidence}% confidence
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress to Level 5</span>
                  <span>{(prediction.currentLevel / prediction.targetLevel * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${(prediction.currentLevel / prediction.targetLevel) * 100}%` }}
                  />
                </div>
              </div>

              {/* Recommendations */}
              {prediction.recommendations.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Recommendations</span>
                  </div>
                  <ul className="space-y-1">
                    {prediction.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <Clock className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
