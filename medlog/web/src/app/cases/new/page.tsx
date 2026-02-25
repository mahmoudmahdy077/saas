'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { specialties, roles, genders, complications } from '@/lib/constants'

const defaultProcedures: Record<string, string[]> = {
  'general-surgery': [
    'Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Bowel Resection',
    'Mastectomy', 'Thyroidectomy', 'Splenectomy', 'Adrenalectomy'
  ],
  'orthopedics': [
    'Knee Arthroscopy', 'Hip Replacement', 'Knee Replacement', 'ACL Reconstruction',
    'Rotator Cuff Repair', 'Spinal Fusion', 'Fracture Fixation'
  ],
  'internal-medicine': [
    'Colonoscopy', 'EGD', 'Bronchoscopy', 'Lumbar Puncture',
    'Paracentesis', 'Thoracentesis', 'Central Line'
  ],
}

export default function NewCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    procedure_type: '',
    subcategory: '',
    role: 'primary',
    patient_age: '',
    patient_gender: 'prefer-not-to-say',
    diagnosis: '',
    selectedComplications: [] as string[],
    notes: '',
  })

  const availableProcedures = formData.category 
    ? defaultProcedures[formData.category] || []
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          category: formData.category,
          procedure_type: formData.procedure_type,
          subcategory: formData.subcategory || null,
          role: formData.role,
          patient_demographics: {
            age: parseInt(formData.patient_age) || 0,
            gender: formData.patient_gender,
          },
          diagnosis: formData.diagnosis,
          complications: formData.selectedComplications,
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save case')
      }

      router.push('/cases')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save case')
    } finally {
      setLoading(false)
    }
  }

  const toggleComplication = (comp: string) => {
    setFormData(prev => ({
      ...prev,
      selectedComplications: prev.selectedComplications.includes(comp)
        ? prev.selectedComplications.filter(c => c !== comp)
        : [...prev.selectedComplications, comp]
    }))
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/cases"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cases
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Log New Case</h1>
        <p className="text-gray-600">Record a new procedure or patient encounter</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Procedure
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty / Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, procedure_type: '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select specialty</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedure Type
              </label>
              <select
                value={formData.procedure_type}
                onChange={(e) => setFormData({ ...formData, procedure_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
                disabled={!formData.category}
              >
                <option value="">Select procedure</option>
                {availableProcedures.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Demographics</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Age
              </label>
              <input
                type="number"
                value={formData.patient_age}
                onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter age"
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient Gender
              </label>
              <select
                value={formData.patient_gender}
                onChange={(e) => setFormData({ ...formData, patient_gender: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complications
              </label>
              <div className="flex flex-wrap gap-2">
                {complications.map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleComplication(comp)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.selectedComplications.includes(comp)
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add any additional notes..."
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/cases"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Case
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
