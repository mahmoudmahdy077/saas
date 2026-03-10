import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Pool } from 'pg'

export async function GET() {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] GET /api/auth/user starting...`)

  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    console.log(`[${requestId}] Available cookies: ${allCookies.map(c => c.name).join(', ')}`)

    const accessToken = cookieStore.get('sb-access-token')?.value

    if (!accessToken) {
      console.log(`[${requestId}] No sb-access-token found`)
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false }
    })

    // Verify the user from the access token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      console.log(`[${requestId}] Auth failed: ${userError?.message}`)
      return NextResponse.json({ error: 'Unauthorized: ' + (userError?.message || 'invalid token') }, { status: 401 })
    }

    console.log(`[${requestId}] Authenticated as user: ${user.id}`)

    // Fetch profile directly from database to bypass any RLS issues
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
    })
    
    try {
      const result = await pool.query(
        'SELECT * FROM public.profiles WHERE id = $1',
        [user.id]
      )
      await pool.end()
      
      const profile = result.rows[0] || null
      console.log(`[${requestId}] Profile found from DB:`, profile)

      return NextResponse.json({ user, profile })
    } catch (dbError: any) {
      console.log(`[${requestId}] DB Error: ${dbError.message}`)
      
      // Fallback to Supabase query
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      console.log(`[${requestId}] Profile from Supabase:`, profile, profileError)
      return NextResponse.json({ user, profile })
    }
  } catch (error: any) {
    console.log(`[${requestId}] Unexpected error: ${error.message}`)
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 })
  }
}
