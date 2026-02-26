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
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get all plans
    if (action === 'list' || !action) {
      const result = await pool.query(`
        SELECT id, name, display_name, description, price_monthly, price_yearly, 
               max_residents, max_cases_per_month, max_images_per_month, max_ai_analyses,
               max_storage_mb, ai_enabled, custom_branding, api_access, priority_support, sso_enabled,
               features, is_active, display_order
        FROM subscription_plans 
        WHERE is_active = true 
        ORDER BY display_order
      `)
      return NextResponse.json({ plans: result.rows })
    }

    if (action === 'get' && searchParams.get('planId')) {
      const result = await pool.query('SELECT * FROM subscription_plans WHERE id = $1', [searchParams.get('planId')])
      return NextResponse.json({ plan: result.rows[0] })
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

  try {
    const body = await request.json()
    const { action, plan } = body

    if (action === 'create') {
      const result = await pool.query(`
        INSERT INTO subscription_plans (
          name, display_name, description, price_monthly, price_yearly,
          max_residents, max_cases_per_month, max_images_per_month, max_ai_analyses,
          max_storage_mb, ai_enabled, custom_branding, api_access, priority_support, sso_enabled,
          features, is_active, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `, [
        plan.name, plan.display_name, plan.description, plan.price_monthly, plan.price_yearly,
        plan.max_residents, plan.max_cases_per_month, plan.max_images_per_month, plan.max_ai_analyses,
        plan.max_storage_mb, plan.ai_enabled, plan.custom_branding, plan.api_access, plan.priority_support,
        plan.sso_enabled, plan.features || {}, plan.is_active !== false, plan.display_order
      ])
      return NextResponse.json({ plan: result.rows[0] })
    }

    if (action === 'update' && plan.id) {
      const result = await pool.query(`
        UPDATE subscription_plans SET
          display_name = $1, description = $2, price_monthly = $3, price_yearly = $4,
          max_residents = $5, max_cases_per_month = $6, max_images_per_month = $7, max_ai_analyses = $8,
          max_storage_mb = $9, ai_enabled = $10, custom_branding = $11, api_access = $12,
          priority_support = $13, sso_enabled = $14, features = $15, is_active = $16
        WHERE id = $17
        RETURNING *
      `, [
        plan.display_name, plan.description, plan.price_monthly, plan.price_yearly,
        plan.max_residents, plan.max_cases_per_month, plan.max_images_per_month, plan.max_ai_analyses,
        plan.max_storage_mb, plan.ai_enabled, plan.custom_branding, plan.api_access,
        plan.priority_support, plan.sso_enabled, plan.features || {}, plan.is_active, plan.id
      ])
      return NextResponse.json({ plan: result.rows[0] })
    }

    if (action === 'delete' && plan.id) {
      await pool.query('DELETE FROM subscription_plans WHERE id = $1', [plan.id])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
