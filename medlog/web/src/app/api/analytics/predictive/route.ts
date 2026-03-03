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

interface Prediction {
  milestoneId: string
  milestoneName: string
  currentLevel: number
  targetLevel: number
  estimatedCompletionDate: string
  confidence: number
  weeklyProgressRate: number
  casesNeeded: number
  recommendations: string[]
}

function calculateDaysUntilTarget(currentLevel: number, targetLevel: number, weeklyRate: number): number {
  if (weeklyRate <= 0) return -1
  const levelsNeeded = targetLevel - currentLevel
  if (levelsNeeded <= 0) return 0
  const weeksNeeded = levelsNeeded / (weeklyRate / 100)
  return Math.ceil(weeksNeeded * 7)
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const residentId = searchParams.get('resident_id')

    const targetId = residentId || user.id

    const profileResult = await pool.query(`
      SELECT institution_id, role FROM public.profiles WHERE id = $1
    `, [user.id])
    const profile = profileResult.rows[0]

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const milestonesResult = await pool.query(`
      SELECT * FROM public.milestone_definitions ORDER BY milestone_number
    `)

    const assessmentsResult = await pool.query(`
      SELECT ma.*, md.competency_area
      FROM public.milestone_assessments ma
      JOIN public.milestone_definitions md ON ma.milestone_id = md.id
      WHERE ma.resident_id = $1
      ORDER BY ma.assessment_date DESC
    `, [targetId])

    const latestAssessments: Record<string, any> = {}
    for (const assessment of assessmentsResult.rows) {
      const key = assessment.milestone_id
      if (!latestAssessments[key] || new Date(assessment.assessment_date) > new Date(latestAssessments[key].assessment_date)) {
        latestAssessments[key] = assessment
      }
    }

    const caseTrendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as cases
      FROM public.cases
      WHERE resident_id = $1 AND created_at >= NOW() - INTERVAL '12 weeks'
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week
    `, [targetId])

    const totalCases = caseTrendResult.rows.reduce((sum: number, r: any) => sum + parseInt(r.cases), 0)
    const weeksWithData = caseTrendResult.rows.length
    const avgWeeklyCases = weeksWithData > 0 ? totalCases / weeksWithData : 0

    const recentCasesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM public.cases
      WHERE resident_id = $1 AND created_at >= NOW() - INTERVAL '4 weeks'
    `, [targetId])
    const recentCases = parseInt(recentCasesResult.rows[0]?.count) || 0

    const weeklyProgressRate = recentCases > 0 ? (recentCases / 4) * 100 : avgWeeklyCases * 100

    const predictions: Prediction[] = []

    for (const milestone of milestonesResult.rows) {
      const current = latestAssessments[milestone.id]
      const currentLevel = current?.level || 1
      const targetLevel = 5

      if (currentLevel >= targetLevel) {
        predictions.push({
          milestoneId: milestone.id,
          milestoneName: milestone.competency_area,
          currentLevel,
          targetLevel,
          estimatedCompletionDate: new Date().toISOString().split('T')[0],
          confidence: 100,
          weeklyProgressRate,
          casesNeeded: 0,
          recommendations: ['Milestone completed!']
        })
        continue
      }

      const daysUntil = calculateDaysUntilTarget(currentLevel, targetLevel, weeklyProgressRate)
      const estimatedDate = daysUntil > 0 
        ? new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null

      const confidence = Math.min(95, Math.max(30, 100 - (weeksWithData * 5)))

      const recommendations: string[] = []
      if (recentCases < 5) {
        recommendations.push('Increase case logging frequency to at least 5 cases per week')
      }
      if (currentLevel < 3) {
        recommendations.push('Focus on basic procedures to build competency')
      }
      if (currentLevel >= 3 && currentLevel < 4) {
        recommendations.push('Seek opportunities for more complex cases')
      }
      recommendations.push('Request milestone assessments every 2-3 months')

      predictions.push({
        milestoneId: milestone.id,
        milestoneName: milestone.competency_area,
        currentLevel,
        targetLevel,
        estimatedCompletionDate: estimatedDate || 'Unknown',
        confidence,
        weeklyProgressRate,
        casesNeeded: daysUntil > 0 ? Math.ceil(daysUntil / 7 * recentCases) : 0,
        recommendations
      })
    }

    const overallPrediction = {
      predictedGraduationDate: predictions.filter(p => p.estimatedCompletionDate !== 'Unknown')
        .sort((a, b) => new Date(a.estimatedCompletionDate).getTime() - new Date(b.estimatedCompletionDate).getTime())[0]?.estimatedCompletionDate || 'Unknown',
      averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
      onTrack: predictions.every(p => p.estimatedCompletionDate !== 'Unknown' && 
        new Date(p.estimatedCompletionDate) < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))
    }

    return NextResponse.json({
      resident_id: targetId,
      predictions,
      overall_prediction: overallPrediction,
      stats: {
        weekly_cases: recentCases,
        weekly_rate: weeklyProgressRate.toFixed(1),
        total_tracked_weeks: weeksWithData
      }
    })
  } catch (error: any) {
    console.error('Error generating predictions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
