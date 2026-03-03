import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

function generateShareToken(): string {
  return randomBytes(16).toString('hex')
}

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
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (token) {
      const result = await pool.query(`
        SELECT p.*, u.email, pr.full_name
        FROM public.portfolios p
        JOIN auth.users u ON p.user_id = u.id
        JOIN public.profiles pr ON p.user_id = pr.id
        WHERE p.share_token = $1 AND p.is_public = true
      `, [token])

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
      }

      const portfolio = result.rows[0]
      const statsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_cases,
          COUNT(DISTINCT category) as categories,
          COUNT(CASE WHEN verified_at IS NOT NULL THEN 1 END) as verified_cases
        FROM public.cases WHERE resident_id = $1
      `, [portfolio.user_id])

      return NextResponse.json({
        portfolio,
        stats: statsResult.rows[0],
        is_public_view: true
      })
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    let result = await pool.query(`
      SELECT * FROM public.portfolios WHERE user_id = $1
    `, [user.id])

    let portfolio = result.rows[0]

    if (!portfolio) {
      const insertResult = await pool.query(`
        INSERT INTO public.portfolios (user_id, share_token)
        VALUES ($1, $2)
        RETURNING *
      `, [user.id, generateShareToken()])

      portfolio = insertResult.rows[0]
    }

    const publicationsResult = await pool.query(`
      SELECT * FROM public.portfolio_publications
      WHERE portfolio_id = $1
      ORDER BY date DESC
    `, [portfolio.id])

    return NextResponse.json({
      portfolio,
      publications: publicationsResult.rows
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, bio, is_public } = body

    let portfolio = await pool.query(`
      SELECT * FROM public.portfolios WHERE user_id = $1
    `, [user.id])

    if (portfolio.rows.length === 0) {
      const result = await pool.query(`
        INSERT INTO public.portfolios (user_id, title, bio, is_public, share_token)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [user.id, title, bio, is_public, generateShareToken()])
      return NextResponse.json({ portfolio: result.rows[0] })
    }

    const result = await pool.query(`
      UPDATE public.portfolios SET
        title = $1,
        bio = $2,
        is_public = $3,
        updated_at = NOW()
      WHERE user_id = $4
      RETURNING *
    `, [title, bio, is_public, user.id])

    return NextResponse.json({ portfolio: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
