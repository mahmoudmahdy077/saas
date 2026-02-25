import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
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
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('institution_id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const residentId = searchParams.get('resident_id')

    if (!residentId) {
      return NextResponse.json({ error: 'Resident ID required' }, { status: 400 })
    }

    // Security Check: Resident can only view own; PD can view anyone in institution
    if (profile.role === 'resident' && residentId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (profile.role === 'program_director' || profile.role === 'institution_admin') {
      const { data: targetResident } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', residentId)
        .single()

      if (!targetResident || targetResident.institution_id !== profile.institution_id) {
        return NextResponse.json({ error: 'Forbidden - Out of scope' }, { status: 403 })
      }
    }

    const { data: grades, error } = await supabase
      .from('reports')
      .select('grades, period, type, created_at')
      .eq('resident_id', residentId)
      .not('grades', 'eq', '{}')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const gradeHistory = (grades || []).map(g => ({
      period: g.period,
      type: g.type,
      grades: typeof g.grades === 'string' ? JSON.parse(g.grades) : g.grades,
      created_at: g.created_at
    }))

    return NextResponse.json({ grades: gradeHistory })
  } catch (error) {
    console.error('Grades fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'program_director') {
      return NextResponse.json({ error: 'Forbidden - PD only' }, { status: 403 })
    }

    const body = await request.json()
    const { report_id, grades } = body

    if (!report_id || !grades) {
      return NextResponse.json({ error: 'Report ID and grades required' }, { status: 400 })
    }

    const { data: report, error } = await supabase
      .from('reports')
      .update({ grades })
      .eq('id', report_id)
      .eq('program_director_id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Grade update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
