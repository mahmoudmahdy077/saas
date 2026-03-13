import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Health Check Endpoint
 * Use for monitoring and uptime checks
 */

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    services: {
      database: 'unknown',
      supabase: 'unknown'
    }
  }

  // Check Supabase connection
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
          }
        }
      }
    )

    // Simple query to test DB connection
    const { error } = await supabase.from('users').select('id').limit(1)
    
    if (error) {
      checks.services.database = 'error'
      checks.services.supabase = 'error'
      return NextResponse.json(
        { ...checks, status: 'unhealthy', error: error.message },
        { status: 503 }
      )
    }

    checks.services.database = 'healthy'
    checks.services.supabase = 'healthy'
  } catch (error) {
    checks.services.database = 'error'
    checks.services.supabase = 'error'
    return NextResponse.json(
      { ...checks, status: 'unhealthy', error: (error as Error).message },
      { status: 503 }
    )
  }

  return NextResponse.json({
    ...checks,
    status: 'healthy'
  })
}
