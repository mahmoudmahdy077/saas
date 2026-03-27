/**
 * Audit Log System
 * Track all user actions for compliance and security
 */

import { getEnv } from './env';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_CREATE'
  | 'USER_UPDATE'
  | 'USER_DELETE'
  | 'CASE_CREATE'
  | 'CASE_UPDATE'
  | 'CASE_DELETE'
  | 'CASE_PUBLISH'
  | 'CASE_ARCHIVE'
  | 'DATA_EXPORT'
  | 'DATA_IMPORT'
  | 'SETTINGS_UPDATE'
  | 'INSTITUTION_UPDATE'
  | 'ADMIN_ACTION';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  error?: string;
}

export async function logAudit(
  action: AuditAction,
  userId: string,
  userEmail: string,
  resourceType: string,
  resourceId: string | undefined,
  metadata: Record<string, unknown> | undefined,
  success: boolean,
  error?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const env = getEnv();
  
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    userEmail,
    action,
    resourceType,
    resourceId,
    ipAddress: ipAddress || 'unknown',
    userAgent: userAgent || 'unknown',
    metadata,
    success,
    error,
  };

  try {
    // Store in Supabase
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    await supabase.from('audit_logs').insert({
      id: auditLog.id,
      timestamp: auditLog.timestamp,
      user_id: auditLog.userId,
      user_email: auditLog.userEmail,
      action: auditLog.action,
      resource_type: auditLog.resourceType,
      resource_id: auditLog.resourceId,
      ip_address: auditLog.ipAddress,
      user_agent: auditLog.userAgent,
      metadata: auditLog.metadata,
      success: auditLog.success,
      error: auditLog.error,
    });
  } catch (err) {
    // Log to console in case of failure (should not happen in production)
    console.error('Failed to write audit log:', err);
  }
}

export async function logUserAction(
  userId: string,
  userEmail: string,
  action: AuditAction,
  success: boolean,
  metadata?: Record<string, unknown>,
  error?: string
): Promise<void> {
  await logAudit(
    action,
    userId,
    userEmail,
    'user',
    userId,
    metadata,
    success,
    error
  );
}

export async function logCaseAction(
  userId: string,
  userEmail: string,
  action: AuditAction,
  caseId: string,
  success: boolean,
  metadata?: Record<string, unknown>,
  error?: string
): Promise<void> {
  await logAudit(
    action,
    userId,
    userEmail,
    'case',
    caseId,
    metadata,
    success,
    error
  );
}

export async function getAuditLogs(
  userId?: string,
  action?: AuditAction,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
): Promise<AuditLog[]> {
  const env = getEnv();
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  let query = supabase.from('audit_logs').select('*');
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  if (action) {
    query = query.eq('action', action);
  }
  
  if (startDate) {
    query = query.gte('timestamp', startDate.toISOString());
  }
  
  if (endDate) {
    query = query.lte('timestamp', endDate.toISOString());
  }
  
  query = query.order('timestamp', { ascending: false }).limit(limit);
  
  const { data, error } = await query;
  
  if (error) {
    throw error;
  }
  
  return data as AuditLog[];
}
