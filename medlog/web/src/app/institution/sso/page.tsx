'use client'

import { useEffect, useState } from 'react'
import { 
  Shield, 
  Key, 
  Loader2, 
  Save, 
  CheckCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Info
} from 'lucide-react'

interface SAMLConfig {
  id: string
  idp_entity_id: string
  idp_sso_url: string
  idp_certificate: string
  sp_entity_id: string
  acs_url: string
  name_id_format: string
  enabled: boolean
}

export default function SSOSettingsPage() {
  const [config, setConfig] = useState<SAMLConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://medlog.app'

  const [formData, setFormData] = useState({
    idp_entity_id: '',
    idp_sso_url: '',
    idp_certificate: '',
    name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    enabled: false
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/institution/sso', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.saml) {
          setConfig(data.saml)
          setFormData({
            idp_entity_id: data.saml.idp_entity_id || '',
            idp_sso_url: data.saml.idp_sso_url || '',
            idp_certificate: data.saml.idp_certificate || '',
            name_id_format: data.saml.name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            enabled: data.saml.enabled || false
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch SSO config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')

    try {
      const spEntityId = `${appUrl}/saml/${config?.id || 'new'}`
      const acsUrl = `${appUrl}/api/auth/saml/callback`

      const response = await fetch('/api/institution/sso', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          config: {
            ...formData,
            sp_entity_id: spEntityId,
            acs_url: acsUrl
          }
        })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        fetchConfig()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save configuration')
      }
    } catch (error) {
      setError('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setError('')

    try {
      const response = await fetch('/api/institution/sso', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
      } else {
        setError(data.error || 'Test failed')
      }
    } catch (error) {
      setError('Test failed')
    } finally {
      setTesting(false)
    }
  }

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable SSO? Users will need to use email/password to log in.')) {
      return
    }

    try {
      await fetch('/api/institution/sso', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' })
      })
      fetchConfig()
    } catch (error) {
      console.error('Failed to disable SSO:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the SSO configuration? This cannot be undone.')) {
      return
    }

    try {
      await fetch('/api/institution/sso', {
        method: 'DELETE',
        credentials: 'include'
      })
      setConfig(null)
      setFormData({
        idp_entity_id: '',
        idp_sso_url: '',
        idp_certificate: '',
        name_id_format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        enabled: false
      })
    } catch (error) {
      console.error('Failed to delete SSO config:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">SSO / SAML Integration</h1>
        <p className="text-gray-600">Configure Single Sign-On for your institution (Enterprise only)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported Providers</p>
            <p>Okta, Azure AD, Google Workspace, OneLogin, Auth0, and any SAML 2.0 compatible IdP</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {config?.enabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">SSO is Enabled</p>
              <p className="text-sm text-green-600">Users can now log in using your identity provider</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* IdP Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity Provider (IdP) Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IdP Entity ID
              </label>
              <input
                type="text"
                value={formData.idp_entity_id}
                onChange={(e) => setFormData({ ...formData, idp_entity_id: e.target.value })}
                placeholder="https://your-idp.com/abc123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Provided by your identity provider</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IdP SSO URL
              </label>
              <input
                type="url"
                value={formData.idp_sso_url}
                onChange={(e) => setFormData({ ...formData, idp_sso_url: e.target.value })}
                placeholder="https://your-idp.com/sso/saml"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IdP Certificate (X.509)
              </label>
              <textarea
                value={formData.idp_certificate}
                onChange={(e) => setFormData({ ...formData, idp_certificate: e.target.value })}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name ID Format
              </label>
              <select
                value={formData.name_id_format}
                onChange={(e) => setFormData({ ...formData, name_id_format: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">Email (Default)</option>
                <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">Persistent</option>
                <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">Transient</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Provider Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Provider (SP) Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SP Entity ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${appUrl}/saml/`}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
                <span className="text-gray-400 self-center">auto-generated</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assertion Consumer Service (ACS) URL
              </label>
              <input
                type="text"
                value={`${appUrl}/api/auth/saml/callback`}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Instructions</h3>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>Enter your IdP's Entity ID and SSO URL above</li>
                <li>Paste your IdP's X.509 certificate</li>
                <li>Use the SP Entity ID and ACS URL to configure your IdP</li>
                <li>Save and test the configuration</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {config && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                Delete
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            {config && config.enabled && (
              <button
                type="button"
                onClick={handleDisable}
                className="px-4 py-2 text-yellow-600 border border-yellow-200 rounded-lg hover:bg-yellow-50"
              >
                Disable SSO
              </button>
            )}
            
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !config?.id}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test'}
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Configuration
            </button>
          </div>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Configuration saved successfully!
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
