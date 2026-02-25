import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
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
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const residentId = searchParams.get('resident_id')
    const type = searchParams.get('type')
    const period = searchParams.get('period')

    let query = supabase
      .from('reports')
      .select('*, resident:profiles!reports_resident_id_fkey(full_name, email)')
      .order('created_at', { ascending: false })

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, institution_id')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'program_director' || profile?.role === 'institution_admin') {
        query = query.eq('program_director_id', user.id)
      } else if (residentId) {
        query = query.eq('resident_id', residentId)
      } else {
        query = query.eq('resident_id', user.id)
      }
    }

    if (type) {
      query = query.eq('type', type)
    }
    if (period) {
      query = query.eq('period', period)
    }

    const { data: reports, error } = await query.limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reports: reports || [] })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, institution_id')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'program_director' && profile.role !== 'institution_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { resident_id, type, period, pd_notes, grades } = body

    if (!resident_id || !type || !period) {
      return NextResponse.json({ error: 'Resident ID, type, and period are required' }, { status: 400 })
    }

    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', resident_id)
      .gte('date', `${period}-01`)
      .lte('date', `${period}-31`)

    if (casesError) {
      return NextResponse.json({ error: casesError.message }, { status: 500 })
    }

    let aiInsights = ''
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey && openaiApiKey.startsWith('sk-') && cases && cases.length > 0) {
      try {
        const categories: Record<string, number> = {}
        cases.forEach(c => {
          categories[c.category] = (categories[c.category] || 0) + 1
        })

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a medical education advisor. Summarize resident performance in 2-3 sentences.' },
              { role: 'user', content: `Summarize this resident's performance for ${period}: ${cases.length} cases logged. Categories: ${JSON.stringify(categories)}` }
            ],
            max_tokens: 150,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          aiInsights = data.choices[0]?.message?.content || ''
        }
      } catch (err) {
        console.error('AI summary error:', err)
      }
    }

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        resident_id,
        program_director_id: user.id,
        type,
        period,
        case_count: cases?.length || 0,
        ai_insights: aiInsights,
        grades: grades || {},
        pd_notes: pd_notes || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Report create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
