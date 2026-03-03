'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Layout, 
  Settings, 
  Trash2, 
  Star, 
  StarOff,
  GripVertical,
  X,
  Save,
  Loader2,
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Activity
} from 'lucide-react'

interface DashboardWidget {
  id: string
  type: string
  title: string
  config: Record<string, any>
}

interface DashboardLayout {
  i: string
  x: number
  y: number
  w: number
  h: number
}

interface Dashboard {
  id: string
  institution_id: string
  name: string
  widgets: DashboardWidget[]
  layout: DashboardLayout[]
  is_default: boolean
  created_by: string
  created_at: string
  updated_at: string
}

const availableWidgets = [
  { type: 'cases_summary', title: 'Cases Summary', icon: FileText, defaultConfig: { period: '30d' } },
  { type: 'residents', title: 'Residents Overview', icon: Users, defaultConfig: {} },
  { type: 'milestones', title: 'Milestones Progress', icon: TrendingUp, defaultConfig: {} },
  { type: 'activity', title: 'Recent Activity', icon: Activity, defaultConfig: { limit: 10 } },
  { type: 'calendar', title: 'Case Calendar', icon: Calendar, defaultConfig: {} },
  { type: 'stats', title: 'Key Statistics', icon: BarChart3, defaultConfig: {} },
  { type: 'clock', title: 'Clock/Time', icon: Clock, defaultConfig: {} },
]

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null)
  const [formName, setFormName] = useState('')
  const [formWidgets, setFormWidgets] = useState<DashboardWidget[]>([])
  const [formIsDefault, setFormIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchDashboards()
  }, [])

  async function fetchDashboards() {
    try {
      const res = await fetch('/api/institution/dashboards')
      const data = await res.json()
      if (data.dashboards) {
        setDashboards(data.dashboards)
      }
    } catch (error) {
      console.error('Failed to fetch dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!formName.trim()) return
    
    setSaving(true)
    try {
      const action = editingDashboard?.id ? 'update' : 'create'
      const dashboard = {
        id: editingDashboard?.id,
        name: formName,
        widgets: formWidgets,
        layout: formWidgets.map((w, i) => ({
          i: w.id,
          x: (i % 3) * 4,
          y: Math.floor(i / 3) * 3,
          w: 4,
          h: 3
        })),
        is_default: formIsDefault
      }

      const res = await fetch('/api/institution/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, dashboard })
      })

      if (res.ok) {
        setShowCreateModal(false)
        setEditingDashboard(null)
        setFormName('')
        setFormWidgets([])
        setFormIsDefault(false)
        fetchDashboards()
      }
    } catch (error) {
      console.error('Failed to save dashboard:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(dashboard: Dashboard) {
    if (!confirm(`Delete dashboard "${dashboard.name}"?`)) return

    try {
      const res = await fetch('/api/institution/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', dashboard: { id: dashboard.id } })
      })

      if (res.ok) {
        fetchDashboards()
      }
    } catch (error) {
      console.error('Failed to delete dashboard:', error)
    }
  }

  async function handleSetDefault(dashboard: Dashboard) {
    try {
      const res = await fetch('/api/institution/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setDefault', dashboard: { id: dashboard.id } })
      })

      if (res.ok) {
        fetchDashboards()
      }
    } catch (error) {
      console.error('Failed to set default:', error)
    }
  }

  function openEditModal(dashboard: Dashboard) {
    setEditingDashboard(dashboard)
    setFormName(dashboard.name)
    setFormWidgets(dashboard.widgets || [])
    setFormIsDefault(dashboard.is_default)
    setShowCreateModal(true)
  }

  function addWidget(widgetType: typeof availableWidgets[0]) {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      title: widgetType.title,
      config: { ...widgetType.defaultConfig }
    }
    setFormWidgets([...formWidgets, newWidget])
  }

  function removeWidget(widgetId: string) {
    setFormWidgets(formWidgets.filter(w => w.id !== widgetId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Dashboards</h1>
          <p className="text-gray-600 mt-1">Create and manage custom dashboard views for your institution</p>
        </div>
        <button
          onClick={() => {
            setEditingDashboard(null)
            setFormName('')
            setFormWidgets([])
            setFormIsDefault(false)
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Create Dashboard
        </button>
      </div>

      {dashboards.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Layout className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboards Yet</h3>
          <p className="text-gray-600 mb-4">Create your first custom dashboard to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {dashboard.name}
                    {dashboard.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    {!dashboard.is_default && (
                      <button
                        onClick={() => handleSetDefault(dashboard)}
                        className="p-1.5 text-gray-400 hover:text-yellow-500"
                        title="Set as default"
                      >
                        <StarOff className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(dashboard)}
                      className="p-1.5 text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dashboard)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(dashboard.widgets || []).map((widget) => (
                    <span
                      key={widget.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                    >
                      {widget.title}
                    </span>
                  ))}
                  {(dashboard.widgets || []).length === 0 && (
                    <span className="text-sm text-gray-500">No widgets</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {dashboard.widgets?.length || 0} widgets • Created {new Date(dashboard.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingDashboard ? 'Edit Dashboard' : 'Create Dashboard'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Monthly Overview"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Set as default dashboard</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Widgets
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {availableWidgets.map((widget) => (
                    <button
                      key={widget.type}
                      onClick={() => addWidget(widget)}
                      className="flex flex-col items-center gap-1 p-3 border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      <widget.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-xs text-center">{widget.title}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {formWidgets.map((widget, index) => (
                    <div
                      key={widget.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="flex-1 text-sm font-medium">{widget.title}</span>
                      <span className="text-xs text-gray-500">{widget.type}</span>
                      <button
                        onClick={() => removeWidget(widget.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formWidgets.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Click widgets above to add them to your dashboard
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formName.trim() || saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Dashboard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
