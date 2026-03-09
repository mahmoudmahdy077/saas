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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, billingCycle } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const result = await pool.query(`
      SELECT 
        p.institution_id,
        p.role,
        i.name as institution_name,
        ins.stripe_customer_id,
        ins.plan as current_plan
      FROM public.profiles p
      JOIN public.institutions i ON p.institution_id = i.id
      LEFT JOIN public.institution_subscriptions ins ON i.id = ins.institution_id
      WHERE p.id = $1
    `, [user.id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { institution_id, institution_name, stripe_customer_id, current_plan } = result.rows[0]

    const planResult = await pool.query(`
      SELECT * FROM subscription_plans WHERE name = $1 AND is_active = true
    `, [planId])

    if (planResult.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const plan = planResult.rows[0]

    if (plan.name === 'free' || plan.price_monthly === 0) {
      return NextResponse.json({ error: 'Cannot checkout for free plan' }, { status: 400 })
    }

    const priceAmount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
    const interval = billingCycle === 'yearly' ? 'year' : 'month'

    let customerId = stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: institution_name || user.email,
        metadata: {
          userId: user.id,
          institutionId: institution_id
        }
      })
      customerId = customer.id

      await pool.query(`
        INSERT INTO public.institution_subscriptions (institution_id, plan, stripe_customer_id, subscription_status)
        VALUES ($1, 'free', $2, 'active')
        ON CONFLICT (institution_id) DO UPDATE SET stripe_customer_id = $2
      `, [institution_id, customerId])
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.display_name} - MedLog`,
              description: `${billingCycle === 'yearly' ? 'Annual' : 'Monthly'} subscription for ${institution_name}`,
            },
            unit_amount: Math.round(priceAmount * 100),
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        institutionId: institution_id,
        planName: plan.name,
        billingCycle: billingCycle
      },
      success_url: `${appUrl}/settings?tab=billing&success=true`,
      cancel_url: `${appUrl}/settings?tab=billing&cancelled=true`,
    })

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url 
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
