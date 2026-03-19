import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

    const { message, context } = await request.json()

    // AI Assistant Logic (placeholder for actual AI integration)
    const response = {
      reply: `Based on your case history, I recommend reviewing ${context?.specialty || 'orthopedic'} procedures.`,
      suggestions: [
        'Review similar cases',
        'Check latest guidelines',
        'Watch tutorial videos',
      ],
    }

    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: 'AI error' }, { status: 500 })
  }
}
