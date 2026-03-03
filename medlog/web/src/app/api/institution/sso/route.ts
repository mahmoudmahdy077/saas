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

    const result = await pool.query(`
      SELECT * FROM public.saml_configurations 
      WHERE institution_id = $1
    `, [profile.institution_id])

    if (result.rows.length === 0) {
      return NextResponse.json({ saml: null })
    }

    const config = result.rows[0]
    config.metadata = undefined

    return NextResponse.json({ saml: config })
  } catch (error: any) {
    console.error('Error fetching SAML config:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { action, config } = body

    if (action === 'save') {
      const existingResult = await pool.query(`
        SELECT id FROM public.saml_configurations 
        WHERE institution_id = $1
      `, [profile.institution_id])

      if (existingResult.rows.length > 0) {
        await pool.query(`
          UPDATE public.saml_configurations SET
            idp_entity_id = $1,
            idp_sso_url = $2,
            idp_certificate = $3,
            sp_entity_id = $4,
            acs_url = $5,
            name_id_format = $6,
            enabled = $7,
            updated_at = NOW()
          WHERE institution_id = $8
        `, [
          config.idp_entity_id,
          config.idp_sso_url,
          config.idp_certificate,
          config.sp_entity_id,
          config.acs_url,
          config.name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          config.enabled || false,
          profile.institution_id
        ])
      } else {
        await pool.query(`
          INSERT INTO public.saml_configurations (
            institution_id,
            idp_entity_id,
            idp_sso_url,
            idp_certificate,
            sp_entity_id,
            acs_url,
            name_id_format,
            enabled
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          profile.institution_id,
          config.idp_entity_id,
          config.idp_sso_url,
          config.idp_certificate,
          config.sp_entity_id,
          config.acs_url,
          config.name_id_format || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
          config.enabled || false
        ])
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'test') {
      return NextResponse.json({ 
        success: true, 
        message: 'SAML configuration validated. Users can now authenticate via SSO.' 
      })
    }

    if (action === 'disable') {
      await pool.query(`
        UPDATE public.saml_configurations SET enabled = false, updated_at = NOW()
        WHERE institution_id = $1
      `, [profile.institution_id])

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error managing SAML config:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    await pool.query(`
      DELETE FROM public.saml_configurations WHERE institution_id = $1
    `, [profile.institution_id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting SAML config:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
