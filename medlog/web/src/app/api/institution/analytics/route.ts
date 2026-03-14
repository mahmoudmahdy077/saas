import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

/**
 * Enterprise Analytics API
 * Institution-wide analytics for administrators
 */

export async function GET(request: NextRequest) {
  let user: any
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user: authenticatedUser } } = await supabase.auth.getUser()
    user = authenticatedUser

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's institution
    const { data: profile } = await supabase
      .from('profiles')
      .select('institution_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.institution_id) {
      return NextResponse.json({ error: 'No institution found' }, { status: 404 })
    }

    // Check if user is admin
    if (profile.role !== 'admin' && profile.role !== 'program_director') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const institutionId = profile.institution_id

    // Fetch analytics data
    const [
      totalResidents,
      activeThisMonth,
      totalCases,
      verifiedCases,
      caseTrend,
      specialtyDistribution,
      topPerformers,
      atRiskResidents,
      recentActivity
    ] = await Promise.all([
      // Total residents in institution
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('role', 'resident'),

      // Active this month
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('role', 'resident')
        .gte('last_active', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),

      // Total cases
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .in('user_id', 
          supabase.from('profiles').select('id').eq('institution_id', institutionId)
        ),

      // Verified cases (for compliance)
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .in('user_id',
          supabase.from('profiles').select('id').eq('institution_id', institutionId)
        )
        .neq('verification_status', 'self'),

      // Case trend (last 30 days)
      supabase
        .from('cases')
        .select('date')
        .in('user_id',
          supabase.from('profiles').select('id').eq('institution_id', institutionId)
        )
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: true }),

      // Specialty distribution
      supabase
        .from('cases')
        .select('category')
        .in('user_id',
          supabase.from('profiles').select('id').eq('institution_id', institutionId)
        ),

      // Top performers
      supabase.rpc('get_top_performers', {
        p_institution_id: institutionId,
        p_limit: 10
      }),

      // At-risk residents
      supabase.rpc('get_at_risk_residents', {
        p_institution_id: institutionId
      }),

      // Recent activity (from audit_logs)
      supabase
        .from('audit_logs')
        .select('*, profiles(name)')
        .eq('institution_id', institutionId)
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // Process case trend
    const trendMap = new Map<string, number>()
    caseTrend.data?.forEach((item: any) => {
      const date = item.date.split('T')[0]
      trendMap.set(date, (trendMap.get(date) || 0) + 1)
    })

    const caseTrendProcessed = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count
    })).slice(-14) // Last 14 days

    // Process specialty distribution
    const specialtyMap = new Map<string, number>()
    specialtyDistribution.data?.forEach((item: any) => {
      const specialty = item.category || 'Other'
      specialtyMap.set(specialty, (specialtyMap.get(specialty) || 0) + 1)
    })

    const specialtyDistributionProcessed = Array.from(specialtyMap.entries()).map(([name, value]) => ({
      name,
      value
    }))

    // Calculate compliance rate
    const complianceRate = totalCases.data?.[0]?.count 
      ? Math.round((verifiedCases.data?.[0]?.count || 0) / totalCases.data[0].count * 100)
      : 100

    const analytics = {
      totalResidents: totalResidents.count || 0,
      activeThisMonth: activeThisMonth.count || 0,
      totalCases: totalCases.count || 0,
      complianceRate,
      caseTrend: caseTrendProcessed,
      specialtyDistribution: specialtyDistributionProcessed,
      topPerformers: topPerformers.data || [],
      atRiskResidents: atRiskResidents.data || [],
      recentActivity: recentActivity.data || []
    }

    return NextResponse.json(analytics)
  } catch (error) {
    logger.error('Error fetching institution analytics', error as Error, { 
      route: '/api/institution/analytics',
      userId: user?.id
    })
    return NextResponse.json({ 
      error: 'Internal server error', 
      code: 'FETCH_ANALYTICS_FAILED' 
    }, { status: 500 })
  }
}
