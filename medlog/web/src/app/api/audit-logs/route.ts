import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

/**
 * Audit Logs API - Enterprise Feature
 * Track all user actions for compliance (HIPAA, SOC2)
 */

export async function GET(request: NextRequest) {
  let user: any
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user: authenticatedUser } } = await supabase.auth.getUser()
    user = authenticatedUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const actionType = searchParams.get('actionType')

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)
    if (actionType) query = query.eq('action_type', actionType)

    const { data: logs, error } = await query

    if (error) {
      logger.error('Failed to fetch audit logs', error as Error, { 
        route: '/api/audit-logs', 
        userId: user.id 
      })
      return NextResponse.json({ error: 'Failed to fetch logs', code: 'FETCH_AUDIT_LOGS_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ logs, count: logs?.length || 0 })
  } catch (error) {
    logger.error('Error fetching audit logs', error as Error, { route: '/api/audit-logs', userId: user?.id })
    return NextResponse.json({ error: 'Internal server error', code: 'AUDIT_LOGS_FETCH_FAILED' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let user: any
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user: authenticatedUser } } = await supabase.auth.getUser()
    user = authenticatedUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action_type, resource_type, resource_id, metadata } = body

    const { data: log, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action_type,
        resource_type,
        resource_id,
        metadata: metadata || {},
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create audit log', error as Error, { 
        route: '/api/audit-logs', 
        userId: user.id,
        actionType: action_type
      })
      return NextResponse.json({ error: 'Failed to create log', code: 'CREATE_AUDIT_LOG_FAILED' }, { status: 500 })
    }

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    logger.error('Error creating audit log', error as Error, { route: '/api/audit-logs', userId: user?.id })
    return NextResponse.json({ error: 'Internal server error', code: 'AUDIT_LOG_CREATE_FAILED' }, { status: 500 })
  }
}
