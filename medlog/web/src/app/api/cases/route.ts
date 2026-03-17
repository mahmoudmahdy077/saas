import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

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

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    if (status) {
      query = query.eq('verification_status', status)
    }
    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    const { data: cases, error } = await query

    if (error) {
      logger.error('Error fetching cases', error as Error, { 
        route: '/api/cases',
        userId: user.id,
        filters: { category, status, dateFrom, dateTo }
      })
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }

    return NextResponse.json({ cases, count: cases?.length || 0 })
  } catch (error) {
    logger.error('Error fetching cases', error as Error, { 
      route: '/api/cases',
      userId: user?.id
    })
    return NextResponse.json({ error: 'Internal server error', code: 'FETCH_CASES_FAILED' }, { status: 500 })
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
    const {
      procedure_type,
      date,
      category,
      subcategory,
      role,
      notes,
      patient_demographics,
      complications,
      custom_fields,
      verification_status = 'self',
    } = body

    // Validate required fields
    if (!procedure_type || !date || !category || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: caseData, error } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        procedure_type,
        date,
        category,
        subcategory: subcategory || null,
        role,
        notes: notes || null,
        patient_demographics: patient_demographics || null,
        complications: complications || [],
        custom_fields: custom_fields || {},
        verification_status,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating case', error as Error, { 
        route: '/api/cases',
        userId: user.id,
        procedure_type
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ case: caseData }, { status: 201 })
  } catch (error) {
    logger.error('Error creating case', error as Error, { 
      route: '/api/cases',
      userId: user?.id
    })
    return NextResponse.json({ error: 'Internal server error', code: 'CREATE_CASE_FAILED' }, { status: 500 })
  }
}
