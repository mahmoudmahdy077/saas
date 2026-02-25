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

  try {
    const result = await pool.query(`
      SELECT id, provider, is_active, stripe_price_ids, settings, created_at, updated_at
      FROM public.payment_settings
      ORDER BY created_at DESC
    `)

    const masked = result.rows.map(p => ({
      ...p,
      stripe_secret_key: p.stripe_secret_key ? '••••••••' + p.stripe_secret_key.slice(-4) : null,
      stripe_webhook_secret: p.stripe_webhook_secret ? '••••••••' : null
    }))

    return NextResponse.json({ settings: masked })
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
    if (action === 'saveStripe') {
      const { stripeSecretKey, stripeWebhookSecret, stripePriceIds, isActive, settings } = body

      await pool.query(`
        INSERT INTO public.payment_settings (provider, stripe_secret_key, stripe_webhook_secret, stripe_price_ids, is_active, settings, updated_at)
        VALUES ('stripe', $1, $2, $3, $4, $5, NOW())
        ON CONFLICT (provider) DO UPDATE SET 
          stripe_secret_key = COALESCE(NULLIF($1, ''), stripe_secret_key),
          stripe_webhook_secret = COALESCE(NULLIF($2, ''), stripe_webhook_secret),
          stripe_price_ids = $3,
          is_active = $4,
          settings = $5,
          updated_at = NOW()
      `, [
        stripeSecretKey || null,
        stripeWebhookSecret || null,
        JSON.stringify(stripePriceIds || {}),
        isActive || false,
        JSON.stringify(settings || {})
      ])

      return NextResponse.json({ success: true })
    }

    if (action === 'toggle') {
      await pool.query(`
        UPDATE public.payment_settings SET is_active = NOT is_active, updated_at = NOW()
        WHERE provider = 'stripe'
      `)
      return NextResponse.json({ success: true })
    }

    if (action === 'testWebhook') {
      const result = await pool.query('SELECT stripe_webhook_secret FROM public.payment_settings WHERE provider = $1', ['stripe'])
      const secret = result.rows[0]?.stripe_webhook_secret

      if (!secret) {
        return NextResponse.json({ success: false, message: 'No webhook secret configured' })
      }

      return NextResponse.json({ success: true, message: 'Webhook endpoint ready - send test events to /api/admin/payment/webhook' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
