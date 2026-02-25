'use client'

import { useEffect, useState } from 'react'
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Target,
    PieChart,
    Sparkles,
    ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Cell
} from 'recharts'

interface GapAnalysis {
    totalCases: number
    categoryDistribution: Record<string, number>
    roleDistribution: Record<string, number>
    procedureTypes: Record<string, number>
    monthlyTrend: Record<string, number>
    verificationRate: number
    gaps: string[]
    recommendations: string[]
    aiInsight: string
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#7c3aed', '#6d28d9', '#5b21b6']

export default function AIAnalysisPage() {
    const [analysis, setAnalysis] = useState<GapAnalysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchAnalysis()
    }, [])

    const fetchAnalysis = async () => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch('/api/ai/gap-analysis', { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                setAnalysis(data)
            } else {
                setError('Failed to load analysis data')
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <Brain className="h-12 w-12 text-purple-500 animate-pulse" />
                    <Sparkles className="h-5 w-5 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <p className="text-gray-600 font-medium">Analyzing your case portfolio...</p>
                <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchAnalysis}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (!analysis || analysis.totalCases === 0) {
        return (
            <div className="text-center py-16">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Cases to Analyze</h2>
                <p className="text-gray-600 mb-6">Start logging cases to see AI-powered insights about your training progress.</p>
                <Link
                    href="/cases/new"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    Log Your First Case
                </Link>
            </div>
        )
    }

    const categoryData = Object.entries(analysis.categoryDistribution).map(([name, value]) => ({
        name: name.length > 15 ? name.slice(0, 15) + '...' : name,
        fullName: name,
        value,
    }))

    const roleData = Object.entries(analysis.roleDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
    }))

    const radarData = Object.entries(analysis.categoryDistribution).map(([name, value]) => ({
        subject: name.length > 12 ? name.slice(0, 12) + '...' : name,
        cases: value,
        fullMark: Math.max(...Object.values(analysis.categoryDistribution)) * 1.2,
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">AI Gap Analysis</h1>
                            <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold rounded-full">PRO</span>
                        </div>
                        <p className="text-gray-600">AI-powered insights into your training progress</p>
                    </div>
                </div>
                <button
                    onClick={fetchAnalysis}
                    className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Sparkles className="h-4 w-4" />
                    Refresh Analysis
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Cases</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.totalCases}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-500">
                            <PieChart className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Verification Rate</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.verificationRate}%</p>
                        </div>
                        <div className={`p-3 rounded-xl ${analysis.verificationRate >= 50 ? 'bg-green-500' : 'bg-yellow-500'}`}>
                            <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Categories</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(analysis.categoryDistribution).length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500">
                            <Target className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Gaps Found</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{analysis.gaps.length}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${analysis.gaps.length === 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip
                                formatter={(value: number) => [value, 'Cases']}
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {categoryData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Coverage</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis tick={{ fontSize: 10 }} />
                            <Radar
                                name="Cases"
                                dataKey="cases"
                                stroke="#8b5cf6"
                                fill="#8b5cf6"
                                fillOpacity={0.3}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Distribution</h3>
                <div className="flex flex-wrap gap-4">
                    {roleData.map((role, index) => {
                        const percentage = Math.round((role.value / analysis.totalCases) * 100)
                        return (
                            <div key={role.name} className="flex-1 min-w-[200px]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">{role.name}</span>
                                    <span className="text-sm text-gray-500">{role.value} ({percentage}%)</span>
                                </div>
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%`, backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Gaps & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Identified Gaps */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Identified Gaps</h3>
                    </div>
                    {analysis.gaps.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <p className="text-green-700 font-medium">No significant gaps detected. Great job!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analysis.gaps.map((gap, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                                    <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-600 text-xs font-bold">{i + 1}</span>
                                    </div>
                                    <p className="text-sm text-red-700">{gap}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
                    </div>
                    {analysis.recommendations.length === 0 ? (
                        <p className="text-gray-500">Keep up the excellent work! No specific recommendations at this time.</p>
                    ) : (
                        <div className="space-y-3">
                            {analysis.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Sparkles className="h-3 w-3 text-green-600" />
                                    </div>
                                    <p className="text-sm text-green-700">{rec}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Insight */}
            {analysis.aiInsight && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <h3 className="text-lg font-semibold text-purple-900">AI-Powered Insight</h3>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">GPT</span>
                    </div>
                    <p className="text-purple-800 whitespace-pre-line leading-relaxed">{analysis.aiInsight}</p>
                </div>
            )}
        </div>
    )
}
