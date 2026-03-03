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
    const portfolioResult = await pool.query(`
      SELECT id FROM public.portfolios WHERE user_id = $1
    `, [user.id])

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json({ publications: [] })
    }

    const result = await pool.query(`
      SELECT * FROM public.portfolio_publications
      WHERE portfolio_id = $1
      ORDER BY date DESC
    `, [portfolioResult.rows[0].id])

    return NextResponse.json({ publications: result.rows })
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
    const portfolioResult = await pool.query(`
      SELECT id FROM public.portfolios WHERE user_id = $1
    `, [user.id])

    if (portfolioResult.rows.length === 0) {
      return NextResponse.json({ error: 'Create a portfolio first' }, { status: 400 })
    }

    const body = await request.json()
    const { title, type, journal, date, description } = body

    const result = await pool.query(`
      INSERT INTO public.portfolio_publications (portfolio_id, title, type, journal, date, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [portfolioResult.rows[0].id, title, type, journal, date || null, description])

    return NextResponse.json({ publication: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Publication ID required' }, { status: 400 })
    }

    await pool.query(`
      DELETE FROM public.portfolio_publications 
      WHERE id = $1 AND portfolio_id IN (
        SELECT id FROM public.portfolios WHERE user_id = $2
      )
    `, [id, user.id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
