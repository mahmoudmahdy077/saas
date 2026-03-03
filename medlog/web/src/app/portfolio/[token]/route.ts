import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const token = params.token

    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'}/rest/v1/portfolios?share_token=eq.${token}&is_public=eq.true&select=*`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      }
    })

    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
