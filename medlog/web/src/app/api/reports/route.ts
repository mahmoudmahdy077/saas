import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabase.auth.getUser(accessToken)
  return user
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'case_volume'
    const period = searchParams.get('period') || undefined
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || undefined
    const residentId = searchParams.get('resident_id') || undefined

    const profileResult = await pool.query(`
      SELECT role, institution_id FROM public.profiles WHERE id = $1
    `, [user.id])

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { role, institution_id } = profileResult.rows[0]

    if (!institution_id || !['program_director', 'institution_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden - PD or Admin access required' }, { status: 403 })
    }

    if (reportType === 'case_volume') {
      return getCaseVolumeReport(institution_id, period, startDate, endDate)
    }

    if (reportType === 'minimums') {
      return getCaseMinimumsReport(institution_id, period, startDate, endDate, residentId)
    }

    if (reportType === 'resident_summary') {
      return getResidentSummaryReport(institution_id, period, startDate, endDate, residentId)
    }

    if (reportType === 'milestone') {
      return getMilestoneReport(institution_id, residentId)
    }

    return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })

  } catch (error: any) {
    console.error('Reports API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function getCaseVolumeReport(institutionId: string, period?: string, startDate?: string, endDate?: string) {
  let dateFilter = ''
  const params: any[] = [institutionId]

  if (startDate && endDate) {
    dateFilter = 'AND c.date >= $2 AND c.date <= $3'
    params.push(startDate, endDate)
  } else if (period) {
    const [year, month] = period.split('-')
    if (year && month) {
      dateFilter = `AND EXTRACT(YEAR FROM c.date) = $2 AND EXTRACT(MONTH FROM c.date) = $3`
      params.push(parseInt(year), parseInt(month))
    } else if (year) {
      dateFilter = 'AND EXTRACT(YEAR FROM c.date) = $2'
      params.push(parseInt(year))
    }
  }

  const query = `
    SELECT 
      p.id as resident_id,
      p.full_name,
      p.role as resident_role,
      COUNT(c.id) as total_cases,
      COUNT(CASE WHEN c.verification_status = 'consultant_verified' OR c.verification_status = 'pd_approved' THEN 1 END) as verified_cases,
      COUNT(CASE WHEN c.role = 'primary' THEN 1 END) as primary_cases,
      COUNT(CASE WHEN c.role = 'assistant' THEN 1 END) as assistant_cases,
      COUNT(CASE WHEN c.role = 'observer' THEN 1 END) as observer_cases,
      COUNT(DISTINCT c.category) as categories_covered,
      COUNT(DISTINCT c.specialty_id) as specialties_covered
    FROM public.cases c
    JOIN public.profiles p ON c.user_id = p.id
    WHERE p.institution_id = $1 ${dateFilter}
    GROUP BY p.id, p.full_name, p.role
    ORDER BY total_cases DESC
  `

  const result = await pool.query(query, params)

  const monthlyTrend = await pool.query(`
    SELECT 
      TO_CHAR(c.date, 'YYYY-MM') as month,
      COUNT(*) as case_count,
      COUNT(DISTINCT c.user_id) as residents_logging
    FROM public.cases c
    JOIN public.profiles p ON c.user_id = p.id
    WHERE p.institution_id = $1
    GROUP BY TO_CHAR(c.date, 'YYYY-MM')
    ORDER BY month DESC
    LIMIT 12
  `, [institutionId])

  const categoryBreakdown = await pool.query(`
    SELECT 
      c.category,
      COUNT(*) as case_count,
      COUNT(DISTINCT c.user_id) as residents_count
    FROM public.cases c
    JOIN public.profiles p ON c.user_id = p.id
    WHERE p.institution_id = $1 ${dateFilter}
    GROUP BY c.category
    ORDER BY case_count DESC
  `, params)

  return NextResponse.json({
    report_type: 'case_volume',
    by_resident: result.rows,
    monthly_trend: monthlyTrend.rows,
    by_category: categoryBreakdown.rows,
    summary: {
      total_cases: result.rows.reduce((sum, r) => sum + parseInt(r.total_cases), 0),
      total_residents: result.rows.length,
      avg_cases_per_resident: result.rows.length > 0
        ? Math.round(result.rows.reduce((sum, r) => sum + parseInt(r.total_cases), 0) / result.rows.length)
        : 0
    }
  })
}

async function getCaseMinimumsReport(institutionId: string, period?: string, startDate?: string, endDate?: string, residentId?: string) {
  let dateFilter = ''
  const params: any[] = [institutionId]
  let paramIndex = 2

  if (startDate && endDate) {
    dateFilter = `AND c.date >= $${paramIndex} AND c.date <= $${paramIndex + 1}`
    params.push(startDate, endDate)
    paramIndex += 2
  }

  const minimumsResult = await pool.query('SELECT * FROM public.case_minimums ORDER BY category')
  const minimums = minimumsResult.rows

  let residentFilter = ''
  if (residentId) {
    residentFilter = `AND c.user_id = $${paramIndex}`
    params.push(residentId)
  }

  const casesByCategory = await pool.query(`
    SELECT 
      c.category,
      c.user_id,
      COUNT(*) as case_count
    FROM public.cases c
    JOIN public.profiles p ON c.user_id = p.id
    WHERE p.institution_id = $1 ${dateFilter} ${residentFilter}
    GROUP BY c.category, c.user_id
  `, params)

  const residentResult = await pool.query(`
    SELECT id, full_name FROM public.profiles 
    WHERE institution_id = $1 AND role = 'resident'
    ${residentId ? 'AND id = $2' : ''}
    ORDER BY full_name
  `, residentId ? [institutionId, residentId] : [institutionId])

  const complianceData = residentResult.rows.map(resident => {
    const residentCases = casesByCategory.rows.filter((c: any) => c.user_id === resident.id)
    const categoryMap = new Map(residentCases.map((c: any) => [c.category, parseInt(c.case_count)]))

    const categoryCompliance = minimums.map((min: any) => {
      const actual = categoryMap.get(min.category) || 0
      const percentage = Math.min(100, (actual / min.minimum_required) * 100)
      return {
        category: min.category,
        required: min.minimum_required,
        actual,
        percentage: Math.round(percentage),
        compliant: actual >= min.minimum_required
      }
    })

    const compliantCategories = categoryCompliance.filter((c: any) => c.compliant).length
    const overallCompliance = Math.round((compliantCategories / minimums.length) * 100)

    return {
      resident_id: resident.id,
      resident_name: resident.full_name,
      overall_compliance: overallCompliance,
      compliant_categories: compliantCategories,
      total_categories: minimums.length,
      categories: categoryCompliance
    }
  })

  return NextResponse.json({
    report_type: 'case_minimums',
    minimums_required: minimums,
    residents: complianceData,
    summary: {
      total_residents: complianceData.length,
      fully_compliant: complianceData.filter((r: any) => r.overall_compliance === 100).length,
      at_risk: complianceData.filter((r: any) => r.overall_compliance < 50).length,
      avg_compliance: complianceData.length > 0
        ? Math.round(complianceData.reduce((sum: number, r: any) => sum + r.overall_compliance, 0) / complianceData.length)
        : 0
    }
  })
}

async function getResidentSummaryReport(institutionId: string, period?: string, startDate?: string, endDate?: string, residentId?: string) {
  let dateFilter = ''
  const params: any[] = [institutionId]
  let paramIndex = 2

  if (startDate && endDate) {
    dateFilter = `AND c.date >= $${paramIndex} AND c.date <= $${paramIndex + 1}`
    params.push(startDate, endDate)
    paramIndex += 2
  }

  let residentFilter = ''
  if (residentId) {
    residentFilter = `AND c.user_id = $${paramIndex}`
    params.push(residentId)
  }

  const summaryQuery = `
    SELECT 
      p.id as resident_id,
      p.full_name,
      p.current_streak,
      p.longest_streak,
      COUNT(c.id) as total_cases,
      COUNT(CASE WHEN c.verification_status = 'consultant_verified' THEN 1 END) as consultant_verified,
      COUNT(CASE WHEN c.verification_status = 'pd_approved' THEN 1 END) as pd_approved,
      COUNT(CASE WHEN c.verification_status = 'self' THEN 1 END) as self_logged,
      COUNT(DISTINCT c.category) as categories_logged,
      MIN(c.date) as first_case_date,
      MAX(c.date) as last_case_date,
      AVG(EXTRACT(EPOCH FROM (c.created_at - c.date))/86400) as avg_documentation_delay
    FROM public.profiles p
    LEFT JOIN public.cases c ON p.id = c.user_id ${dateFilter ? dateFilter : ''}
    WHERE p.institution_id = $1 AND p.role = 'resident' ${residentFilter}
    GROUP BY p.id, p.full_name, p.current_streak, p.longest_streak
    ORDER BY total_cases DESC
  `

  const result = await pool.query(summaryQuery, params)

  const enrichedResults = await Promise.all(result.rows.map(async (resident: any) => {
    const categoryBreakdown = await pool.query(`
      SELECT 
        c.category,
        COUNT(*) as count,
        COUNT(CASE WHEN c.role = 'primary' THEN 1 END) as primary_role,
        COUNT(CASE WHEN c.role = 'assistant' THEN 1 END) as assistant_role
      FROM public.cases c
      WHERE c.user_id = $1 ${dateFilter}
      GROUP BY c.category
      ORDER BY count DESC
    `, [resident.resident_id])

    const verificationRate = resident.total_cases > 0
      ? Math.round(((resident.consultant_verified + resident.pd_approved) / resident.total_cases) * 100)
      : 0

    return {
      ...resident,
      verification_rate: verificationRate,
      categories: categoryBreakdown.rows,
      documentation_quality: getDocumentationQuality(resident.avg_documentation_delay)
    }
  }))

  return NextResponse.json({
    report_type: 'resident_summary',
    residents: enrichedResults,
    summary: {
      total_residents: enrichedResults.length,
      total_cases: enrichedResults.reduce((sum: number, r: any) => sum + parseInt(r.total_cases), 0),
      avg_verification_rate: enrichedResults.length > 0
        ? Math.round(enrichedResults.reduce((sum: number, r: any) => sum + r.verification_rate, 0) / enrichedResults.length)
        : 0,
      avg_cases_per_resident: enrichedResults.length > 0
        ? Math.round(enrichedResults.reduce((sum: number, r: any) => sum + parseInt(r.total_cases), 0) / enrichedResults.length)
        : 0
    }
  })
}

async function getMilestoneReport(institutionId: string, residentId?: string) {
  const milestonesResult = await pool.query('SELECT * FROM public.milestone_definitions ORDER BY milestone_number')
  const milestones = milestonesResult.rows

  let residentFilter = ''
  const params: any[] = [institutionId]

  if (residentId) {
    residentFilter = 'AND p.id = $2'
    params.push(residentId)
  }

  const residentsResult = await pool.query(`
    SELECT p.id, p.full_name FROM public.profiles p
    WHERE p.institution_id = $1 AND p.role = 'resident' ${residentFilter}
    ORDER BY p.full_name
  `, params)

  const assessmentsResult = await pool.query(`
    SELECT * FROM public.milestone_assessments
    WHERE resident_id = ANY($1)
  `, [residentsResult.rows.map((r: any) => r.id)])

  const milestoneData = residentsResult.rows.map(resident => {
    const assessments = assessmentsResult.rows.filter((a: any) => a.resident_id === resident.id)

    const milestoneLevels = milestones.map((milestone: any) => {
      const assessment = assessments.find((a: any) => a.milestone_id === milestone.id)
      return {
        milestone_number: milestone.milestone_number,
        competency_area: milestone.competency_area,
        current_level: assessment?.level || null,
        last_assessed: assessment?.assessment_date || null,
        notes: assessment?.notes || null
      }
    })

    const avgLevel = milestoneLevels.filter((m: any) => m.current_level !== null)
      .reduce((sum: number, m: any) => sum + m.current_level, 0) /
      (milestoneLevels.filter((m: any) => m.current_level !== null).length || 1)

    return {
      resident_id: resident.id,
      resident_name: resident.full_name,
      average_milestone_level: Math.round(avgLevel * 10) / 10,
      milestones: milestoneLevels
    }
  })

  return NextResponse.json({
    report_type: 'milestone',
    milestone_definitions: milestones,
    residents: milestoneData,
    summary: {
      total_residents: milestoneData.length,
      avg_program_level: milestoneData.length > 0
        ? Math.round(milestoneData.reduce((sum: number, r: any) => sum + r.average_milestone_level, 0) / milestoneData.length * 10) / 10
        : 0
    }
  })
}

function getDocumentationQuality(avgDelay: number): string {
  if (avgDelay === null || avgDelay === undefined || isNaN(avgDelay)) return 'Unknown'
  if (avgDelay < 1) return 'Excellent'
  if (avgDelay < 3) return 'Good'
  if (avgDelay < 7) return 'Fair'
  return 'Needs Improvement'
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profileResult = await pool.query(`
      SELECT role, institution_id FROM public.profiles WHERE id = $1
    `, [user.id])

    if (profileResult.rows.length === 0) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { role, institution_id } = profileResult.rows[0]

    if (!institution_id || !['program_director', 'institution_admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, report_type, data, start_date, end_date, resident_id, milestone_id, level, notes } = body

    if (action === 'save_report' && report_type) {
      const insertResult = await pool.query(`
        INSERT INTO public.acgme_reports (institution_id, report_type, period_start, period_end, data, generated_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [institution_id, report_type, start_date, end_date, JSON.stringify(data), user.id])

      return NextResponse.json({ report: insertResult.rows[0] })
    }

    if (action === 'submit_milestone_assessment' && resident_id && milestone_id) {
      const insertResult = await pool.query(`
        INSERT INTO public.milestone_assessments (resident_id, milestone_id, assessor_id, level, assessment_date, notes)
        VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
        RETURNING *
      `, [resident_id, milestone_id, user.id, level, notes])

      return NextResponse.json({ assessment: insertResult.rows[0] })
    }

    if (action === 'get_saved_reports') {
      const reportsResult = await pool.query(`
        SELECT * FROM public.acgme_reports
        WHERE institution_id = $1
        ORDER BY created_at DESC
        LIMIT 20
      `, [institution_id])

      return NextResponse.json({ reports: reportsResult.rows })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
