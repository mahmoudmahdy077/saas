import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import Stripe from 'stripe'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabase.auth.getUser(accessToken)
  return user
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, { apiVersion: '2023-10-16' })
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await pool.query(`
      SELECT 
        ins.stripe_customer_id,
        ins.stripe_subscription_id,
        ins.plan,
        ins.subscription_status,
        ins.current_period_start,
        ins.current_period_end,
        ss.status as stripe_status,
        ss.cancel_at_period_end
      FROM public.profiles p
      JOIN public.institutions i ON p.institution_id = i.id
      LEFT JOIN public.institution_subscriptions ins ON i.id = ins.institution_id
      LEFT JOIN public.stripe_subscriptions ss ON ins.stripe_subscription_id = ss.stripe_subscription_id
      WHERE p.id = $1
    `, [user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const subscription = result.rows[0]

    return NextResponse.json({ 
      subscription: {
        plan: subscription.plan || 'free',
        status: subscription.subscription_status || 'active',
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        stripeStatus: subscription.stripe_status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    })

  } catch (error: any) {
    console.error('Get subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    const result = await pool.query(`
      SELECT ins.stripe_customer_id, ins.stripe_subscription_id
      FROM public.profiles p
      JOIN public.institutions i ON p.institution_id = i.id
      LEFT JOIN public.institution_subscriptions ins ON i.id = ins.institution_id
      WHERE p.id = $1
    `, [user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { stripe_customer_id, stripe_subscription_id } = result.rows[0]

    if (!stripe_customer_id || !stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (action === 'create_portal_session') {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripe_customer_id,
        return_url: `${appUrl}/settings?tab=billing`
      })

      return NextResponse.json({ url: session.url })
    }

    if (action === 'cancel_subscription') {
      const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: true
      })

      return NextResponse.json({ 
        success: true, 
        cancelAt: new Date(subscription.current_period_end * 1000).toISOString()
      })
    }

    if (action === 'reactivate_subscription') {
      const subscription = await stripe.subscriptions.update(stripe_subscription_id, {
        cancel_at_period_end: false
      })

      return NextResponse.json({ 
        success: true, 
        status: subscription.status
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
