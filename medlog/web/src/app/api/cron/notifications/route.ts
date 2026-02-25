import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getLocalDate } from '@/lib/date-utils'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: users, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, notification_settings, current_streak, last_logged_date, timezone')
      .eq('role', 'resident')

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    const remindersSent = []
    const notificationsCreated = []

    for (const user of users || []) {
      const settings = user.notification_settings || {}
      const userTz = user.timezone || 'UTC'

      if (!settings.reminder_enabled || settings.vacation_mode) {
        continue
      }

      // Check if it's currently the reminder time in the user's timezone
      const userLocalTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: userTz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(new Date())

      const reminderTime = settings.reminder_time || '21:00'
      const [userHour, userMinute] = userLocalTime.split(':').map(Number)
      const [targetHour, targetMinute] = reminderTime.split(':').map(Number)

      // Only run if the current hour matches (assuming cron runs hourly)
      if (userHour === targetHour) {
        const today = getLocalDate(userTz)
        const dayOfWeek = new Date().getDay() // Server day is fine for weekend check generally
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

        if (settings.skip_weekends && isWeekend) {
          continue
        }

        const lastLogged = user.last_logged_date

        // Only remind if they haven't logged today
        if (lastLogged !== today) {
          const streakContext = user.current_streak > 0
            ? `🔥 Your ${user.current_streak}-day streak is at risk! `
            : ''

          const { data: notification } = await supabaseAdmin
            .from('notifications')
            .insert({
              user_id: user.id,
              type: user.current_streak > 0 ? 'streak' : 'reminder',
              title: user.current_streak > 0
                ? `🔥 Don't break your ${user.current_streak}-day streak!`
                : 'Time to log your cases!',
              message: `${streakContext}Don't forget to keep your logbook up to date!`,
            })
            .select()
            .single()

          if (notification) {
            notificationsCreated.push(notification.id)
          }

          if (process.env.SENDGRID_API_KEY) {
            remindersSent.push(user.email)
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Notification job completed',
      remindersSent: remindersSent.length,
      notificationsCreated: notificationsCreated.length,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
