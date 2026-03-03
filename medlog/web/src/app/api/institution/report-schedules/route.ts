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

function calculateNextRunAt(frequency: string): Date {
  const now = new Date()
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1)
      now.setHours(6, 0, 0, 0)
      break
    case 'weekly':
      now.setDate(now.getDate() + (7 - now.getDay()))
      now.setHours(6, 0, 0, 0)
      break
    case 'monthly':
      now.setMonth(now.getMonth() + 1)
      now.setDate(1)
      now.setHours(6, 0, 0, 0)
      break
    case 'quarterly':
      now.setMonth(now.getMonth() + 3)
      now.setDate(1)
      now.setHours(6, 0, 0, 0)
      break
  }
  return now
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let query = 'SELECT * FROM public.report_schedules'
    const params: any[] = []

    if (profile.role !== 'super_admin') {
      query += ' WHERE institution_id = $1'
      params.push(profile.institution_id)
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    return NextResponse.json({ schedules: result.rows })
  } catch (error: any) {
    console.error('Error fetching report schedules:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, schedule } = body

    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (action === 'create') {
      const nextRunAt = calculateNextRunAt(schedule.frequency)

      const result = await pool.query(`
        INSERT INTO public.report_schedules (
          institution_id,
          report_type,
          frequency,
          recipients,
          next_run_at,
          is_active,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        profile.institution_id,
        schedule.report_type,
        schedule.frequency,
        JSON.stringify(schedule.recipients || []),
        nextRunAt,
        schedule.is_active !== false,
        user.id
      ])

      return NextResponse.json({ schedule: result.rows[0] })
    }

    if (action === 'update' && schedule.id) {
      const updateFields: string[] = []
      const params: any[] = [schedule.id, profile.institution_id]
      let paramIndex = 3

      if (schedule.report_type) {
        updateFields.push(`report_type = $${paramIndex++}`)
        params.push(schedule.report_type)
      }
      if (schedule.frequency) {
        updateFields.push(`frequency = $${paramIndex++}`)
        params.push(schedule.frequency)
        updateFields.push(`next_run_at = $${paramIndex++}`)
        params.push(calculateNextRunAt(schedule.frequency))
      }
      if (schedule.recipients) {
        updateFields.push(`recipients = $${paramIndex++}`)
        params.push(JSON.stringify(schedule.recipients))
      }
      if (schedule.is_active !== undefined) {
        updateFields.push(`is_active = $${paramIndex++}`)
        params.push(schedule.is_active)
      }

      updateFields.push(`updated_at = NOW()`)

      const result = await pool.query(`
        UPDATE public.report_schedules
        SET ${updateFields.join(', ')}
        WHERE id = $1 AND institution_id = $2
        RETURNING *
      `, params)

      return NextResponse.json({ schedule: result.rows[0] })
    }

    if (action === 'delete' && schedule.id) {
      await pool.query(`
        DELETE FROM public.report_schedules
        WHERE id = $1 AND institution_id = $2
      `, [schedule.id, profile.institution_id])

      return NextResponse.json({ success: true })
    }

    if (action === 'run_now' && schedule.id) {
      const scheduleResult = await pool.query(`
        SELECT * FROM public.report_schedules
        WHERE id = $1 AND institution_id = $2
      `, [schedule.id, profile.institution_id])

      if (scheduleResult.rows.length === 0) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
      }

      const now = new Date()
      await pool.query(`
        UPDATE public.report_schedules
        SET last_run_at = $1, updated_at = NOW()
        WHERE id = $2
      `, [now, schedule.id])

      return NextResponse.json({ success: true, message: 'Report generation triggered' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error managing report schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
