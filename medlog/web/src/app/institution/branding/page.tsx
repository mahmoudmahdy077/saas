'use client'

import { useEffect, useState } from 'react'
import { 
  Palette, 
  Upload, 
  Loader2, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react'

interface Branding {
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  custom_css: string | null
  custom_domain: string | null
  white_label_enabled: boolean
}

const defaultBranding = {
  primary_color: '#2563eb',
  secondary_color: '#64748b',
  accent_color: '#10b981'
}

export default function BrandingSettingsPage() {
  const [branding, setBranding] = useState<Branding | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState({
    logo_url: '',
    primary_color: defaultBranding.primary_color,
    secondary_color: defaultBranding.secondary_color,
    accent_color: defaultBranding.accent_color,
    custom_css: '',
    custom_domain: '',
    white_label_enabled: false
  })

  useEffect(() => {
    fetchBranding()
  }, [])

  const fetchBranding = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/institution/branding', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setBranding(data.branding)
        setFormData({
          logo_url: data.branding.logo_url || '',
          primary_color: data.branding.primary_color || defaultBranding.primary_color,
          secondary_color: data.branding.secondary_color || defaultBranding.secondary_color,
          accent_color: data.branding.accent_color || defaultBranding.accent_color,
          custom_css: data.branding.custom_css || '',
          custom_domain: data.branding.custom_domain || '',
          white_label_enabled: data.branding.white_label_enabled || false
        })
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/institution/branding', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to save branding:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/cases/images', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, logo_url: data.url })
      }
    } catch (error) {
      console.error('Failed to upload logo:', error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Custom Branding</h1>
        <p className="text-gray-600">Customize your institution's appearance (Pro/Enterprise only)</p>
      </div>

      {!branding?.white_label_enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            White-label branding is only available on Pro and Enterprise plans. 
            Upgrade to unlock custom branding features.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo</h2>
          
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {formData.logo_url ? (
                <img 
                  src={formData.logo_url} 
                  alt="Logo" 
                  className="h-24 w-24 object-contain border border-gray-200 rounded-lg"
                />
              ) : (
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <Palette className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Recommended: 512x512px, PNG or JPG</p>
            </div>
          </div>
        </div>

        {/* Color Scheme */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Buttons, links, headers</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Text, borders, backgrounds</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Success states, highlights</p>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 rounded-lg border border-gray-200" style={{ backgroundColor: formData.secondary_color + '10' }}>
            <h3 className="text-sm font-medium mb-2">Preview</h3>
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: formData.primary_color }}
              >
                Primary Button
              </button>
              <button 
                className="px-4 py-2 rounded-lg border font-medium"
                style={{ borderColor: formData.accent_color, color: formData.accent_color }}
              >
                Accent Button
              </button>
            </div>
          </div>
        </div>

        {/* Custom Domain */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Custom Domain</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Domain
            </label>
            <input
              type="text"
              value={formData.custom_domain}
              onChange={(e) => setFormData({ ...formData, custom_domain: e.target.value })}
              placeholder="cases.yourinstitution.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Point your domain's CNAME record to medlog.app and enter it here
            </p>
          </div>
        </div>

        {/* Custom CSS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Custom CSS</h2>
          
          <div>
            <textarea
              value={formData.custom_css}
              onChange={(e) => setFormData({ ...formData, custom_css: e.target.value })}
              placeholder=".custom-class { ... }"
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add custom CSS to further customize your instance
            </p>
          </div>
        </div>

        {/* White Label Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">White Label</h2>
              <p className="text-sm text-gray-500">Remove MedLog branding and use your own</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.white_label_enabled}
                onChange={(e) => setFormData({ ...formData, white_label_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              Saved!
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
