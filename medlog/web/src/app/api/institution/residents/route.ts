import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ... (GET method remains the same)

export async function PATCH(request: NextRequest) {
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

    if (!profile || (profile.role !== 'program_director' && profile.role !== 'institution_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { resident_id, specialty_id } = body

    if (!resident_id) {
      return NextResponse.json({ error: 'Resident ID required' }, { status: 400 })
    }

    // Verify resident belongs to the same institution
    const { data: targetResident } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', resident_id)
      .single()

    if (!targetResident || targetResident.institution_id !== profile.institution_id) {
      return NextResponse.json({ error: 'Forbidden - Out of scope' }, { status: 403 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ specialty_id: specialty_id || null })
      .eq('id', resident_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resident update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    if (!profile || (profile.role !== 'program_director' && profile.role !== 'institution_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const residentId = searchParams.get('resident_id')

    if (!residentId) {
      return NextResponse.json({ error: 'Resident ID required' }, { status: 400 })
    }

    // Verify resident belongs to the same institution
    const { data: targetResident } = await supabase
      .from('profiles')
      .select('institution_id')
      .eq('id', residentId)
      .single()

    if (!targetResident || targetResident.institution_id !== profile.institution_id) {
      return NextResponse.json({ error: 'Forbidden - Out of scope' }, { status: 403 })
    }

    // Remove from institution by setting institution_id to null
    const { error } = await supabase
      .from('profiles')
      .update({ institution_id: null, specialty_id: null })
      .eq('id', residentId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resident removal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

export async function GET() {
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

    if (!profile || (profile.role !== 'program_director' && profile.role !== 'institution_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: residents, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, current_streak, specialty_id, specialties(name)')
      .eq('institution_id', profile.institution_id)
      .eq('role', 'resident')
      .order('full_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedResidents = (residents || []).map(r => ({
      id: r.id,
      full_name: r.full_name,
      email: r.email,
      specialty: (r.specialties as any)?.name || 'Not assigned',
      current_streak: r.current_streak
    }))

    return NextResponse.json({ residents: formattedResidents })
  } catch (error) {
    console.error('Residents fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
