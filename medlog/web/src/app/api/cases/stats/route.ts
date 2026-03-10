import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    const [totalResult, monthResult, verifiedResult, pendingResult] = await Promise.all([
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', firstDayOfMonth),
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .neq('verification_status', 'self'),
      supabase
        .from('cases')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('verification_status', 'self'),
    ])

    return NextResponse.json({
      totalCases: totalResult.count || 0,
      thisMonth: monthResult.count || 0,
      verified: verifiedResult.count || 0,
      pending: pendingResult.count || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
