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
      SELECT institution_id, role FROM public.profiles WHERE id = $1
    `, [user.id])

    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    let dateFilter = "created_at >= NOW() - INTERVAL '30 days'"
    if (period === 'quarter') {
      dateFilter = "created_at >= NOW() - INTERVAL '90 days'"
    } else if (period === 'year') {
      dateFilter = "created_at >= NOW() - INTERVAL '365 days'"
    }

    const residentsResult = await pool.query(`
      SELECT 
        p.id,
        p.full_name,
        p.specialty_id,
        s.name as specialty_name,
        COUNT(c.id) as total_cases,
        COUNT(CASE WHEN c.verified_at IS NOT NULL THEN 1 END) as verified_cases,
        COUNT(DISTINCT c.category) as categories_logged,
        MAX(c.created_at) as last_case_date,
        AVG(CASE WHEN c.created_at IS NOT NULL THEN 1.0 ELSE NULL END) as avg_daily_cases
      FROM public.profiles p
      LEFT JOIN public.specialties s ON p.specialty_id = s.id
      LEFT JOIN public.cases c ON c.resident_id = p.id AND ${dateFilter}
      WHERE p.institution_id = $1 AND p.role = 'resident'
      GROUP BY p.id, p.full_name, p.specialty_id, s.name
      ORDER BY total_cases DESC
    `, [profile.institution_id])

    const caseTrendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        resident_id,
        COUNT(*) as cases
      FROM public.cases
      WHERE institution_id = $1 AND ${dateFilter}
      GROUP BY DATE_TRUNC('month', created_at), resident_id
      ORDER BY month
    `, [profile.institution_id])

    const categoryResult = await pool.query(`
      SELECT 
        c.resident_id,
        p.full_name,
        c.category,
        COUNT(*) as count
      FROM public.cases c
      JOIN public.profiles p ON c.resident_id = p.id
      WHERE p.institution_id = $1 AND ${dateFilter}
      GROUP BY c.resident_id, p.full_name, c.category
      ORDER BY c.resident_id, count DESC
    `, [profile.institution_id])

    const averages = residentsResult.rows.reduce((acc, r) => {
      acc.totalCases += parseInt(r.total_cases) || 0
      acc.verifiedCases += parseInt(r.verified_cases) || 0
      return acc
    }, { totalCases: 0, verifiedCases: 0 })

    averages.totalCases = Math.round(averages.totalCases / Math.max(residentsResult.rows.length, 1))
    averages.verifiedCases = Math.round(averages.verifiedCases / Math.max(residentsResult.rows.length, 1))

    const comparison = residentsResult.rows.map(resident => {
      const totalCases = parseInt(resident.total_cases) || 0
      const verifiedCases = parseInt(resident.verified_cases) || 0
      const categories = parseInt(resident.categories_logged) || 0

      return {
        ...resident,
        total_cases: totalCases,
        verified_cases: verifiedCases,
        verification_rate: totalCases > 0 ? Math.round((verifiedCases / totalCases) * 100) : 0,
        performance_vs_average: {
          cases: totalCases - averages.totalCases,
          verified: verifiedCases - averages.verifiedCases,
          cases_percent: averages.totalCases > 0 ? Math.round(((totalCases - averages.totalCases) / averages.totalCases) * 100) : 0
        },
        ranking: {
          by_cases: 0,
          by_verified: 0,
          by_categories: 0
        }
      }
    })

    comparison.sort((a, b) => b.total_cases - a.total_cases)
    comparison.forEach((c, i) => c.ranking.by_cases = i + 1)

    comparison.sort((a, b) => b.verified_cases - a.verified_cases)
    comparison.forEach((c, i) => c.ranking.by_verified = i + 1)

    comparison.sort((a, b) => b.categories_logged - a.categories_logged)
    comparison.forEach((c, i) => c.ranking.by_categories = i + 1)

    const categoryBreakdown: Record<string, Record<string, number>> = {}
    categoryResult.rows.forEach(row => {
      if (!categoryBreakdown[row.resident_id]) {
        categoryBreakdown[row.resident_id] = {}
      }
      categoryBreakdown[row.resident_id][row.category] = parseInt(row.count)
    })

    return NextResponse.json({
      residents: comparison,
      averages,
      trends: caseTrendResult.rows,
      category_breakdown: categoryBreakdown,
      period
    })
  } catch (error: any) {
    console.error('Error fetching comparison:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
