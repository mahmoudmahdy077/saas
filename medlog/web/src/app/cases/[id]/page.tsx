'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Loader2, 
  Brain, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Sparkles,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { specialties, roles, genders } from '@/lib/constants'

interface Case {
  id: string
  date: string
  procedure_type: string
  category: string
  subcategory: string | null
  role: string
  patient_demographics: {
    age: number
    gender: string
  }
  diagnosis: string
  complications: string[]
  notes: string
  ai_summary: string | null
  verification_status: string
  verified_by: string | null
  verified_at: string | null
  created_at: string
  images: any[]
  preop_images: any[]
  postop_images: any[]
}

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [userRole, setUserRole] = useState<string>('resident')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchCase()
  }, [params.id])

  const fetchCase = async () => {
    try {
      const [caseResponse, userResponse] = await Promise.all([
        fetch(`/api/cases/${params.id}`, { credentials: 'include' }),
        fetch('/api/auth/user', { credentials: 'include' })
      ])
      
      if (caseResponse.ok) {
        const data = await caseResponse.json()
        setCaseData(data.case)
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserRole(userData.profile?.role || 'resident')
          setIsOwner(userData.user?.id === data.case.user_id)
        }
      } else {
        router.push('/cases')
      }
    } catch (error) {
      console.error('Failed to fetch case:', error)
      router.push('/cases')
    } finally {
      setLoading(false)
    }
  }

  const generateAISummary = async () => {
    setGeneratingAI(true)
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: params.id }),
      })

      if (response.ok) {
        const data = await response.json()
        setCaseData(prev => prev ? { ...prev, ai_summary: data.summary } : null)
      }
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleImageUpload = async (imageType: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp,image/gif'
    input.multiple = true
    input.onchange = async (e: any) => {
      const files = e.target.files
      if (!files) return

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file as File)
        formData.append('caseId', params.id as string)
        formData.append('imageType', imageType)

        try {
          const response = await fetch('/api/cases/images', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          })

          if (response.ok) {
            const data = await response.json()
            setCaseData(prev => {
              if (!prev) return null
              const key = imageType === 'preop' ? 'preop_images' : imageType === 'postop' ? 'postop_images' : 'images'
              return { ...prev, [key]: [...(prev[key as keyof Case] as any[] || []), data.image] }
            })
          }
        } catch (error) {
          console.error('Upload failed:', error)
        }
      }
    }
    input.click()
  }

  const handleImageDelete = async (imageType: string, imageId: string) => {
    try {
      const params = new URLSearchParams({
        caseId: caseData!.id,
        imageId,
        imageType,
      })

      const response = await fetch(`/api/cases/images?${params}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setCaseData(prev => {
          if (!prev) return null
          const key = imageType === 'preop' ? 'preop_images' : imageType === 'postop' ? 'postop_images' : 'images'
          const images = (prev[key as keyof Case] as any[] || []).filter((img: any) => img.id !== imageId)
          return { ...prev, [key]: images }
        })
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'self': return 'bg-gray-100 text-gray-700'
      case 'consultant_verified': return 'bg-blue-100 text-blue-700'
      case 'pd_approved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'self': return 'Self-attested'
      case 'consultant_verified': return 'Consultant Verified'
      case 'pd_approved': return 'PD Approved'
      default: return status
    }
  }

  const getGenderLabel = (gender: string) => {
    return genders.find(g => g.value === gender)?.label || gender
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!caseData) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cases
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{caseData.procedure_type}</h1>
              <p className="text-gray-600">{specialties.find(s => s.id === caseData.category)?.name || caseData.category}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.verification_status)}`}>
              {getStatusLabel(caseData.verification_status)}
            </span>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
            </div>
            {!caseData.ai_summary && (
              <button
                onClick={generateAISummary}
                disabled={generatingAI}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </button>
            )}
          </div>
          {caseData.ai_summary ? (
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-gray-700">{caseData.ai_summary}</p>
            </div>
          ) : (
            <p className="text-gray-500">Click generate to get AI-powered educational insights for this case.</p>
          )}
        </div>

        {/* Case Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Date</label>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {new Date(caseData.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm t