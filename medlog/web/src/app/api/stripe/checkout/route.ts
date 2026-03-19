import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()
    
    // In production: Create Stripe Checkout Session
    // const session = await stripe.checkout.sessions.create({...})
    
    return NextResponse.json({
      success: true,
      sessionId: 'mock_session_' + Date.now(),
      url: 'https://checkout.stripe.com/mock',
    })
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
