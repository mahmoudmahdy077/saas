import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getLocalDate, getLocalYesterday } from '@/lib/date-utils'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

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

    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ cases })
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

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

    const body = await request.json()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      date,
      procedure_type,
      category,
      subcategory,
      role,
      patient_demographics,
      diagnosis,
      complications,
      notes,
      custom_fields,
    } = body

    if (!date || !procedure_type || !category || !role) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    const { data: caseData, error } = await supabase.from('cases').insert({
      user_id: user.id,
      date,
      procedure_type,
      category,
      subcategory,
      role,
      patient_demographics: patient_demographics || { age: 0, gender: 'prefer-not-to-say' },
      diagnosis: diagnosis || '',
      complications: complications || [],
      notes: notes || '',
      custom_fields: custom_fields || {},
      verification_status: 'self',
    }).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update streak after successful case creation
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_logged_date, streak_freeze_available, timezone')
        .eq('id', user.id)
        .single()

      if (profile) {
        const userTz = profile.timezone || 'UTC'
        const today = getLocalDate(userTz)
        const yesterday = getLocalYesterday(userTz)

        let newStreak = profile.current_streak || 0
        const lastLogged = profile.last_logged_date

        if (lastLogged !== today) {
          if (lastLogged === yesterday || !lastLogged) {
            newStreak += 1
          } else {
            newStreak = 1
          }

          const newLongest = Math.max(newStreak, profile.longest_streak || 0)
          const earnedFreeze = newStreak > 0 && newStreak % 7 === 0

          await supabase
            .from('profiles')
            .update({
              current_streak: newStreak,
              longest_streak: newLongest,
              last_logged_date: today,
              streak_freeze_available: earnedFreeze ? true : profile.streak_freeze_available,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          // Achievement notifications for milestones
          const milestones = [3, 7, 14, 30, 50, 100]
          if (milestones.includes(newStreak)) {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'achievement',
              title: `🎉 ${newStreak}-Day Streak!`,
              message: `Amazing! You've logged cases for ${newStreak} consecutive days. ${earnedFreeze ? 'You earned a streak freeze! ❄️' : 'Keep it up!'}`,
            })
          }
        }
      }
    } catch (streakError) {
      // Don't fail case creation if streak update fails
      console.error('Streak update error:', streakError)
    }

    return NextResponse.json({ case: caseData }, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
