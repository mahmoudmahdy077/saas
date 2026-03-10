import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error.message)
      // Continue to clear cookies anyway
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Explicitly clear our custom cookies
    const cookieOptions = {
      path: '/',
      maxAge: 0,
    }

    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)

    return response
  } catch (error) {
    console.error('Error logging out:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
