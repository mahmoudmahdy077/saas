import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAdminUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  if (!user) return null

  const result = await pool.query('SELECT role FROM public.profiles WHERE id = $1', [user.id])
  if (result.rows[0]?.role !== 'super_admin') return null

  return user
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // List all countries
    if (action === 'list' || !action) {
      const result = await pool.query(`
        SELECT * FROM country_config 
        WHERE is_active = true 
        ORDER BY name
      `)
      return NextResponse.json({ countries: result.rows })
    }

    // Get single country
    if (action === 'get' && searchParams.get('code')) {
      const result = await pool.query(
        'SELECT * FROM country_config WHERE country_code = $1',
        [searchParams.get('code')]
      )
      return NextResponse.json({ country: result.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, country } = body

    if (action === 'create' || action === 'update') {
      if (action === 'create') {
        const result = await pool.query(`
          INSERT INTO country_config (country_code, name, medical_council, default_timezone, date_format, features, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [
          country.country_code, country.name, country.medical_council,
          country.default_timezone || 'UTC', country.date_format || 'YYYY-MM-DD',
          country.features || {}, country.is_active !== false
        ])
        return NextResponse.json({ country: result.rows[0] })
      } else {
        const result = await pool.query(`
          UPDATE country_config SET
            name = $1, medical_council = $2, default_timezone = $3, 
            date_format = $4, features = $5, is_active = $6
          WHERE country_code = $7
          RETURNING *
        `, [
          country.name, country.medical_council, country.default_timezone,
          country.date_format, country.features || {}, country.is_active, country.country_code
        ])
        return NextResponse.json({ country: result.rows[0] })
      }
    }

    if (action === 'delete' && country.country_code) {
      await pool.query('DELETE FROM country_config WHERE country_code = $1', [country.country_code])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
