/**
 * Database Error Handler
 * Centralized error handling for Supabase queries
 */

import { PostgrestError } from '@supabase/supabase-js'
import { logAudit } from './audit'

export interface DatabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

export function handleDatabaseError(error: PostgrestError, context: {
  userId: string
  userEmail: string
  operation: string
  table: string
  recordId?: string
}): DatabaseError {
  const dbError: DatabaseError = {
    code: mapErrorCode(error.code),
    message: error.message,
    details: error.details,
    hint: error.hint,
  }

  // Log audit
  logAudit(
    context.operation as any,
    context.userId,
    context.userEmail,
    context.table,
    context.recordId,
    { error: dbError },
    false,
    error.message
  )

  return dbError
}

export function mapErrorCode(code?: string): string {
  if (!code) return 'UNKNOWN_ERROR'
  
  const errorMap: Record<string, string> = {
    '23505': 'DUPLICATE_KEY',
    '23503': 'FOREIGN_KEY_VIOLATION',
    '23502': 'NOT_NULL_VIOLATION',
    '42P01': 'TABLE_NOT_FOUND',
    '42703': 'COLUMN_NOT_FOUND',
    '42601': 'SYNTAX_ERROR',
    '08003': 'CONNECTION_FAILURE',
    '08006': 'CONNECTION_EXCEPTION',
    '57014': 'QUERY_CANCELED',
    '53100': 'INSUFFICIENT_RESOURCES',
    '53200': 'OUT_OF_MEMORY',
    '53300': 'TOO_MANY_CONNECTIONS',
    '40001': 'SERIALIZATION_FAILURE',
    '40P01': 'DEADLOCK_DETECTED',
  }

  return errorMap[code] || 'DATABASE_ERROR'
}

export function isDatabaseError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  )
}

export async function withDatabaseErrorHandling<T>(
  fn: () => Promise<T>,
  context: {
    userId: string
    userEmail: string
    operation: string
    table: string
    recordId?: string
  }
): Promise<{ data: T | null; error: DatabaseError | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (error) {
    if (isDatabaseError(error)) {
      const dbError = handleDatabaseError(error, context)
      return { data: null, error: dbError }
    }
    
    const genericError: DatabaseError = {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown database error',
    }
    
    logAudit(
      context.operation as any,
      context.userId,
      context.userEmail,
      context.table,
      context.recordId,
      { error: genericError },
      false,
      genericError.message
    )
    
    return { data: null, error: genericError }
  }
}
