'use client'

import { useEffect, useState } from 'react'
import { 
  Award, 
  Download, 
  Calendar, 
  User,
  Building,
  Loader2,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Milestone {
  id: string
  milestone_number: number
  competency_area: string
  level1_description: string
  level2_description: string
  level3_description: string
  level4_description: string
  level5_description: string
  latest_assessment: {
    level: number
    assessment_date: string
    assessor_name: string
    notes: string
  } | null
}

interface Resident {
  full_name: string
  email: string
  institution_name: string
  specialty_id: string
}

const levelColors: Record<number, string> = {
  1: 'bg-red-100 text-red-700 border-red-200',
  2: 'bg-orange-100 text-orange-700 border-orange-200',
  3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  4: 'bg-green-100 text-green-700 border-green-200',
  5: 'bg-blue-100 text-blue-700 border-blue-200',
}

const levelLabels: Record<number, string> = {
  1: 'Novice',
  2: 'Advanced Beginner',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert'
}

export default function MilestoneTranscriptPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [resident, setResident] = useState<Resident | null>(null)
  const [loading, setLoading] = useState(true)
  const [residentId, setResidentId] = useState<string>('')
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    fetchTranscript()
  }, [])

  const fetchTranscript = async (resId?: string) => {
    setLoading(true)
    try {
      const url = resId ? `/api/milestones/transcript?resident_id=${resId}` : '/api/milestones/transcript'
      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setMilestones(data.milestones || [])
        setResident(data.resident)
      }
    } catch (error) {
      console.error('Failed to fetch transcript:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    const html = generateTranscriptHTML()
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `milestone-transcript-${resident?.full_name?.replace(/\s+/g, '-') || 'resident'}.html`
    a.click()
  }

  const generateTranscriptHTML = () => {
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Milestone Transcript - ${resident?.full_name || 'Resident'}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #2563eb; margin-bottom: 5px; }
    .info { display: flex; justify-content: space-around; margin-bottom: 30px; }
    .info-item { text-align: center; }
    .info-label { font-size: 12px; color: #666; }
    .info-value { font-size: 14px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #f5f5f5; }
    .level-1 { background: #fee2e2; color: #991b1b; }
    .level-2 { background: #ffedd5; color: #9a3412; }
    .level-3 { background: #fef9c3; color: #854d0e; }
    .level-4 { background: #dcfce7; color: #166534; }
    .level-5 { background: #dbeafe; color: #1e40af; }
    .not-assessed { color: #999; font-style: italic; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ACGME Milestone Transcript</h1>
    <p>Official Milestone Assessment Record</p>
  </div>
  
  <div class="info">
    <div class="info-item">
      <div class="info-label">Resident Name</div>
      <div class="info-value">${resident?.full_name || 'N/A'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Institution</div>
      <div class="info-value">${resident?.institution_name || 'N/A'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Date Generated</div>
      <div class="info-value">${date}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Competency Area</th>
        <th>Current Level</th>
        <th>Last Assessed</th>
        <th>Assessor</th>
      </tr>
    </thead>
    <tbody>
      ${milestones.map(m => `
        <tr>
          <td>Milestone ${m.milestone_number}</td>
          <td>${m.competency_area}</td>
          <td class="${m.latest_assessment ? `level-${m.latest_assessment.level}` : 'not-assessed'}">
            ${m.latest_assessment ? `Level ${m.latest_assessment.level} - ${levelLabels[m.latest_assessment.level]}` : 'Not Assessed'}
          </td>
          <td>${m.latest_assessment ? new Date(m.latest_assessment.assessment_date).toLocaleDateString() : '-'}</td>
          <td>${m.latest_assessment?.assessor_name || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by MedLog - Surgical & Medical Case E-Logbook</p>
    <p>This is an unofficial transcript for informational purposes only.</p>
  </div>
</body>
</html>
    `
  }

  const completedCount = milestones.filter(m => m.latest_assessment).length
  const averageLevel = milestones.reduce((sum, m) => sum + (m.latest_assessment?.level || 0), 0) / Math.max(milestones.length, 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestone Transcript</h1>
          <p className="text-gray-600">Official ACGME milestone assessment record</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          Export Transcript
        </button>
      </div>

      {/* Resident Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{resident?.full_name || 'Resident'}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4" />
                {resident?.institution_name || 'Institution'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm text-gray-500">Completion</div>
            <div className="text-2xl font-bold text-gray-900">
              {completedCount}/{milestones.length}
            </div>
            <div className="text-sm text-gray-500">milestones assessed</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Level</p>
              <p className="text-2xl font-bold text-gray-900">{averageLevel.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Level 4-5</p>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.filter(m => m.latest_assessment && m.latest_assessment.level >= 4).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {milestones.filter(m => m.latest_assessment && m.latest_assessment.level < 4).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Milestone Assessments</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      Milestone {milestone.milestone_number}
                    </span>
                    <h3 className="font-semibold text-gray-900">{milestone.competency_area}</h3>
                  </div>
                  
                  {milestone.latest_assessment ? (
                    <div className="flex items-center gap-4 mt-4">
                      <div className={`px-4 py-2 rounded-lg border ${levelColors[milestone.latest_assessment.level]}`}>
                        <span className="font-bold">Level {milestone.latest_assessment.level}</span>
                        <span className="ml-2">- {levelLabels[milestone.latest_assessment.level]}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Assessed: {new Date(milestone.latest_assessment.assessment_date).toLocaleDateString()}
                        {milestone.latest_assessment.assessor_name && ` by ${milestone.latest_assessment.assessor_name}`}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-gray-500 italic">Not yet assessed</div>
                  )}
                </div>

                <div className="text-right text-sm text-gray-500">
                  {milestone.latest_assessment?.notes}
                </div>
              </div>

              {/* Level Descriptions */}
              <div className="mt-4 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`p-2 rounded text-xs ${
                      milestone.latest_assessment?.level === level 
                        ? levelColors[level] 
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="font-medium mb-1">Level {level}</div>
                    <div className="line-clamp-3">
                      {level === 1 && milestone.level1_description}
                      {level === 2 && milestone.level2_description}
                      {level === 3 && milestone.level3_description}
                      {level === 4 && milestone.level4_description}
                      {level === 5 && milestone.level5_description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
