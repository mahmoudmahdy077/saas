import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let caseId: string | undefined
  try {
    const cookieStore = await cookies()
    const { id } = await params
    caseId = id

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json({ case: caseData })
  } catch (error) {
    logger.error('Error fetching case', error as Error, { route: '/api/cases/[id]', caseId })
    return NextResponse.json({ error: 'Internal server error', code: 'FETCH_CASE_FAILED' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let caseId: string | undefined
  let userId: string | undefined
  try {
    const cookieStore = await cookies()
    const { id } = await params
    caseId = id

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data: caseData, error } = await supabase
      .from('cases')
      .update(body)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !caseData) {
      return NextResponse.json({ error: 'Failed to update case' }, { status: 400 })
    }

    return NextResponse.json({ case: caseData })
  } catch (error) {
    logger.error('Error updating case', error as Error, { route: '/api/cases/[id]', caseId, userId })
    return NextResponse.json({ error: 'Internal server error', code: 'UPDATE_CASE_FAILED' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let caseId: string | undefined
  let userId: string | undefined
  try {
    const cookieStore = await cookies()
    const { id } = await params
    caseId = id

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete case' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error deleting case', error as Error, { route: '/api/cases/[id]', caseId, userId })
    return NextResponse.json({ error: 'Internal server error', code: 'DELETE_CASE_FAILED' }, { status: 500 })
  }
}
