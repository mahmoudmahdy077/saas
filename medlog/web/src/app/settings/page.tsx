'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  Loader2,
  CheckCircle,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  FileText,
  Download,
  X
} from 'lucide-react'

interface NotificationSettings {
  reminder_enabled: boolean
  reminder_time: string
  vacation_mode: boolean
}

interface Profile {
  full_name: string
  email: string
  role: string
  specialty_id: string | null
  notification_settings: NotificationSettings
  timezone: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(searchParams.get('success') === 'true' ? 'Subscription updated successfully!' : '')
  const [errorMessage, setErrorMessage] = useState(searchParams.get('cancelled') === 'true' ? 'Checkout was cancelled.' : '')
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [notificationPrefs, setNotificationPrefs] = useState<any>(null)
  const [loadingPrefs, setLoadingPrefs] = useState(false)

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchSubscription()
    }
    if (activeTab === 'invoices') {
      fetchInvoices()
    }
    if (activeTab === 'notifications') {
      fetchNotificationPrefs()
    }
  }, [activeTab])

  useEffect(() => {
    const planParam = searchParams.get('plan')
    if (planParam && activeTab === 'billing') {
      handleSubscribe(planParam)
    }
  }, [searchParams])

  const fetchSubscription = async () => {
    setLoadingSubscription(true)
    try {
      const response = await fetch('/api/subscription/portal', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const fetchInvoices = async () => {
    setLoadingInvoices(true)
    try {
      const response = await fetch('/api/invoices?limit=50', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setLoadingInvoices(false)
    }
  }

  const fetchNotificationPrefs = async () => {
    setLoadingPrefs(true)
    try {
      const response = await fetch('/api/notifications/preferences', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setNotificationPrefs(data.preferences)
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error)
    } finally {
      setLoadingPrefs(false)
    }
  }

  const handleNotificationPrefsChange = async (key: string, value: boolean | string) => {
    if (!notificationPrefs) return
    
    const updated = { ...notificationPrefs, [key]: value }
    setNotificationPrefs(updated)
    
    try {
      await fetch('/api/notifications/preferences', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
    }
  }

  const handleSubscribe = async (planName: string) => {
    if (planName === 'free' || planName === 'enterprise') return
    setCheckoutLoading(planName)
    setErrorMessage('')
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: planName, billingCycle })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      setErrorMessage('Failed to start checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_portal_session' })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setErrorMessage(data.error || 'Failed to open billing portal')
      }
    } catch (error) {
      setErrorMessage('Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }
    setPortalLoading(true)
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_subscription' })
      })
      const data = await response.json()
      if (data.success) {
        setSuccessMessage(`Subscription will be cancelled on ${new Date(data.cancelAt).toLocaleDateString()}`)
        fetchSubscription()
      } else {
        setErrorMessage(data.error || 'Failed to cancel subscription')
      }
    } catch (error) {
      setErrorMessage('Failed to cancel subscription')
    } finally {
      setPortalLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    fullName: '',
    timezone: 'UTC',
    notificationSettings: {
      reminder_enabled: true,
      reminder_time: '21:00',
      vacation_mode: false,
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
          setFormData({
            fullName: data.profile.full_name,
            timezone: data.profile.timezone || 'UTC',
            notificationSettings: data.profile.notification_settings || {
              reminder_enabled: true,
              reminder_time: '21:00',
              vacation_mode: false,
            },
          })
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          timezone: formData.timezone,
          notification_settings: formData.notificationSettings,
        }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="UTC">UTC (Universal Coordinated Time)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris (CET/CEST)</option>
                <option value="America/New_York">New York (EST/EDT)</option>
                <option value="America/Chicago">Chicago (CST/CDT)</option>
                <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Used for accurate streaks and notifications</p>
            </div>
          </div>
        </div>
        )}

        {/* Save Button for Profile */}
        {activeTab === 'profile' && (
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
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Bell className="h-5 w-5 text-accent-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Daily Reminder</p>
                <p className="text-sm text-gray-500">Get reminded to log your cases</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationSettings.reminder_enabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    notificationSettings: {
                      ...formData.notificationSettings,
                      reminder_enabled: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Time
              </label>
              <input
                type="time"
                value={formData.notificationSettings.reminder_time}
                onChange={(e) => setFormData({
                  ...formData,
                  notificationSettings: {
                    ...formData.notificationSettings,
                    reminder_time: e.target.value,
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Vacation Mode</p>
                <p className="text-sm text-gray-500">Pause notifications while away</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notificationSettings.vacation_mode}
                  onChange={(e) => setFormData({
                    ...formData,
                    notificationSettings: {
                      ...formData.notificationSettings,
                      vacation_mode: e.target.checked,
                    },
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* Notification Preferences */}
          {loadingPrefs ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : notificationPrefs && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Email & Push Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.email_enabled}
                      onChange={(e) => handleNotificationPrefsChange('email_enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Streak Alerts</p>
                    <p className="text-sm text-gray-500">Get notified about your logging streak</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.streak_alerts}
                      onChange={(e) => handleNotificationPrefsChange('streak_alerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Gap Alerts</p>
                    <p className="text-sm text-gray-500">Get notified about case minimum gaps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.gap_alerts}
                      onChange={(e) => handleNotificationPrefsChange('gap_alerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Verification Reminders</p>
                    <p className="text-sm text-gray-500">Reminders to verify resident cases</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.verification_reminders}
                      onChange={(e) => handleNotificationPrefsChange('verification_reminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Milestone Alerts</p>
                    <p className="text-sm text-gray-500">Notifications about milestone assessments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationPrefs.milestone_alerts}
                      onChange={(e) => handleNotificationPrefsChange('milestone_alerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Digest Frequency
                  </label>
                  <select
                    value={notificationPrefs.digest_frequency || 'daily'}
                    onChange={(e) => handleNotificationPrefsChange('digest_frequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Save Button for Notifications */}
        {activeTab === 'notifications' && (
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
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Billing & Subscription</h2>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {loadingSubscription ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : subscription && (subscription.plan !== 'free' || subscription.stripeSubscriptionId) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 capitalize">{subscription.plan} Plan</p>
                  <p className="text-sm text-gray-500">
                    Status: <span className={`font-medium ${
                      subscription.status === 'active' ? 'text-green-600' : 
                      subscription.status === 'cancelling' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{subscription.status}</span>
                  </p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-sm text-gray-500">
                      {subscription.cancelAtPeriodEnd ? 'Ends on: ' : 'Renews on: '}
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage Billing
                </button>
              </div>

              {subscription.status !== 'cancelled' && subscription.stripeSubscriptionId && (
                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">Cancel Subscription</p>
                      <p className="text-sm text-yellow-600">You will lose access to premium features at the end of your billing period.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={portalLoading}
                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    billingCycle === 'monthly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                    billingCycle === 'yearly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Save 17%</span>
                </button>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => handleSubscribe('basic')}
                  disabled={checkoutLoading === 'basic'}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Basic</p>
                    <p className="text-sm text-gray-500">$19/month or $190/year</p>
                  </div>
                  {checkoutLoading === 'basic' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <span className="text-primary-600 font-medium">Upgrade</span>
                  )}
                </button>

                <button
                  onClick={() => handleSubscribe('pro')}
                  disabled={checkoutLoading === 'pro'}
                  className="flex items-center justify-between p-4 border-2 border-gray-900 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Pro</p>
                    <p className="text-sm text-gray-500">$49/month or $490/year</p>
                  </div>
                  {checkoutLoading === 'pro' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <span className="text-primary-600 font-medium">Upgrade</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
          </div>

          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No invoices yet</p>
              <p className="text-sm">Invoices will appear here after your first payment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      invoice.status === 'paid' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        invoice.status === 'paid' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Invoice #{invoice.stripe_invoice_id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(invoice.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${parseFloat(invoice.amount).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' : 'Failed'}
                      </span>
                    </div>
                    {invoice.invoice_data?.hosted_invoice_url && (
                      <a
                        href={invoice.invoice_data.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        )}
        </form>
    </div>
  )
}
