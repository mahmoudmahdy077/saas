'use client'

import { useEffect, useState } from 'react'
import { 
  Search, 
  ExternalLink, 
  Check, 
  X, 
  Loader2,
  Settings,
  Trash2,
  RefreshCw,
  Zap,
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  BarChart2,
  Database,
  MoreHorizontal
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  slug: string
  description: string
  logo_url: string
  category: string
  provider: string
  website_url: string
  documentation_url: string
  auth_type: string
  is_verified: boolean
  is_featured: boolean
  pricing_model: string
  monthly_cost: number
}

interface ConnectedIntegration extends Integration {
  config: Record<string, any>
  auth_credentials: Record<string, any>
  is_active: boolean
  last_sync_at: string
  created_at: string
}

const categoryIcons: Record<string, any> = {
  erp: Database,
  lms: BookOpen,
  hris: Users,
  calendar: Calendar,
  messaging: MessageSquare,
  analytics: BarChart2,
  storage: Database,
  other: MoreHorizontal
}

const categoryLabels: Record<string, string> = {
  erp: 'ERP Systems',
  lms: 'Learning Management',
  hris: 'HR Information Systems',
  calendar: 'Calendar',
  messaging: 'Messaging',
  analytics: 'Analytics',
  storage: 'Storage',
  other: 'Other'
}

const sampleIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Workday',
    slug: 'workday',
    description: 'Enterprise HR and financial management platform',
    logo_url: '',
    category: 'hris',
    provider: 'Workday Inc.',
    website_url: 'https://workday.com',
    documentation_url: 'https://workday.com/docs',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'subscription',
    monthly_cost: 0
  },
  {
    id: '2',
    name: 'SAP SuccessFactors',
    slug: 'sap-successfactors',
    description: 'Cloud-based HR software for talent management',
    logo_url: '',
    category: 'hris',
    provider: 'SAP',
    website_url: 'https://sap.com',
    documentation_url: 'https://sap.com/docs',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'subscription',
    monthly_cost: 0
  },
  {
    id: '3',
    name: 'Canvas LMS',
    slug: 'canvas-lms',
    description: 'Learning management system for medical education',
    logo_url: '',
    category: 'lms',
    provider: 'Instructure',
    website_url: 'https://canvaslms.com',
    documentation_url: 'https://canvaslms.com/docs',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'subscription',
    monthly_cost: 0
  },
  {
    id: '4',
    name: 'Blackboard',
    slug: 'blackboard',
    description: 'Educational platform for course management',
    logo_url: '',
    category: 'lms',
    provider: 'Anthology',
    website_url: 'https://blackboard.com',
    documentation_url: 'https://blackboard.com/docs',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: false,
    pricing_model: 'subscription',
    monthly_cost: 0
  },
  {
    id: '5',
    name: 'Microsoft Teams',
    slug: 'microsoft-teams',
    description: 'Communication and collaboration platform',
    logo_url: '',
    category: 'messaging',
    provider: 'Microsoft',
    website_url: 'https://teams.microsoft.com',
    documentation_url: 'https://docs.microsoft.com/teams',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'subscription',
    monthly_cost: 0
  },
  {
    id: '6',
    name: 'Slack',
    slug: 'slack',
    description: 'Business messaging and collaboration',
    logo_url: '',
    category: 'messaging',
    provider: 'Salesforce',
    website_url: 'https://slack.com',
    documentation_url: 'https://api.slack.com',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: false,
    pricing_model: 'free',
    monthly_cost: 0
  },
  {
    id: '7',
    name: 'Google Calendar',
    slug: 'google-calendar',
    description: 'Calendar integration for scheduling',
    logo_url: '',
    category: 'calendar',
    provider: 'Google',
    website_url: 'https://calendar.google.com',
    documentation_url: 'https://developers.google.com/calendar',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'free',
    monthly_cost: 0
  },
  {
    id: '8',
    name: 'Microsoft Power BI',
    slug: 'power-bi',
    description: 'Business analytics and data visualization',
    logo_url: '',
    category: 'analytics',
    provider: 'Microsoft',
    website_url: 'https://powerbi.microsoft.com',
    documentation_url: 'https://docs.microsoft.com/power-bi',
    auth_type: 'oauth2',
    is_verified: true,
    is_featured: true,
    pricing_model: 'subscription',
    monthly_cost: 0
  }
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(sampleIntegrations)
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  useEffect(() => {
    fetchConnectedIntegrations()
  }, [])

  async function fetchConnectedIntegrations() {
    try {
      const res = await fetch('/api/institution/integrations')
      const data = await res.json()
      if (data.integrations) {
        setConnectedIntegrations(data.integrations)
      }
    } catch (error) {
      console.error('Failed to fetch connected integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(integration: Integration) {
    setSelectedIntegration(integration)
    setShowConnectModal(true)
  }

  async function confirmConnect() {
    if (!selectedIntegration) return

    setConnectingId(selectedIntegration.id)
    try {
      const res = await fetch('/api/institution/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'connect',
          integrationId: selectedIntegration.id,
          config: {},
          credentials: {}
        })
      })

      if (res.ok) {
        setShowConnectModal(false)
        setSelectedIntegration(null)
        fetchConnectedIntegrations()
      }
    } catch (error) {
      console.error('Failed to connect:', error)
    } finally {
      setConnectingId(null)
    }
  }

  async function handleDisconnect(integrationId: string) {
    if (!confirm('Disconnect this integration?')) return

    try {
      const res = await fetch('/api/institution/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          integrationId
        })
      })

      if (res.ok) {
        fetchConnectedIntegrations()
      }
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || integration.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const connectedIds = new Set(connectedIntegrations.map(i => i.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integration Marketplace</h1>
        <p className="text-gray-600 mt-1">Connect MedLog with your favorite tools and services</p>
      </div>

      {connectedIntegrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white rounded-lg shadow border border-green-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {categoryIcons[integration.category] ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Zap className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{integration.name}</h3>
                      <p className="text-xs text-gray-500">{integration.provider}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Connected
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIntegrations.map((integration) => {
            const isConnected = connectedIds.has(integration.id)
            const Icon = categoryIcons[integration.category] || Zap

            return (
              <div
                key={integration.id}
                className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
                  isConnected ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {integration.logo_url ? (
                      <img src={integration.logo_url} alt={integration.name} className="w-8 h-8" />
                    ) : (
                      <Icon className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      {integration.is_verified && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{integration.provider}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span className="px-2 py-1 bg-gray-100 rounded">{categoryLabels[integration.category]}</span>
                  <span>{integration.pricing_model === 'free' ? 'Free' : integration.pricing_model}</span>
                </div>

                <button
                  onClick={() => handleConnect(integration)}
                  disabled={isConnected || connectingId === integration.id}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isConnected
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {connectingId === integration.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : isConnected ? (
                    <>
                      <Check className="w-4 h-4" />
                      Connected
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Connect {selectedIntegration.name}</h2>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                You are about to connect MedLog with {selectedIntegration.name}. 
                You will be redirected to authorize the connection.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Provider:</strong> {selectedIntegration.provider}<br />
                  <strong>Authentication:</strong> {selectedIntegration.auth_type.toUpperCase()}<br />
                  <strong>Category:</strong> {categoryLabels[selectedIntegration.category]}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                By connecting, you agree to {selectedIntegration.name}'s terms of service and privacy policy.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowConnectModal(false)
                  setSelectedIntegration(null)
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmConnect}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Authorize Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
