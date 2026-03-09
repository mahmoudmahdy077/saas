export const dynamic = 'force-dynamic'

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
    const profileResult = await pool.query(`
      SELECT p.institution_id, p.role, i.plan
      FROM public.profiles p
      JOIN public.institution_subscriptions i ON p.institution_id = i.institution_id
      WHERE p.id = $1
    `, [user.id])

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const { institution_id, role, plan } = profileResult.rows[0]

    if (!['program_director', 'institution_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const planLimits = {
      free: { ai_analyses: 10, storage_mb: 100, cases_per_month: 100 },
      basic: { ai_analyses: 100, storage_mb: 1000, cases_per_month: 500 },
      pro: { ai_analyses: 500, storage_mb: 5000, cases_per_month: 2000 },
      enterprise: { ai_analyses: -1, storage_mb: -1, cases_per_month: -1 }
    }

    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.free

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const usageResult = await pool.query(`
      SELECT 
        COUNT(*) as ai_analyses_count,
        COALESCE(SUM(cost_usd), 0) as ai_cost
      FROM public.ai_usage
      WHERE institution_id = $1 AND created_at >= $2
    `, [institution_id, monthStart])

    const casesResult = await pool.query(`
      SELECT COUNT(*) as cases_count
      FROM public.cases
      WHERE institution_id = $1 AND created_at >= $2
    `, [institution_id, monthStart])

    const usage = {
      ai_analyses: parseInt(usageResult.rows[0].ai_analyses_count) || 0,
      ai_cost: parseFloat(usageResult.rows[0].ai_cost) || 0,
      cases_count: parseInt(casesResult.rows[0].cases_count) || 0
    }

    const overages: string[] = []
    
    if (limits.ai_analyses > 0 && usage.ai_analyses > limits.ai_analyses) {
      const overageCount = usage.ai_analyses - limits.ai_analyses
      const overageCost = overageCount * 0.01
      overages.push(`AI analyses: ${overageCount} over limit ($${overageCost.toFixed(2)})`)
    }

    if (limits.cases_per_month > 0 && usage.cases_count > limits.cases_per_month) {
      const overageCount = usage.cases_count - limits.cases_per_month
      const overageCost = overageCount * 0.05
      overages.push(`Cases: ${overageCount} over limit ($${overageCost.toFixed(2)})`)
    }

    return NextResponse.json({
      plan,
      limits,
      usage,
      overages,
      period: {
        start: monthStart,
        end: now.toISOString()
      }
    })
  } catch (error: any) {
    console.error('Error fetching usage billing:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
