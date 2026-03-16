/**
 * Enterprise Features Library
 * Multi-tenancy, compliance, and advanced features
 */

export interface Institution {
  id: string
  name: string
  customDomain?: string
  branding?: {
    logoUrl?: string
    primaryColor?: string
    secondaryColor?: string
  }
  settings: {
    ssoEnabled: boolean
    auditLogsEnabled: boolean
    customFields?: string[]
  }
  subscription: {
    plan: 'free' | 'pro' | 'institution' | 'enterprise'
    seats: number
    features: string[]
  }
}

export interface AuditLog {
  id: string
  userId: string
  actionType: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export'
  resourceType: 'case' | 'user' | 'institution' | 'report'
  resourceId: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface ComplianceReport {
  institutionId: string
  period: {
    start: string
    end: string
  }
  metrics: {
    totalCases: number
    casesPerResident: number
    complianceRate: number
    atRiskResidents: number
    milestoneCompletion: number
  }
  residents: Array<{
    id: string
    name: string
    year: number
    casesLogged: number
    requiredCases: number
    deficit: number
    status: 'on-track' | 'at-risk' | 'critical'
  }>
  generatedAt: string
}

export interface EnterpriseAnalytics {
  totalResidents: number
  activeThisMonth: number
  totalCases: number
  complianceRate: number
  topPerformers: Array<{
    id: string
    name: string
    caseCount: number
    specialty: string
    growth: number
  }>
  atRiskResidents: Array<{
    id: string
    name: string
    deficit: number
    year: number
  }>
  caseDistribution: Array<{
    category: string
    count: number
    percentage: number
  }>
  recentActivity: AuditLog[]
}

/**
 * Log an audit event (HIPAA compliant)
 */
export async function logAuditEvent(data: {
  actionType: AuditLog['actionType']
  resourceType: AuditLog['resourceType']
  resourceId: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    const response = await fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      console.error('Audit log failed:', await response.text())
    }
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Generate compliance report for institution
 */
export async function generateComplianceReport(
  institutionId: string,
  startDate: string,
  endDate: string
): Promise<ComplianceReport> {
  const response = await fetch(
    `/api/reports/compliance?institutionId=${institutionId}&start=${startDate}&end=${endDate}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to generate compliance report')
  }
  
  return response.json()
}

/**
 * Get enterprise analytics dashboard data
 */
export async function getEnterpriseAnalytics(): Promise<EnterpriseAnalytics> {
  const response = await fetch('/api/institution/analytics')
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics')
  }
  
  return response.json()
}

/**
 * Export data for external use (ACGME, board certification)
 */
export async function exportData(
  type: 'cases' | 'milestones' | 'compliance' | 'full',
  format: 'pdf' | 'csv' | 'json' = 'pdf'
): Promise<Blob> {
  const response = await fetch(`/api/reports/export?type=${type}&format=${format}`, {
    method: 'POST',
  })
  
  if (!response.ok) {
    throw new Error('Export failed')
  }
  
  return response.blob()
}

/**
 * Check if institution has feature enabled
 */
export function hasFeature(institution: Institution, feature: string): boolean {
  return institution.subscription.features.includes(feature)
}

/**
 * Calculate compliance percentage for ACGME requirements
 */
export function calculateComplianceRate(
  completed: number,
  required: number
): number {
  if (required === 0) return 100
  return Math.min(100, Math.round((completed / required) * 100))
}

/**
 * Identify at-risk residents based on case volume
 */
export function identifyAtRiskResidents(
  residents: Array<{
    id: string
    name: string
    year: number
    casesLogged: number
    requiredCases: number
  }>
): Array<{
  id: string
  name: string
  deficit: number
  year: number
  status: 'on-track' | 'at-risk' | 'critical'
}> {
  return residents.map(resident => {
    const deficit = resident.requiredCases - resident.casesLogged
    const percentage = (resident.casesLogged / resident.requiredCases) * 100
    
    let status: 'on-track' | 'at-risk' | 'critical' = 'on-track'
    if (percentage < 50) status = 'critical'
    else if (percentage < 80) status = 'at-risk'
    
    return {
      id: resident.id,
      name: resident.name,
      deficit: Math.max(0, deficit),
      year: resident.year,
      status
    }
  }).filter(r => r.status !== 'on-track')
}
