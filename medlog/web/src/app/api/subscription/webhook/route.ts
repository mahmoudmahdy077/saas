import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import Stripe from 'stripe'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secretKey || !webhookSecret) {
    throw new Error('Stripe keys are not configured')
  }
  return new Stripe(secretKey, { apiVersion: '2023-10-16' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Processing Stripe event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutComplete(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const metadata = session.metadata || {}

  const planName = metadata.planName || 'basic'

  const subscriptionResult = await pool.query(`
    SELECT * FROM public.stripe_subscriptions WHERE stripe_subscription_id = $1
  `, [subscriptionId])

  if (subscriptionResult.rows.length === 0) {
    await pool.query(`
      INSERT INTO public.stripe_subscriptions (
        stripe_customer_id,
        stripe_subscription_id,
        status,
        plan_name,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      customerId,
      subscriptionId,
      'active',
      planName,
      new Date(),
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      false
    ])
  }

  await pool.query(`
    UPDATE public.institution_subscriptions
    SET 
      stripe_subscription_id = $1,
      plan = $2,
      subscription_status = 'active',
      updated_at = NOW()
    WHERE stripe_customer_id = $3
  `, [subscriptionId, planName, customerId])

  console.log(`Checkout completed for customer ${customerId}, plan: ${planName}`)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id
  const status = subscription.status
  const currentPeriodStart = new Date(subscription.current_period_start * 1000)
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
  const cancelAtPeriodEnd = subscription.cancel_at_period_end

  await pool.query(`
    UPDATE public.stripe_subscriptions
    SET 
      status = $1,
      current_period_start = $2,
      current_period_end = $3,
      cancel_at_period_end = $4,
      updated_at = NOW()
    WHERE stripe_subscription_id = $5
  `, [status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, subscriptionId])

  const dbStatus = cancelAtPeriodEnd ? 'cancelling' : status

  await pool.query(`
    UPDATE public.institution_subscriptions
    SET 
      subscription_status = $1,
      current_period_start = $2,
      current_period_end = $3,
      updated_at = NOW()
    WHERE stripe_subscription_id = $4
  `, [dbStatus, currentPeriodStart, currentPeriodEnd, subscriptionId])

  console.log(`Subscription ${subscriptionId} updated to status: ${status}`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const subscriptionId = subscription.id

  await pool.query(`
    UPDATE public.stripe_subscriptions
    SET 
      status = 'cancelled',
      canceled_at = NOW(),
      updated_at = NOW()
    WHERE stripe_subscription_id = $1
  `, [subscriptionId])

  await pool.query(`
    UPDATE public.institution_subscriptions
    SET 
      plan = 'free',
      stripe_subscription_id = NULL,
      subscription_status = 'cancelled',
      updated_at = NOW()
    WHERE stripe_subscription_id = $1
  `, [subscriptionId])

  console.log(`Subscription ${subscriptionId} cancelled`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const invoiceId = invoice.id
  const amountPaid = invoice.amount_paid / 100

  const instSubResult = await pool.query(`
    SELECT institution_id FROM public.institution_subscriptions 
    WHERE stripe_customer_id = $1
  `, [customerId])

  const institutionId = instSubResult.rows[0]?.institution_id

  await pool.query(`
    INSERT INTO public.invoices (
      institution_id,
      stripe_invoice_id,
      stripe_customer_id,
      amount,
      status,
      paid_at,
      invoice_data
    ) VALUES ($1, $2, $3, $4, $5, NOW(), $6)
    ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      status = $5,
      paid_at = NOW()
  `, [institutionId, invoiceId, customerId, amountPaid, 'paid', JSON.stringify(invoice)])

  await pool.query(`
    UPDATE public.institution_subscriptions
    SET subscription_status = 'active', updated_at = NOW()
    WHERE stripe_customer_id = $1
  `, [customerId])

  console.log(`Invoice ${invoiceId} paid for customer ${customerId}, institution: ${institutionId}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const invoiceId = invoice.id

  const instSubResult = await pool.query(`
    SELECT institution_id FROM public.institution_subscriptions 
    WHERE stripe_customer_id = $1
  `, [customerId])

  const institutionId = instSubResult.rows[0]?.institution_id

  await pool.query(`
    INSERT INTO public.invoices (
      institution_id,
      stripe_invoice_id,
      stripe_customer_id,
      amount,
      status,
      invoice_data
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      status = $5
  `, [institutionId, invoiceId, customerId, invoice.amount_due / 100, 'failed', JSON.stringify(invoice)])

  await pool.query(`
    UPDATE public.institution_subscriptions
    SET subscription_status = 'past_due', updated_at = NOW()
    WHERE stripe_customer_id = $1
  `, [customerId])

  console.log(`Invoice ${invoiceId} payment failed for customer ${customerId}`)
}
