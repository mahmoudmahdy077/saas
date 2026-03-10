import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function createSupabaseServer() {
  const cookieStore = await cookies()
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

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, institution_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'institution_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const institutionId = profile.institution_id

    if (!institutionId) {
      return NextResponse.json({
        institution: { id: null, name: 'No Institution', resident_count: 0, case_count: 0, specialties: 0 },
        specialties: [],
        reports: []
      })
    }

    const { data: institution } = await supabase
      .from('institutions')
      .select('*')
      .eq('id', institutionId)
      .single()

    const { data: specialties } = await supabase
      .from('specialties')
      .select('*')
      .eq('institution_id', institutionId)

    const { data: residents } = await supabase
      .from('profiles')
      .select('id')
      .eq('institution_id', institutionId)
      .eq('role', 'resident')

    const residentIds = residents?.map(r => r.id) || []
    
    let totalCases = 0
    if (residentIds.length > 0) {
      const { count } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .in('user_id', residentIds)
      totalCases = count || 0
    }

    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('program_director_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    const specialtiesWithCounts = await Promise.all(
      (specialties || []).map(async (specialty) => {
        const { count: residentCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('institution_id', institutionId)
          .eq('specialty_id', specialty.id)

        const { count: caseCount } = await supabase
          .from('cases')
          .select('id', { count: 'exact', head: true })
          .eq('specialty_id', specialty.id)
          .in('user_id', residentIds)

        return {
          ...specialty,
          resident_count: residentCount || 0,
          case_count: caseCount || 0
        }
      })
    )

    return NextResponse.json({
      institution: {
        id: institution?.id,
        name: institution?.name || 'Institution',
        resident_count: residents?.length || 0,
        case_count: totalCases,
        specialties: specialties?.length || 0
      },
      specialties: specialtiesWithCounts,
      reports: reports?.map(r => ({
        ...r,
        average_grade: r.grades?.average || 0
      })) || []
    })
  } catch (error) {
    console.error('Institution stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
