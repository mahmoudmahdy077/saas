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
    const requestId = searchParams.get('id')
    const token = searchParams.get('token')

    if (token) {
      const result = await pool.query(`
        SELECT rr.*, p.full_name as resident_name
        FROM public.reference_requests rr
        JOIN public.profiles p ON rr.resident_id = p.id
        WHERE rr.id = $1 AND rr.status = 'pending'
      `, [token])

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Reference request not found or already submitted' }, { status: 404 })
      }

      return NextResponse.json({ request: result.rows[0] })
    }

    const profileResult = await pool.query(
      'SELECT role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const role = profileResult.rows[0]?.role

    let query = ''
    let params: any[] = []

    if (role === 'resident') {
      query = `
        SELECT rr.*, p.full_name as requester_name
        FROM public.reference_requests rr
        LEFT JOIN public.profiles p ON rr.requester_id = p.id
        WHERE rr.resident_id = $1
        ORDER BY rr.created_at DESC
      `
      params = [user.id]
    } else {
      query = `
        SELECT rr.*, p.full_name as resident_name
        FROM public.reference_requests rr
        JOIN public.profiles p ON rr.resident_id = p.id
        WHERE rr.requester_id = $1 OR p.institution_id = (
          SELECT institution_id FROM public.profiles WHERE id = $1
        )
        ORDER BY rr.created_at DESC
      `
      params = [user.id]
    }

    const result = await pool.query(query, params)
    return NextResponse.json({ requests: result.rows })
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
    const body = await request.json()
    const { action, request: req } = body

    if (action === 'create') {
      const result = await pool.query(`
        INSERT INTO public.reference_requests (
          resident_id,
          requester_id,
          recipient_email,
          recipient_name
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        req.resident_id,
        user.id,
        req.recipient_email,
        req.recipient_name
      ])

      return NextResponse.json({ request: result.rows[0] })
    }

    if (action === 'submit' && req.id && req.letter_content) {
      const result = await pool.query(`
        UPDATE public.reference_requests SET
          status = 'submitted',
          letter_content = $1,
          submitted_at = NOW()
        WHERE id = $2
        RETURNING *
      `, [req.letter_content, req.id])

      return NextResponse.json({ request: result.rows[0] })
    }

    if (action === 'decline' && req.id) {
      await pool.query(`
        UPDATE public.reference_requests SET status = 'declined' WHERE id = $1
      `, [req.id])

      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && req.id) {
      await pool.query(`DELETE FROM public.reference_requests WHERE id = $1`, [req.id])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
