'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    FileDown,
    Calendar,
    Filter,
    Loader2,
    Download,
    Eye,
    ArrowLeft,
    Sparkles
} from 'lucide-react'

const CATEGORIES = [
    'General Surgery',
    'Orthopedics',
    'Internal Medicine',
    'Pediatrics',
    'Obstetrics & Gynecology',
    'Emergency Medicine',
    'Cardiology',
    'Neurology',
    'Other',
]

export default function CVExportPage() {
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [previewHtml, setPreviewHtml] = useState('')
    const [error, setError] = useState('')

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        )
    }

    const generateCV = async (download = false) => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch('/api/cases/cv-export', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || 'Failed to generate CV')
                setLoading(false)
                return
            }

            const html = await response.text()

            if (download) {
                const blob = new Blob([html], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `medical-case-log-${new Date().toISOString().split('T')[0]}.html`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            } else {
                setPreviewHtml(html)
            }
        } catch (err) {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

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
                            <h1 className="text-2xl font-bold text-gray-900">CV Generator</h1>
                            <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full">PRO</span>
                        </div>
                        <p className="text-gray-600">Generate a professional case log for your CV</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Customize Your CV</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categories (leave empty for all)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategories.includes(cat)
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => generateCV(false)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        Preview
                    </button>

                    <button
                        onClick={() => generateCV(true)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Download HTML
                    </button>

                    <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                        <Sparkles className="h-3 w-3" />
                        <span>Open downloaded file in browser → Print → Save as PDF</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                        {error}
                    </div>
                )}
            </div>

            {/* Preview Area */}
            {previewHtml && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <FileDown className="h-4 w-4 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-700">CV Preview</h3>
                        </div>
                        <button
                            onClick={() => generateCV(true)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                        >
                            <Download className="h-3 w-3" />
                            Download
                        </button>
                    </div>
                    <div className="p-4">
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full min-h-[800px] border border-gray-200 rounded-lg"
                            title="CV Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
