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
    const profileResult = await pool.query(`
      SELECT institution_id, role FROM public.profiles WHERE id = $1
    `, [user.id])
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await pool.query(`
      SELECT * FROM public.dashboard_configs 
      WHERE institution_id = $1
      ORDER BY is_default DESC, created_at DESC
    `, [profile.institution_id])

    return NextResponse.json({ dashboards: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profileResult = await pool.query(`
      SELECT institution_id, role FROM public.profiles WHERE id = $1
    `, [user.id])
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, dashboard } = body

    if (action === 'create') {
      if (dashboard.is_default) {
        await pool.query(`
          UPDATE public.dashboard_configs SET is_default = false 
          WHERE institution_id = $1
        `, [profile.institution_id])
      }

      const result = await pool.query(`
        INSERT INTO public.dashboard_configs (institution_id, name, widgets, layout, is_default, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        profile.institution_id,
        dashboard.name,
        JSON.stringify(dashboard.widgets || []),
        JSON.stringify(dashboard.layout || []),
        dashboard.is_default || false,
        user.id
      ])

      return NextResponse.json({ dashboard: result.rows[0] })
    }

    if (action === 'update' && dashboard.id) {
      if (dashboard.is_default) {
        await pool.query(`
          UPDATE public.dashboard_configs SET is_default = false 
          WHERE institution_id = $1 AND id != $2
        `, [profile.institution_id, dashboard.id])
      }

      const result = await pool.query(`
        UPDATE public.dashboard_configs SET
          name = $1,
          widgets = $2,
          layout = $3,
          is_default = $4,
          updated_at = NOW()
        WHERE id = $5 AND institution_id = $6
        RETURNING *
      `, [
        dashboard.name,
        JSON.stringify(dashboard.widgets || []),
        JSON.stringify(dashboard.layout || []),
        dashboard.is_default || false,
        dashboard.id,
        profile.institution_id
      ])

      return NextResponse.json({ dashboard: result.rows[0] })
    }

    if (action === 'delete' && dashboard.id) {
      await pool.query(`
        DELETE FROM public.dashboard_configs 
        WHERE id = $1 AND institution_id = $2
      `, [dashboard.id, profile.institution_id])

      return NextResponse.json({ success: true })
    }

    if (action === 'setDefault' && dashboard.id) {
      await pool.query(`
        UPDATE public.dashboard_configs SET is_default = false 
        WHERE institution_id = $1
      `, [profile.institution_id])

      await pool.query(`
        UPDATE public.dashboard_configs SET is_default = true 
        WHERE id = $2 AND institution_id = $1
      `, [profile.institution_id, dashboard.id])

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
