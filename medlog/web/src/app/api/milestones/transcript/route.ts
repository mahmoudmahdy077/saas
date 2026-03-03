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
    const residentId = searchParams.get('resident_id')

    const targetId = residentId || user.id

    const profileResult = await pool.query(
      'SELECT role, institution_id FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (residentId && profile?.role === 'resident' && residentId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const definitionsResult = await pool.query(`
      SELECT * FROM public.milestone_definitions ORDER BY milestone_number
    `)

    const assessmentsResult = await pool.query(`
      SELECT ma.*, md.competency_area, md.level1_description, md.level2_description, 
             md.level3_description, md.level4_description, md.level5_description,
             p.full_name as assessor_name
      FROM public.milestone_assessments ma
      JOIN public.milestone_definitions md ON ma.milestone_id = md.id
      LEFT JOIN public.profiles p ON ma.assessor_id = p.id
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

    const milestoneData = definitionsResult.rows.map(def => ({
      ...def,
      latest_assessment: latestAssessments[def.id] || null
    }))

    const residentResult = await pool.query(`
      SELECT p.*, i.name as institution_name
      FROM public.profiles p
      LEFT JOIN public.institutions i ON p.institution_id = i.id
      WHERE p.id = $1
    `, [targetId])

    return NextResponse.json({
      resident: residentResult.rows[0],
      milestones: milestoneData,
      all_assessments: assessmentsResult.rows
    })
  } catch (error: any) {
    console.error('Error fetching milestone transcript:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profileResult = await pool.query(
      'SELECT role, institution_id FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { resident_id, milestone_id, level, notes } = body

    if (!resident_id || !milestone_id || !level) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(`
      INSERT INTO public.milestone_assessments (resident_id, milestone_id, assessor_id, level, assessment_date, notes)
      VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)
      RETURNING *
    `, [resident_id, milestone_id, user.id, level, notes])

    return NextResponse.json({ assessment: result.rows[0] })
  } catch (error: any) {
    console.error('Error creating milestone assessment:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
