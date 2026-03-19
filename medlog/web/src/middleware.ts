import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMITS = {
  api: { limit: 100, windowMs: 60000 },
  auth: { limit: 5, windowMs: 300000 },
  export: { limit: 10, windowMs: 3600000 },
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const path = request.nextUrl.pathname
  
  // Skip rate limiting for static files
  if (path.startsWith('/_next') || path.startsWith('/static')) {
    return NextResponse.next()
  }

  // Determine rate limit based on path
  let limit = RATE_LIMITS.api
  if (path.includes('/auth')) limit = RATE_LIMITS.auth
  if (path.includes('/export')) limit = RATE_LIMITS.export

  const key = `${ip}:${path}`
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + limit.windowMs })
    return NextResponse.next()
  }

  if (record.count >= limit.limit) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

  record.count++
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
