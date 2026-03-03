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
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const institutionId = searchParams.get('institution_id')

  try {
    if (institutionId) {
      const result = await pool.query(`
        SELECT 
          ic.*,
          i.name as integration_name,
          i.slug,
          i.description,
          i.logo_url,
          i.category,
          i.provider,
          i.website_url,
          i.documentation_url,
          i.auth_type
        FROM public.integration_configs ic
        JOIN public.integrations i ON ic.integration_id = i.id
        WHERE ic.institution_id = $1
        ORDER BY ic.created_at DESC
      `, [institutionId])

      return NextResponse.json({ integrations: result.rows })
    }

    let query = 'SELECT * FROM public.integrations'
    const params: any[] = []

    if (category) {
      query += ' WHERE category = $1'
      params.push(category)
    }

    query += ' ORDER BY is_featured DESC, name ASC'

    const result = await pool.query(query, params)
    return NextResponse.json({ integrations: result.rows })
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
    const { action, integrationId, config, credentials } = body

    if (action === 'connect') {
      const result = await pool.query(`
        INSERT INTO public.integration_configs (institution_id, integration_id, config, auth_credentials, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (institution_id, integration_id)
        DO UPDATE SET config = $3, auth_credentials = $4, is_active = true, updated_at = NOW()
        RETURNING *
      `, [
        profile.institution_id,
        integrationId,
        JSON.stringify(config || {}),
        JSON.stringify(credentials || {})
      ])

      return NextResponse.json({ config: result.rows[0] })
    }

    if (action === 'disconnect') {
      await pool.query(`
        UPDATE public.integration_configs 
        SET is_active = false, updated_at = NOW()
        WHERE institution_id = $1 AND integration_id = $2
      `, [profile.institution_id, integrationId])

      return NextResponse.json({ success: true })
    }

    if (action === 'updateConfig') {
      const result = await pool.query(`
        UPDATE public.integration_configs
        SET config = $1, updated_at = NOW()
        WHERE institution_id = $2 AND integration_id = $3
        RETURNING *
      `, [
        JSON.stringify(config || {}),
        profile.institution_id,
        integrationId
      ])

      return NextResponse.json({ config: result.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
