'use client'

import { useEffect, useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  FileText,
  User,
  Settings,
  CreditCard,
  AlertCircle
} from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  user_name: string
  user_email: string
  institution_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address: string
  created_at: string
}

const actionLabels: Record<string, string> = {
  'case.create': 'Created Case',
  'case.update': 'Updated Case',
  'case.delete': 'Deleted Case',
  'case.verify': 'Verified Case',
  'case.export': 'Exported Cases',
  'user.invite': 'Invited User',
  'user.create': 'Created User',
  'user.update': 'Updated User',
  'user.delete': 'Deleted User',
  'user.login': 'User Login',
  'user.logout': 'User Logout',
  'institution.create': 'Created Institution',
  'institution.update': 'Updated Institution',
  'template.create': 'Created Template',
  'template.update': 'Updated Template',
  'template.delete': 'Deleted Template',
  'report.generate': 'Generated Report',
  'report.export': 'Exported Report',
  'subscription.create': 'Created Subscription',
  'subscription.update': 'Updated Subscription',
  'subscription.cancel': 'Cancelled Subscription',
  'settings.update': 'Updated Settings',
  'grade.create': 'Created Grade',
  'grade.update': 'Updated Grade',
  'milestone.assess': 'Assessed Milestone',
  'bulk.import': 'Bulk Import',
  'ai.analysis': 'AI Analysis',
}

const resourceTypeColors: Record<string, string> = {
  case: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
  institution: 'bg-purple-100 text-purple-700',
  template: 'bg-yellow-100 text-yellow-700',
  report: 'bg-indigo-100 text-indigo-700',
  subscription: 'bg-pink-100 text-pink-700',
  settings: 'bg-gray-100 text-gray-700',
  grade: 'bg-teal-100 text-teal-700',
  milestone: 'bg-orange-100 text-orange-700',
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterResourceType, setFilterResourceType] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [limit, setLimit] = useState(50)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (filterAction) params.set('action', filterAction)
      if (filterResourceType) params.set('resource_type', filterResourceType)
      if (filterUserId) params.set('user_id', filterUserId)
      if (startDate) params.set('start_date', startDate)
      if (endDate) params.set('end_date', endDate)
      params.set('limit', limit.toString())
      params.set('offset', offset.toString())

      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.audit_logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [offset, limit])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setOffset(0)
    fetchAuditLogs()
  }

  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.floor(offset / limit) + 1

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (filterAction) params.set('action', filterAction)
    if (filterResourceType) params.set('resource_type', filterResourceType)
    if (startDate) params.set('start_date', startDate)
    if (endDate) params.set('end_date', endDate)
    params.set('limit', '1000')
    params.set('offset', '0')

    try {
      const response = await fetch(`/api/audit-logs?${params.toString()}`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      const csv = [
        ['Date', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Details'].join(','),
        ...(data.audit_logs || []).map((log: AuditLog) => [
          new Date(log.created_at).toISOString(),
          log.user_email || log.user_name || 'System',
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.ip_address,
          JSON.stringify(log.details || {})
        ].join(','))
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    } catch (error) {
      console.error('Failed to export audit logs:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all user actions and system events</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user or details..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Actions</option>
              <option value="case.create">Case Created</option>
              <option value="case.update">Case Updated</option>
              <option value="case.delete">Case Deleted</option>
              <option value="case.verify">Case Verified</option>
              <option value="user.login">User Login</option>
              <option value="user.invite">User Invited</option>
              <option value="settings.update">Settings Updated</option>
              <option value="subscription.update">Subscription Updated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
            <select
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="">All Types</option>
              <option value="case">Case</option>
              <option value="user">User</option>
              <option value="institution">Institution</option>
              <option value="template">Template</option>
              <option value="report">Report</option>
              <option value="subscription">Subscription</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No audit logs found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {log.user_name || log.user_email || 'System'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {actionLabels[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${resourceTypeColors[log.resource_type] || 'bg-gray-100 text-gray-800'}`}>
                        {log.resource_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={JSON.stringify(log.details)}>
                        {log.resource_id ? `ID: ${log.resource_id.slice(0, 8)}...` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
