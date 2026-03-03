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

const TOKEN_PRICING: Record<string, { prompt: number; completion: number }> = {
  'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 },
  'gpt-4': { prompt: 0.03, completion: 0.06 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-4o': { prompt: 0.0025, completion: 0.01 },
  'claude-3-opus': { prompt: 0.015, completion: 0.075 },
  'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
  'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
}

function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = TOKEN_PRICING[model] || TOKEN_PRICING['gpt-3.5-turbo']
  return ((promptTokens * pricing.prompt) + (completionTokens * pricing.completion)) / 1000
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const userId = searchParams.get('user_id')

    let profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    let dateFilter = "created_at >= NOW() - INTERVAL '30 days'"
    if (period === 'day') {
      dateFilter = "created_at >= NOW() - INTERVAL '24 hours'"
    } else if (period === 'week') {
      dateFilter = "created_at >= NOW() - INTERVAL '7 days'"
    }

    let query = `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost,
        COUNT(*) as request_count,
        action_type
      FROM public.ai_usage
      WHERE ${dateFilter}
    `
    const params: any[] = []

    if (profile.role === 'resident') {
      query += ` AND user_id = $${params.length + 1}`
      params.push(user.id)
    } else if (profile.role === 'program_director' || profile.role === 'institution_admin') {
      query += ` AND institution_id = $${params.length + 1}`
      params.push(profile.institution_id)
    } else if (userId && profile.role === 'super_admin') {
      query += ` AND user_id = $${params.length + 1}`
      params.push(userId)
    }

    query += ` GROUP BY DATE_TRUNC('day', created_at), action_type ORDER BY date DESC`

    const result = await pool.query(query, params)

    const summaryQuery = `
      SELECT 
        SUM(total_tokens) as total_tokens,
        SUM(cost_usd) as total_cost,
        COUNT(*) as total_requests,
        COUNT(DISTINCT user_id) as unique_users
      FROM public.ai_usage
      WHERE ${dateFilter}
      ${profile.role === 'resident' ? `AND user_id = $${params.length + 1}` : ''}
      ${profile.role === 'program_director' || profile.role === 'institution_admin' ? `AND institution_id = $${params.length + 1}` : ''}
    `
    const summaryResult = await pool.query(summaryQuery, profile.role === 'resident' || profile.role === 'program_director' || profile.role === 'institution_admin' ? [...params] : [])

    return NextResponse.json({
      usage: result.rows,
      summary: summaryResult.rows[0]
    })
  } catch (error: any) {
    console.error('Error fetching AI usage:', error)
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
    const { action, usage } = body

    if (action === 'track') {
      const profileResult = await pool.query(
        'SELECT institution_id FROM public.profiles WHERE id = $1',
        [user.id]
      )
      const institutionId = profileResult.rows[0]?.institution_id

      const cost = calculateCost(
        usage.model || 'gpt-3.5-turbo',
        usage.prompt_tokens || 0,
        usage.completion_tokens || 0
      )

      const result = await pool.query(`
        INSERT INTO public.ai_usage (
          user_id,
          institution_id,
          provider,
          model,
          prompt_tokens,
          completion_tokens,
          total_tokens,
          cost_usd,
          latency_ms,
          action_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        user.id,
        institutionId,
        usage.provider,
        usage.model,
        usage.prompt_tokens || 0,
        usage.completion_tokens || 0,
        (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
        cost,
        usage.latency_ms,
        usage.action_type || 'ai_analysis'
      ])

      return NextResponse.json({ usage: result.rows[0], cost })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Error tracking AI usage:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
