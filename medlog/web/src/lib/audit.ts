import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

export interface AuditLogParams {
  userId: string
  institutionId?: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO public.audit_logs (
        user_id,
        institution_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      params.userId,
      params.institutionId,
      params.action,
      params.resourceType,
      params.resourceId,
      params.details || {},
      params.ipAddress || 'unknown',
      params.userAgent || 'unknown'
    ])
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export const AuditActions = {
  CASE_CREATE: 'case.create',
  CASE_UPDATE: 'case.update',
  CASE_DELETE: 'case.delete',
  CASE_VERIFY: 'case.verify',
  CASE_EXPORT: 'case.export',
  
  USER_INVITE: 'user.invite',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  
  INSTITUTION_CREATE: 'institution.create',
  INSTITUTION_UPDATE: 'institution.update',
  INSTITUTION_DELETE: 'institution.delete',
  
  TEMPLATE_CREATE: 'template.create',
  TEMPLATE_UPDATE: 'template.update',
  TEMPLATE_DELETE: 'template.delete',
  
  REPORT_GENERATE: 'report.generate',
  REPORT_EXPORT: 'report.export',
  
  SUBSCRIPTION_CREATE: 'subscription.create',
  SUBSCRIPTION_UPDATE: 'subscription.update',
  SUBSCRIPTION_CANCEL: 'subscription.cancel',
  
  SETTINGS_UPDATE: 'settings.update',
  NOTIFICATION_SEND: 'notification.send',
  
  GRADE_CREATE: 'grade.create',
  GRADE_UPDATE: 'grade.update',
  
  MILESTONE_ASSESS: 'milestone.assess',
  
  BULK_IMPORT: 'bulk.import',
  
  AI_ANALYSIS: 'ai.analysis',
} as const

export const ResourceTypes = {
  CASE: 'case',
  USER: 'user',
  INSTITUTION: 'institution',
  TEMPLATE: 'template',
  REPORT: 'report',
  SUBSCRIPTION: 'subscription',
  SETTINGS: 'settings',
  GRADE: 'grade',
  MILESTONE: 'milestone',
  INVITE: 'invite',
  NOTIFICATION: 'notification',
} as const
