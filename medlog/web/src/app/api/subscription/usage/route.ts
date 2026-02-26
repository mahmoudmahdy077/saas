import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  return user
}

// Get current user's subscription and usage
export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get user's institution subscription
    if (action === 'current' || !action) {
      const profileResult = await pool.query(
        'SELECT institution_id FROM profiles WHERE id = $1',
        [user.id]
      )

      if (!profileResult.rows[0]?.institution_id) {
        return NextResponse.json({ 
          subscription: null, 
          usage: null, 
          plan: null,
          message: 'No institution found'
        })
      }

      const subResult = await pool.query(`
        SELECT s.*, p.name as plan_name, p.display_name as plan_display_name
        FROM institution_subscriptions s
        LEFT JOIN subscription_plans p ON s.plan_id = p.id
        WHERE s.institution_id = $1
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [profileResult.rows[0].institution_id])

      // Get current period usage
      const periodStart = new Date()
      periodStart.setDate(1)
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1, 0)

      const usageResult = await pool.query(`
        SELECT resource_type, SUM(count) as total
        FROM usage_records
        WHERE user_id = $1 
          AND period_start >= $2 
          AND period_end <= $3
        GROUP BY resource_type
      `, [user.id, periodStart, periodEnd])

      const usage: Record<string, number> = {}
      usageResult.rows.forEach(row => {
        usage[row.resource_type] = parseInt(row.total) || 0
      })

      return NextResponse.json({
        subscription: subResult.rows[0] || null,
        plan: subResult.rows[0] ? {
          name: subResult.rows[0].plan_name,
          max_cases_per_month: subResult.rows[0]?.max_cases_per_month,
          max_images_per_month: subResult.rows[0]?.max_images_per_month,
          max_ai_analyses: subResult.rows[0]?.max_ai_analyses,
          ai_enabled: subResult.rows[0]?.ai_enabled,
        } : null,
        usage,
        period: { start: periodStart, end: periodEnd }
      })
    }

    // Check specific feature availability
    if (action === 'check-feature') {
      const feature = searchParams.get('feature')
      
      const profileResult = await pool.query(
        'SELECT institution_id FROM profiles WHERE id = $1',
        [user.id]
      )

      if (!profileResult.rows[0]?.institution_id) {
        return NextResponse.json({ allowed: true }) // No institution = free tier
      }

      // Check feature flags
      const flagResult = await pool.query(`
        SELECT * FROM feature_flags 
        WHERE key = $1 AND is_global = true
      `, [feature])

      if (flagResult.rows.length > 0) {
        return NextResponse.json({ allowed: true })
      }

      return NextResponse.json({ allowed: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Record usage (internal use)
export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { resource_type, count = 1 } = body

    const profileResult = await pool.query(
      'SELECT institution_id FROM profiles WHERE id = $1',
      [user.id]
    )

    const periodStart = new Date()
    periodStart.setDate(1)
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1, 0)

    // Get subscription
    const subResult = await pool.query(`
      SELECT s.id as subscription_id
      FROM institution_subscriptions s
      WHERE s.institution_id = $1 AND s.status IN ('active', 'trial')
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [profileResult.rows[0]?.institution_id])

    if (subResult.rows.length > 0) {
      await pool.query(`
        INSERT INTO usage_records (subscription_id, user_id, resource_type, count, period_start, period_end)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [subResult.rows[0].subscription_id, user.id, resource_type, count, periodStart, periodEnd])
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
