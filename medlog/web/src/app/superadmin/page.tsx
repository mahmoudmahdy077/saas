'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Settings,
  Bell,
  Brain,
  Building2,
  CreditCard,
  Shield,
  Save,
  Trash2,
  Plus,
  Search,
  Ban,
  Check,
  X,
  Send,
  TestTube,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

type Tab = 'users' | 'notifications' | 'settings' | 'ai' | 'institutions' | 'payment'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_banned: boolean
  created_at: string
}

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  sent_at: string
}

interface Setting {
  key: string
  value: any
  description: string
}

interface AIProvider {
  id: string
  name: string
  api_key: string
  api_url: string
  model: string
  is_active: boolean
  is_default: boolean
  settings: any
}

interface Institution {
  id: string
  name: string
  admin_name: string
  admin_email: string
  resident_count: number
  pd_count: number
  plan: string
  max_residents: number
  ai_features_enabled: boolean
}

export default function SuperAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [user, setUser] = useState<any>(null)
  
  const [users, setUsers] = useState<User[]>([])
  const [userStats, setUserStats] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [newNotification, setNewNotification] = useState({ title: '', message: '', type: 'info', targetRoles: ['resident'] })
  
  const [settings, setSettings] = useState<Setting[]>([])
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({})
  
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([])
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [newInstitution, setNewInstitution] = useState({ name: '', adminEmail: '', plan: 'free', maxResidents: 5, maxCasesPerResident: 100, aiFeatures: false })
  
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [stripeConfig, setStripeConfig] = useState({ secretKey: '', webhookSecret: '', priceIds: { basic: '', pro: '' }, isActive: false })

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user?.role === 'super_admin') {
      loadData()
    }
  }, [user, activeTab])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/user', { credentials: 'include' })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      const profile = data.profile || { role: 'resident' }
      setUser({ ...data.user, ...profile })
      if (profile.role !== 'super_admin') {
        router.push('/dashboard')
      }
    } catch {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    if (activeTab === 'users') {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users?action=list', { credentials: 'include' }),
        fetch('/api/admin/users?action=stats', { credentials: 'include' })
      ])
      if (usersRes.ok) setUsers((await usersRes.json()).users)
      if (statsRes.ok) setUserStats(await statsRes.json())
    }
    if (activeTab === 'notifications') {
      const res = await fetch('/api/admin/notifications?action=list', { credentials: 'include' })
      if (res.ok) setNotifications((await res.json()).notifications)
    }
    if (activeTab === 'settings') {
      const res = await fetch('/api/admin/settings', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
        const obj: Record<string, any> = {}
        data.settings.forEach((s: Setting) => { obj[s.key] = s.value })
        setLocalSettings(obj)
      }
    }
    if (activeTab === 'ai') {
      const res = await fetch('/api/admin/ai-providers', { credentials: 'include' })
      if (res.ok) setAiProviders((await res.json()).providers)
    }
    if (activeTab === 'institutions') {
      const res = await fetch('/api/admin/institutions?action=list', { credentials: 'include' })
      if (res.ok) setInstitutions((await res.json()).institutions)
    }
    if (activeTab === 'payment') {
      const res = await fetch('/api/admin/payment', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.settings[0]) {
          setPaymentSettings(data.settings[0])
          setStripeConfig({
            secretKey: data.settings[0].stripe_secret_key || '',
            webhookSecret: data.settings[0].stripe_webhook_secret || '',
            priceIds: data.settings[0].stripe_price_ids || { basic: '', pro: '' },
            isActive: data.settings[0].is_active
          })
        }
      }
    }
  }

  const handleUserAction = async (action: string, userId: string, data?: any) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action, userId, ...data })
    })
    if (res.ok) {
      loadData()
      setSelectedUser(null)
    }
  }

  const handleSaveSettings = async () => {
    const settingsArray = Object.entries(localSettings).map(([key, value]) => ({ key, value }))
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ settings: settingsArray })
    })
    loadData()
  }

  const handleSaveAIProvider = async (provider: AIProvider) => {
    await fetch('/api/admin/ai-providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'save', provider })
    })
    loadData()
  }

  const handleTestAIProvider = async (providerId: string) => {
    setTestingProvider(providerId)
    const res = await fetch('/api/admin/ai-providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'test', provider: { id: providerId } })
    })
    const data = await res.json()
    alert(data.message)
    setTestingProvider(null)
  }

  const handleSendNotification = async () => {
    await fetch('/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'send', ...newNotification })
    })
    setNewNotification({ title: '', message: '', type: 'info', targetRoles: ['resident'] })
    loadData()
  }

  const handleCreateInstitution = async () => {
    await fetch('/api/admin/institutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'create', ...newInstitution })
    })
    setNewInstitution({ name: '', adminEmail: '', plan: 'free', maxResidents: 5, maxCasesPerResident: 100, aiFeatures: false })
    loadData()
  }

  const handleSavePayment = async () => {
    await fetch('/api/admin/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: 'saveStripe',
        stripeSecretKey: stripeConfig.secretKey,
        stripeWebhookSecret: stripeConfig.webhookSecret,
        stripePriceIds: stripeConfig.priceIds,
        isActive: stripeConfig.isActive
      })
    })
    loadData()
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (user?.role !== 'super_admin') {
    return null
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'ai', label: 'AI Providers', icon: Brain },
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'payment', label: 'Payment', icon: CreditCard },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Super Admin Panel</h1>
              <p className="text-sm text-gray-500">Manage your MedLog application</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <div className="w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <StatCard label="Total Users" value={userStats.total_users} />
                  <StatCard label="Residents" value={userStats.residents} />
                  <StatCard label="Institutions" value={userStats.institutions} />
                  <StatCard label="Banned" value={userStats.banned} color="red" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-2">User</th>
                        <th className="text-left py-3 px-2">Role</th>
                        <th className="text-left py-3 px-2">Status</th>
                        <th className="text-left py-3 px-2">Joined</th>
                        <th className="text-left py-3 px-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{u.full_name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{u.email}</div>
                          </td>
                          <td className="py-3 px-2">
                            <select
                              value={u.role}
                              onChange={e => handleUserAction('changeRole', u.id, { role: e.target.value })}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="resident">Resident</option>
                              <option value="consultant">Consultant</option>
                              <option value="program_director">PD</option>
                              <option value="institution_admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </td>
                          <td className="py-3 px-2">
                            {u.is_banned ? (
                              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Banned</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            {u.is_banned ? (
                              <button onClick={() => handleUserAction('unban', u.id)} className="text-green-600 hover:text-green-700">
                                <Check className="h-4 w-4" />
                              </button>
                            ) : (
                              <button onClick={() => setSelectedUser(u)} className="text-red-600 hover:text-red-700">
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-semibold mb-4">Send Notification</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={newNotification.title}
                      onChange={e => setNewNotification({ ...newNotification, title: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    <textarea
                      placeholder="Message"
                      value={newNotification.message}
                      onChange={e => setNewNotification({ ...newNotification, message: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 h-24"
                    />
                    <div className="flex gap-4">
                      <select
                        value={newNotification.type}
                        onChange={e => setNewNotification({ ...newNotification, type: e.target.value })}
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="alert">Alert</option>
                      </select>
                      <button
                        onClick={handleSendNotification}
                        disabled={!newNotification.title || !newNotification.message}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" /> Send
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notification History</h3>
                  </div>
                  <div className="divide-y">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{n.title}</h4>
                          <span className="text-sm text-gray-500">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold mb-4">Website Settings</h3>
                <div className="space-y-4">
                  {settings.map(s => (
                    <div key={s.key} className="flex items-center justify-between py-3 border-b">
                      <div>
                        <label className="font-medium block">{s.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                        <p className="text-sm text-gray-500">{s.description}</p>
                      </div>
                      {s.key === 'site_logo' || s.key === 'site_favicon' ? (
                        <input
                          type="text"
                          value={localSettings[s.key] || ''}
                          onChange={e => setLocalSettings({ ...localSettings, [s.key]: e.target.value })}
                          placeholder="URL"
                          className="border rounded-lg px-3 py-2 w-64"
                        />
                      ) : s.key === 'maintenance_mode' || s.key === 'ai_enabled' || s.key === 'allow_registration' ? (
                        <input
                          type="checkbox"
                          checked={localSettings[s.key] === true}
                          onChange={e => setLocalSettings({ ...localSettings, [s.key]: e.target.checked })}
                          className="h-5 w-5"
                        />
                      ) : (
                        <input
                          type="text"
                          value={localSettings[s.key] || ''}
                          onChange={e => setLocalSettings({ ...localSettings, [s.key]: e.target.value })}
                          className="border rounded-lg px-3 py-2 w-64"
                        />
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                  >
                    <Save className="h-4 w-4" /> Save Settings
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                {aiProviders.map(provider => (
                  <div key={provider.id} className="bg-white rounded-xl shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Brain className="h-6 w-6 text-purple-600" />
                        <h3 className="font-semibold capitalize">{provider.name}</h3>
                        {provider.is_default && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Default</span>}
                        {provider.is_active && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>}
                      </div>
                      <button
                        onClick={() => handleTestAIProvider(provider.id)}
                        disabled={testingProvider === provider.id}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                      >
                        {testingProvider === provider.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                        Test
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">API Key</label>
                        <input
                          type="password"
                          value={provider.api_key || ''}
                          onChange={e => setAiProviders(aiProviders.map(p => p.id === provider.id ? { ...p, api_key: e.target.value } : p))}
                          placeholder="sk-..."
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">API URL</label>
                        <input
                          type="text"
                          value={provider.api_url || ''}
                          onChange={e => setAiProviders(aiProviders.map(p => p.id === provider.id ? { ...p, api_url: e.target.value } : p))}
                          placeholder="https://api.example.com"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <input
                          type="text"
                          value={provider.model || ''}
                          onChange={e => setAiProviders(aiProviders.map(p => p.id === provider.id ? { ...p, model: e.target.value } : p))}
                          placeholder="gpt-3.5-turbo"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={provider.is_active}
                            onChange={e => setAiProviders(aiProviders.map(p => p.id === provider.id ? { ...p, is_active: e.target.checked } : p))}
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={provider.is_default}
                            onChange={e => setAiProviders(aiProviders.map(p => p.id === provider.id ? { ...p, is_default: e.target.checked } : p))}
                          />
                          Default
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleSaveAIProvider(provider)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                      >
                        <Save className="h-4 w-4" /> Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'institutions' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="font-semibold mb-4">Add Institution</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Institution Name"
                      value={newInstitution.name}
                      onChange={e => setNewInstitution({ ...newInstitution, name: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                    />
                    <input
                      type="email"
                      placeholder="Admin Email"
                      value={newInstitution.adminEmail}
                      onChange={e => setNewInstitution({ ...newInstitution, adminEmail: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                    />
                    <select
                      value={newInstitution.plan}
                      onChange={e => setNewInstitution({ ...newInstitution, plan: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Max Residents"
                      value={newInstitution.maxResidents}
                      onChange={e => setNewInstitution({ ...newInstitution, maxResidents: parseInt(e.target.value) })}
                      className="border rounded-lg px-3 py-2"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newInstitution.aiFeatures}
                        onChange={e => setNewInstitution({ ...newInstitution, aiFeatures: e.target.checked })}
                      />
                      AI Features Enabled
                    </label>
                  </div>
                  <button
                    onClick={handleCreateInstitution}
                    disabled={!newInstitution.name}
                    className="mt-4 flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" /> Add Institution
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Institutions</h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Admin</th>
                        <th className="text-left py-3 px-4">Plan</th>
                        <th className="text-left py-3 px-4">Residents</th>
                        <th className="text-left py-3 px-4">AI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutions.map(i => (
                        <tr key={i.id} className="border-t">
                          <td className="py-3 px-4 font-medium">{i.name}</td>
                          <td className="py-3 px-4 text-sm">{i.admin_email || 'N/A'}</td>
                          <td className="py-3 px-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs uppercase">{i.plan}</span></td>
                          <td className="py-3 px-4">{i.resident_count}/{i.max_residents}</td>
                          <td className="py-3 px-4">{i.ai_features_enabled ? '✓' : '✗'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-green-600" />
                    <h3 className="font-semibold">Stripe Payment Gateway</h3>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={stripeConfig.isActive}
                      onChange={e => setStripeConfig({ ...stripeConfig, isActive: e.target.checked })}
                    />
                    Enable Payments
                  </label>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Stripe Secret Key</label>
                    <input
                      type="password"
                      value={stripeConfig.secretKey}
                      onChange={e => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                      placeholder="sk_live_..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Webhook Secret</label>
                    <input
                      type="password"
                      value={stripeConfig.webhookSecret}
                      onChange={e => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
                      placeholder="whsec_..."
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Basic Plan Price ID</label>
                      <input
                        type="text"
                        value={stripeConfig.priceIds.basic}
                        onChange={e => setStripeConfig({ ...stripeConfig, priceIds: { ...stripeConfig.priceIds, basic: e.target.value } })}
                        placeholder="price_..."
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Pro Plan Price ID</label>
                      <input
                        type="text"
                        value={stripeConfig.priceIds.pro}
                        onChange={e => setStripeConfig({ ...stripeConfig, priceIds: { ...stripeConfig.priceIds, pro: e.target.value } })}
                        placeholder="price_..."
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSavePayment}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                  >
                    <Save className="h-4 w-4" /> Save Payment Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 ${color ? 'border-' + color + '-200' : ''}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color ? 'text-' + color + '-600' : 'text-gray-900'}`}>{value || 0}</p>
    </div>
  )
}
