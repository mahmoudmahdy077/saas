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

function sanitizeString(input: any, maxLength: number = 255): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>'"]/g, '').substring(0, maxLength)
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

async function getAdminUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE auth: { persist_KEY!, {
   Session: false }
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
  
  if (!rateLimit(`admin:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const institutionId = searchParams.get('institutionId')

  if (institutionId && !validateUUID(institutionId)) {
    return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 })
  }

  try {
    if (action === 'list') {
      const result = await pool.query(`
        SELECT 
          i.*,
          p.full_name as admin_name,
          p.email as admin_email,
          (SELECT COUNT(*) FROM public.profiles WHERE institution_id = i.id) as resident_count,
          (SELECT COUNT(*) FROM public.profiles WHERE institution_id = i.id AND role = 'program_director') as pd_count,
          s.plan, s.max_residents, s.ai_features_enabled, s.subscription_status
        FROM public.institutions i
        LEFT JOIN public.profiles p ON i.admin_id = p.id
        LEFT JOIN public.institution_subscriptions s ON i.id = s.institution_id
        ORDER BY i.created_at DESC
        LIMIT 100
      `)
      return NextResponse.json({ institutions: result.rows })
    }

    if (action === 'get' && institutionId) {
      const result = await pool.query(`
        SELECT 
          i.*,
          p.full_name as admin_name,
          p.email as admin_email,
          s.*
        FROM public.institutions i
        LEFT JOIN public.profiles p ON i.admin_id = p.id
        LEFT JOIN public.institution_subscriptions s ON i.id = s.institution_id
        WHERE i.id = $1
      `, [institutionId])
      return NextResponse.json({ institution: result.rows[0] })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Admin institutions GET error:', error)
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
  
  if (!rateLimit(`admin:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const body = await request.json()
  const { action } = body

  try {
    if (action === 'create') {
      const { name, adminEmail, plan, maxResidents, maxCasesPerResident, aiFeatures } = body

      const sanitizedName = sanitizeString(name, 255)
      if (!sanitizedName) {
        return NextResponse.json({ error: 'Valid name is required' }, { status: 400 })
      }

      const validPlans = ['free', 'basic', 'pro', 'enterprise']
      const sanitizedPlan = validPlans.includes(plan) ? plan : 'free'

      const result = await pool.query(`
        INSERT INTO public.institutions (name, admin_id)
        VALUES ($1, (SELECT id FROM auth.users WHERE email = $2 LIMIT 1))
        RETURNING id
      `, [sanitizedName, adminEmail])

      const institutionId = result.rows[0].id

      await pool.query(`
        INSERT INTO public.institution_subscriptions (institution_id, plan, max_residents, max_cases_per_resident, ai_features_enabled)
        VALUES ($1, $2, $3, $4, $5)
      `, [institutionId, sanitizedPlan, maxResidents || 5, maxCasesPerResident || 100, aiFeatures || false])

      if (adminEmail && validateEmail(adminEmail)) {
        await pool.query(`
          UPDATE public.profiles SET institution_id = $1, role = 'institution_admin' WHERE email = $2
        `, [institutionId, adminEmail])
      }

      return NextResponse.json({ success: true, institutionId })
    }

    if (action === 'updateSubscription' && body.institutionId) {
      if (!validateUUID(body.institutionId)) {
        return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 })
      }

      const { plan, maxResidents, maxCasesPerResident, aiFeatures, customBranding } = body

      const validPlans = ['free', 'basic', 'pro', 'enterprise']
      const sanitizedPlan = validPlans.includes(plan) ? plan : 'free'

      await pool.query(`
        UPDATE public.institution_subscriptions 
        SET plan = $1, max_residents = $2, max_cases_per_resident = $3, ai_features_enabled = $4, custom_branding = $5, updated_at = NOW()
        WHERE institution_id = $6
      `, [sanitizedPlan, maxResidents || 5, maxCasesPerResident || 100, aiFeatures || false, customBranding || false, body.institutionId])

      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && body.institutionId) {
      if (!validateUUID(body.institutionId)) {
        return NextResponse.json({ error: 'Invalid institution ID' }, { status: 400 })
      }

      await pool.query('DELETE FROM public.institutions WHERE id = $1', [body.institutionId])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Admin institutions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
