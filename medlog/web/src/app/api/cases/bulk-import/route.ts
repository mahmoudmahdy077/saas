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

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cases } = body

    if (!cases || !Array.isArray(cases)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const formattedCases = cases.map(caseData => ({
      user_id: user.id,
      date: caseData.date,
      procedure_type: caseData.procedure_type || caseData.procedureType || 'Unknown',
      category: caseData.category || 'Other',
      role: caseData.role || 'observer',
      diagnosis: caseData.diagnosis || null,
      notes: caseData.notes || null,
      complications: caseData.complications ? (Array.isArray(caseData.complications) ? caseData.complications : [caseData.complications]) : [],
      verification_status: 'self'
    }))

    const { data: insertedCases, error: insertError } = await supabase
      .from('cases')
      .insert(formattedCases)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update streak based on the most recent case in the import
    try {
      const latestCaseDate = formattedCases.reduce((max, c) =>
        new Date(c.date) > new Date(max) ? c.date : max,
        formattedCases[0].date
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_logged_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        let newStreak = profile.current_streak || 0
        const lastLogged = profile.last_logged_date
        const today = new Date().toISOString().split('T')[0]

        // Only update if the import contains fresh or contiguous data
        if (latestCaseDate >= (lastLogged || '1970-01-01')) {
          // Simplified streak logic for bulk import: 
          // If latest import is today or yesterday and profile was active, increment or maintain
          // For simplicity in bulk, we'll just re-check the streak status
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          if (latestCaseDate === today || latestCaseDate === yesterdayStr) {
            // If they were already on a streak, keep it. If starting fresh, it's at least 1.
            newStreak = Math.max(newStreak, 1)
          }

          await supabase.from('profiles').update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, profile.longest_streak || 0),
            last_logged_date: latestCaseDate > (lastLogged || '') ? latestCaseDate : lastLogged,
            updated_at: new Date().toISOString()
          }).eq('id', user.id)
        }
      }
    } catch (streakError) {
      console.error('Bulk streak update error:', streakError)
    }

    return NextResponse.json({
      success: true,
      count: formattedCases.length
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
