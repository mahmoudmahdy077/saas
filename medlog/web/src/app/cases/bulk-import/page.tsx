'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Upload,
  FileSpreadsheet,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Loader2
} from 'lucide-react'

interface ImportResult {
  success: number
  failed: number
  errors: string[]
}

const SAMPLE_CSV = `date,procedure_type,category,role,diagnosis,notes
2024-01-15,Appendectomy,General Surgery,primary,Acute appendicitis,Laparoscopic approach
2024-01-20,Hip replacement,Orthopedics,assistant,Osteoarthritis,Total hip arthroplasty
2024-01-25,C-section,Obstetrics & Gynecology,primary,Failure to progress,Emergency delivery`

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    const text = await selectedFile.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      alert('File must contain at least a header row and one data row')
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i])
      const row: any = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || ''
      })
      
      if (row.date && row.procedure_type) {
        data.push(row)
      }
    }

    setParsedData(data)
  }

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      processFile(droppedFile)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setImporting(true)
    try {
      const response = await fetch('/api/cases/bulk-import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cases: parsedData })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        setResult({ success: 0, failed: parsedData.length, errors: ['Import failed'] })
      }
    } catch (error) {
      setResult({ success: 0, failed: parsedData.length, errors: ['Connection error'] })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medlog-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/cases" className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import</h1>
          <p className="text-gray-600">Import cases from CSV file</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
          
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className={`h-12 w-12 mx-auto mb-4 ${dragOver ? 'text-primary-500' : 'text-gray-400'}`} />
            <p className="text-gray-700 font-medium">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supported format: .csv
            </p>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{parsedData.length} rows detected</p>
              </div>
            </div>
          )}

          <div className="mt-4">
            <button
              onClick={downloadTemplate}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download CSV Template
            </button>
          </div>

          {/* CSV Format Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">CSV Format</h3>
            <p className="text-sm text-blue-700 mb-2">Required columns:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">date</code> - Date (YYYY-MM-DD)</li>
              <li>• <code className="bg-blue-100 px-1 rounded">procedure_type</code> - Procedure name</li>
            </ul>
            <p className="text-sm text-blue-700 mt-2">Optional columns:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code className="bg-blue-100 px-1 rounded">category</code> - Specialty category</li>
              <li>• <code className="bg-blue-100 px-1 rounded">role</code> - primary, assistant, observer</li>
              <li>• <code className="bg-blue-100 px-1 rounded">diagnosis</code> - Patient diagnosis</li>
              <li>• <code className="bg-blue-100 px-1 rounded">notes</code> - Additional notes</li>
            </ul>
          </div>
        </div>

        {/* Preview & Import */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
            {parsedData.length > 0 && (
              <span className="text-sm text-gray-500">{parsedData.length} cases ready</span>
            )}
          </div>

          {parsedData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Upload a CSV file to preview data
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Procedure</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {parsedData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900">{row.date}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{row.procedure_type}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{row.category || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-500">{row.role || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ...and {parsedData.length - 5} more rows
                </p>
              )}

              {/* Results */}
              {result && (
                <div className="mt-4 p-4 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-700">{result.success} imported</span>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-700">{result.failed} failed</span>
                      </div>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <details className="mt-3">
                      <summary className="text-sm text-gray-600 cursor-pointer">
                        View errors ({result.errors.length})
                      </summary>
                      <ul className="mt-2 text-sm text-red-600 space-y-1">
                        {result.errors.slice(0, 5).map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={importing || result?.success === parsedData.length}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : result?.success === parsedData.length ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    All Cases Imported
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Import {parsedData.length} Cases
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
