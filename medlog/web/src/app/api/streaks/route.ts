import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getLocalDate, getLocalYesterday } from '@/lib/date-utils'

export async function GET() {
    try {
        const cookieStore = cookies()
        const accessToken = cookieStore.get('sb-access-token')?.value
        
        console.log('[streaks] Access token present:', !!accessToken)
        
        if (!accessToken) {
            return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
        }
        
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                },
            }
        )
        
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        console.log('[streaks] User:', user?.id, 'Error:', authError)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized - ' + (authError?.message || 'unknown') }, { status: 401 })
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('current_streak, longest_streak, last_logged_date, streak_freeze_available, timezone')
            .eq('id', user.id)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const userTz = profile?.timezone || 'UTC'
        const today = getLocalDate(userTz)
        const lastLogged = profile?.last_logged_date

        let streakAtRisk = false

        if (lastLogged && (profile?.current_streak || 0) > 0) {
            // At risk if they haven't logged today and today is not the last logged day
            streakAtRisk = lastLogged !== today
        }

        return NextResponse.json({
            currentStreak: profile?.current_streak || 0,
            longestStreak: profile?.longest_streak || 0,
            lastLoggedDate: profile?.last_logged_date || null,
            streakFreezeAvailable: profile?.streak_freeze_available ?? true,
            streakAtRisk,
            loggedToday: lastLogged === today,
        })
    } catch (error) {
        console.error('Error fetching streak:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
