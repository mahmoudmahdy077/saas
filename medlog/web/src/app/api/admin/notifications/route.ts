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

  try {
    if (action === 'list') {
      const result = await pool.query(`
        SELECT sn.*, p.full_name as created_by_name
        FROM public.system_notifications sn
        LEFT JOIN public.profiles p ON sn.created_by = p.id
        ORDER BY sn.created_at DESC
        LIMIT 50
      `)
      return NextResponse.json({ notifications: result.rows })
    }

    if (action === 'stats') {
      const result = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM public.system_notifications) as total,
          (SELECT COUNT(*) FROM public.system_notifications WHERE sent_at IS NOT NULL) as sent,
          (SELECT COUNT(*) FROM public.system_notifications WHERE sent_at IS NULL AND (scheduled_for IS NULL OR scheduled_for <= NOW())) as pending
      `)
      return NextResponse.json(result.rows[0])
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
  const { action } = body

  try {
    if (action === 'send') {
      const { title, message, type, targetRoles, targetUsers, scheduledFor, expiresAt } = body

      const result = await pool.query(`
        INSERT INTO public.system_notifications (title, message, type, target_roles, target_users, scheduled_for, expires_at, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [title, message, type || 'info', targetRoles || ['resident'], targetUsers, scheduledFor, expiresAt, adminUser.id])

      const notificationId = result.rows[0].id

      await pool.query(`
        INSERT INTO public.notifications (user_id, type, title, message)
        SELECT u.id, 'system', $1, $2
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE ($3::text[] IS NULL OR p.role = ANY($3::text[]))
        AND u.id NOT IN (SELECT user_id FROM public.user_bans WHERE banned_until IS NULL OR banned_until > NOW())
      `, [title, message, targetRoles])

      await pool.query(`
        UPDATE public.system_notifications SET sent_at = NOW() WHERE id = $1
      `, [notificationId])

      return NextResponse.json({ success: true, notificationId })
    }

    if (action === 'delete' && body.notificationId) {
      await pool.query('DELETE FROM public.system_notifications WHERE id = $1', [body.notificationId])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
