import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
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

        // Check if freeze is available
        const { data: profile } = await supabase
            .from('profiles')
            .select('streak_freeze_available, current_streak, last_logged_date')
            .eq('id', user.id)
            .single()

        if (!profile?.streak_freeze_available) {
            return NextResponse.json(
                { error: 'No streak freeze available. You earn one per 7-day streak.' },
                { status: 400 }
            )
        }

        if (!profile?.current_streak || profile.current_streak === 0) {
            return NextResponse.json(
                { error: 'No active streak to freeze.' },
                { status: 400 }
            )
        }

        // Use the freeze: update last_logged_date to today to preserve the streak
        const today = new Date().toISOString().split('T')[0]
        const { error } = await supabase
            .from('profiles')
            .update({
                last_logged_date: today,
                streak_freeze_available: false,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Create notification
        await supabase
            .from('notifications')
            .insert({
                user_id: user.id,
                type: 'streak',
                title: 'Streak Freeze Used! ❄️',
                message: `Your ${profile.current_streak}-day streak has been preserved with a freeze. Keep logging to earn another freeze!`,
            })

        return NextResponse.json({
            message: 'Streak freeze applied successfully!',
            streakPreserved: profile.current_streak,
        })
    } catch (error) {
        console.error('Error applying streak freeze:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
