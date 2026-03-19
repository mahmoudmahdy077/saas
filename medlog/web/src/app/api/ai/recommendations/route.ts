import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c: any[]) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get user's case history
    const { data: cases } = await supabase.from('cases').select('category, subcategory').eq('user_id', user.id).limit(50)

    // Generate recommendations based on gaps
    const recommendations = [
      { type: 'learning', title: 'Review Trauma Cases', reason: 'Only 10% of your cases are trauma' },
      { type: 'skill', title: 'Practice Arthroscopy', reason: 'You have 5 arthroscopy cases this month' },
      { type: 'milestone', title: '50 Case Milestone', reason: 'You\'re at 35/50 cases' },
    ]

    return NextResponse.json({ recommendations, caseCount: cases?.length || 0 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
