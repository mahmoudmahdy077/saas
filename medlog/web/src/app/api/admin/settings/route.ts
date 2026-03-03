import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

const ALLOWED_SETTINGS_KEYS = [
  'site_name',
  'site_title',
  'site_logo',
  'site_favicon',
  'ai_enabled',
  'maintenance_mode',
  'allow_registration'
]

function sanitizeString(input: any, maxLength: number = 500): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>'"]/g, '').substring(0, maxLength)
}

function validateSettingKey(key: string): boolean {
  return ALLOWED_SETTINGS_KEYS.includes(key)
}

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

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`admin-settings:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const result = await pool.query('SELECT key, value, description, updated_at FROM public.website_settings ORDER BY key')
    return NextResponse.json({ settings: result.rows })
  } catch (error: any) {
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`admin-settings:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await request.json()
  const { key, value } = body

  if (!key || !validateSettingKey(key)) {
    return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 })
  }

  try {
    await pool.query(`
      INSERT INTO public.website_settings (key, value, updated_by, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()
    `, [key, JSON.stringify(value), adminUser.id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin settings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`admin-settings:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await request.json()
  const { settings } = body

  if (!Array.isArray(settings) || settings.length > 20) {
    return NextResponse.json({ error: 'Invalid settings format' }, { status: 400 })
  }

  try {
    for (const setting of settings) {
      if (!setting.key || !validateSettingKey(setting.key)) {
        continue
      }
      
      await pool.query(`
        INSERT INTO public.website_settings (key, value, updated_by, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()
      `, [setting.key, JSON.stringify(setting.value), adminUser.id])
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
