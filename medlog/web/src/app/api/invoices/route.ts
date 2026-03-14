export const dynamic = 'force-dynamic'

import { logger } from '@/lib/logger'
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = `
      SELECT i.*, inst.name as institution_name
      FROM public.invoices i
      LEFT JOIN public.institutions inst ON i.institution_id = inst.id
      WHERE i.institution_id IN (
        SELECT institution_id FROM public.profiles WHERE id = $1
      )
    `
    const params: any[] = [user.id]

    if (status && status !== 'all') {
      params.push(status)
      query += ` AND i.status = $${params.length}`
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    const countQuery = `
      SELECT COUNT(*) FROM public.invoices
      WHERE institution_id IN (
        SELECT institution_id FROM public.profiles WHERE id = $1
      )
      ${status && status !== 'all' ? `AND status = $2` : ''}
    `
    const countResult = await pool.query(countQuery, status && status !== 'all' ? [user.id, status] : [user.id])

    return NextResponse.json({
      invoices: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset
    })
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
