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

async function checkInstitutionAccess(userId: string, targetResidentId: string): Promise<boolean> {
  const profileResult = await pool.query(`
    SELECT p.institution_id as user_inst, p.role as user_role,
           p2.institution_id as target_inst
    FROM public.profiles p
    JOIN public.profiles p2 ON p2.id = $2
    WHERE p.id = $1
  `, [userId, targetResidentId])
  
  if (profileResult.rows.length === 0) return false
  
  const { user_inst, user_role, target_inst } = profileResult.rows[0]
  
  if (['program_director', 'institution_admin', 'super_admin'].includes(user_role)) {
    return user_inst === target_inst
  }
  
  return false
}

export async function GET(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get my progress
    if (action === 'my' || !action) {
      const profileResult = await pool.query(
        'SELECT specialty_id, training_year FROM profiles WHERE id = $1',
        [user.id]
      )

      const specialtyId = profileResult.rows[0]?.specialty_id
      const trainingYear = profileResult.rows[0]?.training_year || 1

      // Get case counts by category
      const categoryResult = await pool.query(`
        SELECT c.category, c.role, COUNT(*) as count
        FROM cases c
        WHERE c.user_id = $1
        GROUP BY c.category, c.role
      `, [user.id])

      // Build cases by category
      const casesByCategory: Record<string, Record<string, number>> = {}
      categoryResult.rows.forEach((row: any) => {
        if (!casesByCategory[row.category]) {
          casesByCategory[row.category] = { primary: 0, assistant: 0, observer: 0 }
        }
        casesByCategory[row.category][row.role] = parseInt(row.count) || 0
      })

      // Get requirements for specialty
      let requirements = []
      if (specialtyId) {
        const reqResult = await pool.query(`
          SELECT * FROM program_requirements 
          WHERE specialty_id = $1 AND year_level = $2
        `, [specialtyId, trainingYear])
        requirements = reqResult.rows
      }

      // Get case minimums
      const minimumsResult = await pool.query(`
        SELECT * FROM case_minimums 
        WHERE specialty_id = $1
      `, [specialtyId || null])

      // Get total cases
      const totalResult = await pool.query(
        'SELECT COUNT(*) as total FROM cases WHERE user_id = $1',
        [user.id]
      )

      // Get cases by status
      const statusResult = await pool.query(`
        SELECT verification_status as status, COUNT(*) as count
        FROM cases WHERE user_id = $1
        GROUP BY verification_status
      `, [user.id])

      return NextResponse.json({
        total_cases: parseInt(totalResult.rows[0].total) || 0,
        cases_by_category: casesByCategory,
        cases_by_status: statusResult.rows,
        training_year: trainingYear,
        requirements,
        minimums: minimumsResult.rows
      })
    }

    // Get resident progress (for PD/admin)
    if (action === 'resident' && searchParams.get('residentId')) {
      const residentId = searchParams.get('residentId')

      // Check if user has permission to view resident progress
      const profileResult = await pool.query(
        'SELECT role, institution_id FROM public.profiles WHERE id = $1',
        [user.id]
      )
      const userRole = profileResult.rows[0]?.role
      const userInstitutionId = profileResult.rows[0]?.institution_id

      // Only PD, admin, or super_admin can view other residents' progress
      if (!['program_director', 'institution_admin', 'super_admin'].includes(userRole)) {
        return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 })
      }

      // Verify resident is in same institution
      const residentProfileResult = await pool.query(
        'SELECT institution_id FROM public.profiles WHERE id = $1',
        [residentId]
      )
      const residentInstitutionId = residentProfileResult.rows[0]?.institution_id

      if (userRole !== 'super_admin' && userInstitutionId !== residentInstitutionId) {
        return NextResponse.json({ error: 'Forbidden - can only view residents in your institution' }, { status: 403 })
      }

      const result = await pool.query(`
        SELECT 
          u.id, u.email, p.full_name, p.training_year,
          s.name as specialty_name,
          COUNT(c.id) as total_cases,
          COUNT(CASE WHEN c.verification_status = 'consultant_verified' THEN 1 END) as verified_cases,
          COUNT(CASE WHEN c.verification_status = 'pd_approved' THEN 1 END) as approved_cases
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        LEFT JOIN public.specialties s ON p.specialty_id = s.id
        LEFT JOIN public.cases c ON u.id = c.user_id
        WHERE u.id = $1
        GROUP BY u.id, u.email, p.full_name, p.training_year, s.name
      `, [residentId])

      return NextResponse.json({ resident: result.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update training year
export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, training_year } = body

    if (action === 'update-year') {
      await pool.query(
        'UPDATE profiles SET training_year = $1 WHERE id = $2',
        [training_year, user.id]
      )
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
