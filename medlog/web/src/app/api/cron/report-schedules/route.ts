import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    const schedulesResult = await pool.query(`
      SELECT * FROM public.report_schedules
      WHERE is_active = true AND next_run_at <= $1
    `, [now])

    const results = []

    for (const schedule of schedulesResult.rows) {
      try {
        const periodEnd = new Date()
        let periodStart = new Date()

        switch (schedule.frequency) {
          case 'daily':
            periodStart.setDate(periodStart.getDate() - 1)
            break
          case 'weekly':
            periodStart.setDate(periodStart.getDate() - 7)
            break
          case 'monthly':
            periodStart.setMonth(periodStart.getMonth() - 1)
            break
          case 'quarterly':
            periodStart.setMonth(periodStart.getMonth() - 3)
            break
        }

        let reportData: any = {}

        switch (schedule.report_type) {
          case 'case_volume':
            const caseVolumeResult = await pool.query(`
              SELECT 
                DATE_TRUNC('month', created_at) as month,
                COUNT(*) as total_cases,
                COUNT(DISTINCT resident_id) as unique_residents
              FROM public.cases
              WHERE institution_id = $1 AND created_at >= $2 AND created_at <= $3
              GROUP BY DATE_TRUNC('month', created_at)
              ORDER BY month
            `, [schedule.institution_id, periodStart, periodEnd])
            reportData = { monthly_data: caseVolumeResult.rows }
            break

          case 'minimums':
            const minimumsResult = await pool.query(`
              SELECT 
                cm.category,
                cm.minimum_required,
                COUNT(c.id) as logged_cases,
                CASE WHEN COUNT(c.id) >= cm.minimum_required THEN 'met' ELSE 'not_met' END as status
              FROM public.case_minimums cm
              LEFT JOIN public.cases c ON c.institution_id = $1 
                AND c.created_at >= $2 
                AND c.created_at <= $3
              WHERE cm.accreditation_type = 'general_surgery'
              GROUP BY cm.id
            `, [schedule.institution_id, periodStart, periodEnd])
            reportData = { minimums: minimumsResult.rows }
            break

          case 'resident_summary':
            const residentsResult = await pool.query(`
              SELECT 
                p.id,
                p.full_name,
                COUNT(c.id) as total_cases,
                COUNT(c.verified_at) as verified_cases,
                MAX(c.created_at) as last_case_date
              FROM public.profiles p
              LEFT JOIN public.cases c ON c.resident_id = p.id
                AND c.created_at >= $1 
                AND c.created_at <= $2
              WHERE p.institution_id = $3 AND p.role = 'resident'
              GROUP BY p.id
            `, [periodStart, periodEnd, schedule.institution_id])
            reportData = { residents: residentsResult.rows }
            break

          case 'milestone':
            const milestonesResult = await pool.query(`
              SELECT 
                md.competency_area,
                ma.level,
                COUNT(*) as assessment_count
              FROM public.milestone_assessments ma
              JOIN public.milestone_definitions md ON md.id = ma.milestone_id
              WHERE ma.assessment_date >= $1 AND ma.assessment_date <= $2
              GROUP BY md.competency_area, ma.level
            `, [periodStart, periodEnd])
            reportData = { milestones: milestonesResult.rows }
            break
        }

        await pool.query(`
          INSERT INTO public.acgme_reports (
            institution_id,
            report_type,
            period_start,
            period_end,
            data,
            generated_by
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          schedule.institution_id,
          schedule.report_type,
          periodStart,
          periodEnd,
          JSON.stringify(reportData),
          schedule.created_by
        ])

        const nextRunAt = new Date()
        switch (schedule.frequency) {
          case 'daily':
            nextRunAt.setDate(nextRunAt.getDate() + 1)
            break
          case 'weekly':
            nextRunAt.setDate(nextRunAt.getDate() + 7)
            break
          case 'monthly':
            nextRunAt.setMonth(nextRunAt.getMonth() + 1)
            break
          case 'quarterly':
            nextRunAt.setMonth(nextRunAt.getMonth() + 3)
            break
        }

        await pool.query(`
          UPDATE public.report_schedules
          SET last_run_at = $1, next_run_at = $2, updated_at = NOW()
          WHERE id = $3
        `, [now, nextRunAt, schedule.id])

        results.push({ schedule_id: schedule.id, status: 'success' })
      } catch (error: any) {
        results.push({ schedule_id: schedule.id, status: 'error', error: error.message })
      }
    }

    return NextResponse.json({
      processed: schedulesResult.rows.length,
      results
    })
  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
