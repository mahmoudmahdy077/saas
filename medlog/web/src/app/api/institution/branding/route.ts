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
    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const result = await pool.query(
      'SELECT * FROM public.institutions WHERE id = $1',
      [profile.institution_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 })
    }

    return NextResponse.json({ branding: result.rows[0] })
  } catch (error: any) {
    console.error('Error fetching branding:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { logo_url, primary_color, secondary_color, accent_color, custom_css, custom_domain, white_label_enabled } = body

    const result = await pool.query(`
      UPDATE public.institutions SET
        logo_url = $1,
        primary_color = $2,
        secondary_color = $3,
        accent_color = $4,
        custom_css = $5,
        custom_domain = $6,
        white_label_enabled = $7
      WHERE id = $8
      RETURNING *
    `, [
      logo_url,
      primary_color,
      secondary_color,
      accent_color,
      custom_css,
      custom_domain,
      white_label_enabled,
      profile.institution_id
    ])

    return NextResponse.json({ branding: result.rows[0] })
  } catch (error: any) {
    console.error('Error updating branding:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
