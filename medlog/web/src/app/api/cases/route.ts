import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { validateSafe, createCaseSchema } from '@/lib/validation'
import { logAudit } from '@/lib/audit'

export async function GET(request: NextRequest) {
  let userId: string = 'unknown'
  let userEmail: string = 'unknown'
  
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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      await logAudit('CASE_LIST', 'anonymous', 'anonymous', 'case', undefined, { error: 'Unauthorized' }, false, 'Unauthorized')
      return NextResponse.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }, status: 401 }, { status: 401 })
    }

    userId = user.id
    userEmail = user.email || 'unknown'

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build query with pagination and filters
    let query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (category) query = query.eq('category', category)
    if (status) query = query.eq('verification_status', status)
    if (dateFrom) query = query.gte('date', dateFrom)
    if (dateTo) query = query.lte('date', dateTo)

    const { data: cases, error } = await query

    if (error) {
      await logAudit('CASE_LIST', userId, userEmail, 'case', undefined, { error: error.message }, false, error.message)
      return NextResponse.json({ error: { message: 'Failed to fetch cases', code: 'FETCH_CASES_FAILED' }, status: 500 }, { status: 500 })
    }

    await logAudit('CASE_LIST', userId, userEmail, 'case', undefined, { count: cases?.length || 0 }, true)

    return NextResponse.json({ 
      data: cases, 
      pagination: {
        total: cases?.length || 0,
        limit,
        page: 1
      }
    })
  } catch (error) {
    await logAudit('CASE_LIST', userId, userEmail, 'case', undefined, { error: error instanceof Error ? error.message : 'Unknown error' }, false, error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: { message: 'Internal server error', code: 'FETCH_CASES_FAILED' }, status: 500 }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let userId: string = 'unknown'
  let userEmail: string = 'unknown'
  
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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      await logAudit('CASE_CREATE', 'anonymous', 'anonymous', 'case', undefined, { error: 'Unauthorized' }, false, 'Unauthorized')
      return NextResponse.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }, status: 401 }, { status: 401 })
    }

    userId = user.id
    userEmail = user.email || 'unknown'

    // Validate request body
    const body = await request.json()
    const validation = validateSafe(createCaseSchema, body)
    
    if (!validation.success) {
      await logAudit('CASE_CREATE', userId, userEmail, 'case', undefined, { error: 'Validation failed', details: validation.error.issues }, false, validation.error.message)
      return NextResponse.json({ 
        error: { 
          message: 'Invalid input', 
          code: 'VALIDATION_ERROR',
          details: validation.error.issues 
        }, 
        status: 400 
      }, { status: 400 })
    }

    const caseData = validation.data

    const { data: caseResult, error: insertError } = await supabase
      .from('cases')
      .insert({
        ...caseData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      await logAudit('CASE_CREATE', userId, userEmail, 'case', undefined, { error: insertError.message }, false, insertError.message)
      return NextResponse.json({ error: { message: insertError.message, code: 'CREATE_CASE_FAILED' }, status: 500 }, { status: 500 })
    }

    await logAudit('CASE_CREATE', userId, userEmail, 'case', caseResult.id, { title: caseResult.title }, true)

    return NextResponse.json({ data: { case: caseResult }, message: 'Case created successfully' }, { status: 201 })
  } catch (error) {
    await logAudit('CASE_CREATE', userId, userEmail, 'case', undefined, { error: error instanceof Error ? error.message : 'Unknown error' }, false, error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: { message: 'Internal server error', code: 'CREATE_CASE_FAILED' }, status: 500 }, { status: 500 })
  }
}
