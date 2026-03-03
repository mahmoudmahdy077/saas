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
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resource_type')
    const userId = searchParams.get('user_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let query = `
      SELECT al.*, p.full_name as user_name, p.email as user_email
      FROM public.audit_logs al
      LEFT JOIN public.profiles p ON al.user_id = p.id
      WHERE 1=1
    `
    const params: any[] = []

    if (profile.role === 'resident') {
      query += ` AND al.user_id = $${params.length + 1}`
      params.push(user.id)
    } else if (profile.role === 'program_director' || profile.role === 'institution_admin') {
      query += ` AND al.institution_id = $${params.length + 1}`
      params.push(profile.institution_id)
    } else if (profile.role === 'super_admin') {
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (action) {
      params.push(action)
      query += ` AND al.action = $${params.length}`
    }

    if (resourceType) {
      params.push(resourceType)
      query += ` AND al.resource_type = $${params.length}`
    }

    if (userId) {
      params.push(userId)
      query += ` AND al.user_id = $${params.length}`
    }

    if (startDate) {
      params.push(startDate)
      query += ` AND al.created_at >= $${params.length}`
    }

    if (endDate) {
      params.push(endDate)
      query += ` AND al.created_at <= $${params.length}`
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    return NextResponse.json({
      audit_logs: result.rows,
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error fetching audit logs:', error)
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
    const { action, resource_type, resource_id, details } = body

    if (!action || !resource_type) {
      return NextResponse.json({ error: 'Action and resource_type are required' }, { status: 400 })
    }

    let profileResult = await pool.query(
      'SELECT institution_id FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const institutionId = profileResult.rows[0]?.institution_id

    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = await pool.query(`
      INSERT INTO public.audit_logs (
        user_id,
        institution_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      user.id,
      institutionId,
      action,
      resource_type,
      resource_id,
      details || {},
      ipAddress,
      userAgent
    ])

    return NextResponse.json({ audit_log: result.rows[0] })
  } catch (error: any) {
    console.error('Error creating audit log:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
