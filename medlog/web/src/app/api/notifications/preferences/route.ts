import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  return user
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query(`
      SELECT * FROM public.notification_preferences WHERE user_id = $1
    `, [user.id])

    if (result.rows.length === 0) {
      const insertResult = await pool.query(`
       _preferences (user _id)
        VALUES ($1)
        RETURNING *
      `, [user.id])
      return NextResponse.json({ preferences: insertResult.rows[0] })
    }

    return NextResponse.json({ preferences: result.rows[0] })
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { 
      email_enabled,
      push_enabled,
      reminder_enabled,
      streak_alerts,
      gap_alerts,
      verification_reminders,
      milestone_alerts,
      subscription_alerts,
      digest_frequency
    } = body

    const result = await pool.query(`
      INSERT INTO public.notification_preferences (
        user_id, email_enabled, push_enabled, reminder_enabled, streak_alerts,
        gap_alerts, verification_reminders, milestone_alerts, subscription_alerts, digest_frequency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (user_id) DO UPDATE SET
        email_enabled = $2,
        push_enabled = $3,
        reminder_enabled = $4,
        streak_alerts = $5,
        gap_alerts = $6,
        verification_reminders = $7,
        milestone_alerts = $8,
        subscription_alerts = $9,
        digest_frequency = $10,
        updated_at = NOW()
      RETURNING *
    `, [
      user.id,
      email_enabled,
      push_enabled,
      reminder_enabled,
      streak_alerts,
      gap_alerts,
      verification_reminders,
      milestone_alerts,
      subscription_alerts,
      digest_frequency
    ])

    return NextResponse.json({ preferences: result.rows[0] })
  } catch (error: any) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
