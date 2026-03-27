/**
 * API Route Wrapper
 * Standardized wrapper for all API routes with validation, auth, and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth, getCurrentUser } from '@/lib/auth'
import { validateSafe } from '@/lib/validation'
import { logAudit } from '@/lib/audit'
import { withDatabaseErrorHandling } from '@/lib/database-error'

export interface ApiRouteConfig<T = unknown, U = unknown> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  auth?: boolean
  adminOnly?: boolean
  validateBody?: z.ZodType<T>
  validateQuery?: z.ZodType<U>
  auditAction?: string
  auditResource?: string
  handler: (request: ApiRouteRequest<T, U>, user?: any) => Promise<NextResponse>
}

export interface ApiRouteRequest<T = unknown, U = unknown> {
  request: NextRequest
  body?: T
  query?: U
  params?: Record<string, string>
}

export function createApiRoute<T = unknown, U = unknown>(config: ApiRouteConfig<T, U>) {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    let userId = 'unknown'
    let userEmail = 'unknown'
    let user: any = null

    try {
      // Authentication check
      if (config.auth) {
        try {
          user = await requireAuth()
          userId = user.user.id
          userEmail = user.user.email || 'unknown'
        } catch {
          await logAudit(
            (config.auditAction || 'API_REQUEST') as any,
            'anonymous',
            'anonymous',
            config.auditResource || 'api',
            undefined,
            { error: 'Unauthorized', path: request.nextUrl.pathname },
            false,
            'Unauthorized'
          )
          return NextResponse.json(
            { error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }, status: 401 },
            { status: 401 }
          )
        }
      }

      // Parse query parameters
      let query: U | undefined
      if (config.validateQuery) {
        const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
        const validation = validateSafe(config.validateQuery, searchParams)
        if (!validation.success) {
          return NextResponse.json(
            { error: { message: 'Invalid query parameters', code: 'INVALID_QUERY', details: validation.error.issues }, status: 400 },
            { status: 400 }
          )
        }
        query = validation.data
      }

      // Parse and validate body
      let body: T | undefined
      if (config.method === 'POST' || config.method === 'PUT') {
        try {
          const rawData = await request.json()
          if (config.validateBody) {
            const validation = validateSafe(config.validateBody, rawData)
            if (!validation.success) {
              await logAudit(
                (config.auditAction || 'API_REQUEST') as any,
                userId,
                userEmail,
                config.auditResource || 'api',
                undefined,
                { error: 'Validation failed', details: validation.error.issues },
                false,
                validation.error.message
              )
              return NextResponse.json(
                { error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: validation.error.issues }, status: 400 },
                { status: 400 }
              )
            }
            body = validation.data
          } else {
            body = rawData
          }
        } catch {
          body = undefined
        }
      }

      // Parse route params
      const params = await context.params

      // Execute handler
      const response = await config.handler({ request, body, query, params }, user)

      // Log success audit
      if (config.auditAction) {
        await logAudit(
          config.auditAction as any,
          userId,
          userEmail,
          config.auditResource || 'api',
          undefined,
          { method: config.method, path: request.nextUrl.pathname },
          true
        )
      }

      return response
    } catch (error) {
      // Log error audit
      if (config.auditAction) {
        await logAudit(
          config.auditAction as any,
          userId,
          userEmail,
          config.auditResource || 'api',
          undefined,
          { error: error instanceof Error ? error.message : 'Unknown error' },
          false,
          error instanceof Error ? error.message : 'Unknown error'
        )
      }

      return NextResponse.json(
        { error: { message: error instanceof Error ? error.message : 'Internal server error', code: 'INTERNAL_ERROR' }, status: 500 },
        { status: 500 }
      )
    }
  }
}

// Helper functions for common operations
export const api = {
  success: (data: any, message?: string, status: number = 200) =>
    NextResponse.json({ data, message, status }, { status }),

  error: (message: string, code: string, status: number = 500, details?: any) =>
    NextResponse.json({ error: { message, code, details }, status }, { status }),

  notFound: (resource: string = 'Resource') =>
    NextResponse.json({ error: { message: `${resource} not found`, code: 'NOT_FOUND' }, status: 404 }, { status: 404 }),

  unauthorized: (message: string = 'Unauthorized') =>
    NextResponse.json({ error: { message, code: 'UNAUTHORIZED' }, status: 401 }, { status: 401 }),

  forbidden: (message: string = 'Forbidden') =>
    NextResponse.json({ error: { message, code: 'FORBIDDEN' }, status: 403 }, { status: 403 }),

  badRequest: (message: string, details?: any) =>
    NextResponse.json({ error: { message, code: 'BAD_REQUEST', details }, status: 400 }, { status: 400 }),
}
