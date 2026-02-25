import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAdminUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  if (!user) return null

  const result = await pool.query('SELECT role FROM public.profiles WHERE id = $1', [user.id])
  if (result.rows[0]?.role !== 'super_admin') return null

  return user
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const userId = searchParams.get('userId')

  try {
    if (action === 'list') {
      const result = await pool.query(`
        SELECT 
          u.id, u.email, u.created_at, u.email_confirmed_at,
          p.full_name, p.role, p.institution_id, p.specialty_id,
          p.current_streak, p.created_at as profile_created,
          CASE WHEN b.id IS NOT NULL THEN true ELSE false END as is_banned
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        LEFT JOIN public.user_bans b ON u.id = b.user_id AND (b.banned_until IS NULL OR b.banned_until > NOW())
        ORDER BY u.created_at DESC
        LIMIT 100
      `)
      return NextResponse.json({ users: result.rows })
    }

    if (action === 'stats') {
      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM auth.users) as total_users,
          (SELECT COUNT(*) FROM public.profiles WHERE role = 'resident') as residents,
          (SELECT COUNT(*) FROM public.profiles WHERE role = 'consultant') as consultants,
          (SELECT COUNT(*) FROM public.profiles WHERE role = 'program_director') as pd,
          (SELECT COUNT(*) FROM public.profiles WHERE role = 'institution_admin') as admins,
          (SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin') as super_admins,
          (SELECT COUNT(*) FROM public.user_bans WHERE banned_until IS NULL OR banned_until > NOW()) as banned,
          (SELECT COUNT(*) FROM public.institutions) as institutions
      `)
      return NextResponse.json(result.rows[0])
    }

    if (action === 'get' && userId) {
      const result = await pool.query(`
        SELECT 
          u.id, u.email, u.created_at, u.email_confirmed_at,
          p.full_name, p.role, p.institution_id, p.specialty_id,
          b.id as ban_id, b.reason as ban_reason, b.banned_until, b.is_permanent
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        LEFT JOIN public.user_bans b ON u.id = b.user_id AND (b.banned_until IS NULL OR b.banned_until > NOW())
        WHERE u.id = $1
      `, [userId])
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      return NextResponse.json({ user: result.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, userId, email, role, fullName, reason, permanent, banDuration } = body

  try {
    if (action === 'changeRole') {
      await pool.query('UPDATE public.profiles SET role = $1, updated_at = NOW() WHERE id = $2', [role, userId])
      return NextResponse.json({ success: true, message: `Role changed to ${role}` })
    }

    if (action === 'ban') {
      const bannedUntil = permanent ? null : new Date(Date.now() + (banDuration || 7) * 24 * 60 * 60 * 1000)
      await pool.query(`
        INSERT INTO public.user_bans (user_id, reason, banned_by, banned_until, is_permanent)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, reason, adminUser.id, bannedUntil, permanent || false])
      return NextResponse.json({ success: true, message: 'User banned' })
    }

    if (action === 'unban') {
      await pool.query('DELETE FROM public.user_bans WHERE user_id = $1', [userId])
      return NextResponse.json({ success: true, message: 'User unbanned' })
    }

    if (action === 'createUser') {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false }
      })

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      })

      if (error) throw error

      if (role && role !== 'resident') {
        await pool.query('UPDATE public.profiles SET role = $1 WHERE id = $2', [role, data.user?.id])
      }

      return NextResponse.json({ success: true, user: data.user })
    }

    if (action === 'deleteUser') {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
        auth: { persistSession: false }
      })

      await supabaseAdmin.auth.admin.deleteUser(userId)
      return NextResponse.json({ success: true, message: 'User deleted' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
