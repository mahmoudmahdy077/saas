import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/security'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  const rateLimitResult = rateLimit(`login:${ip}`, 5, 60000)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 1 minute.' },
      { status: 429 }
    )
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
            }
          },
        },
      }
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const isProduction = process.env.NODE_ENV === 'production'
    const response = NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        email_confirmed_at: authData.user.email_confirmed_at,
      },
      profile: null,
    })

    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: authData.session.expires_in,
    }

    response.cookies.set('sb-access-token', authData.session.access_token, cookieOptions)
    response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
      ...cookieOptions,
      maxAge: authData.session.expires_in * 7,
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 401 })
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // Double check if we need to manually set these for the specific middleware logic
    // but the setAll above should handle the standard Supabase cookies.
    // Our middleware currently checks for 'sb-access-token'.

    // For the login route, we let the Supabase SSR client handle the cookies automatically via setAll.
    // However, we ALSO set the manual ones for the middleware compatibility.
    const response = NextResponse.json({
      user: authData.user,
      profile: null,
    })

    const cookieOptions = {
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax' as const,
      maxAge: authData.session.expires_in,
    }

    // Standard Supabase SSR cookies will be in cookieStore now.
    // We add our custom ones for the middleware which is currently checking 'sb-access-token'.
    response.cookies.set('sb-access-token', authData.session.access_token, cookieOptions)
    response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
      ...cookieOptions,
      maxAge: authData.session.expires_in * 10,
    })

    console.log('Login successful, cookies set for middleware and SSR')
    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}
