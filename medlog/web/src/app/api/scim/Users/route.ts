import { NextRequest, NextResponse } from 'next/server'
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

function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) ? email.toLowerCase().trim() : ''
}

function getAuthHeader(request: NextRequest): string | null {
  const auth = request.headers.get('authorization')
  if (!auth) return null

  const [type, credentials] = auth.split(' ')
  if (type !== 'Bearer') return null
  return credentials
}

async function verifySCIMAuth(request: NextRequest) {
  const token = getAuthHeader(request)
  if (!token) return null

  if (!token || token.length < 10) return null

  const result = await pool.query(`
    SELECT s.*, i.name as institution_name
    FROM public.saml_configurations s
    JOIN public.institutions i ON s.institution_id = i.id
    WHERE s.scim_token = $1 AND s.enabled = true
  `, [token])

  return result.rows[0] || null
}

function sanitizePagination(value: any, defaultVal: number, maxVal: number): number {
  const num = parseInt(value) || defaultVal
  return Math.min(Math.max(1, num), maxVal)
}

export async function GET(request: NextRequest) {
  const scim = await verifySCIMAuth(request)
  if (!scim) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`scim:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const startIndex = sanitizePagination(searchParams.get('startIndex'), 1, 10000) - 1
    const count = sanitizePagination(searchParams.get('count'), 50, 100)

    const usersResult = await pool.query(`
      SELECT id, email, full_name, role, created_at
      FROM public.profiles
      WHERE institution_id = $1
      ORDER BY full_name
      LIMIT $2 OFFSET $3
    `, [scim.institution_id, count, startIndex])

    const totalResult = await pool.query(`
      SELECT COUNT(*) FROM public.profiles WHERE institution_id = $1
    `, [scim.institution_id])

    const resources = usersResult.rows.map(user => ({
      id: user.id,
      userName: user.email,
      name: { givenName: user.full_name?.split(' ')[0] || '', familyName: user.full_name?.split(' ').slice(1).join(' ') || '' },
      emails: [{ value: user.email, primary: true }],
      active: true,
      meta: { resourceType: 'User', created: user.created_at }
    }))

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
      totalResults: parseInt(totalResult.rows[0].count),
      startIndex: startIndex + 1,
      itemsPerPage: count,
      Resources: resources
    })
  } catch (error: any) {
    console.error('SCIM GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const scim = await verifySCIMAuth(request)
  if (!scim) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`scim:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body = await request.json()
    let { userName, name } = body

    if (!userName) {
      return NextResponse.json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'userName is required'
      }, { status: 400 })
    }

    userName = sanitizeEmail(userName)
    if (!userName) {
      return NextResponse.json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'Valid userName (email) is required'
      }, { status: 400 })
    }

    const fullName = [
      sanitizeString(name?.givenName, 100),
      sanitizeString(name?.familyName, 100)
    ].filter(Boolean).join(' ')

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: crypto.randomUUID(),
      userName,
      name: { 
        givenName: sanitizeString(name?.givenName, 100), 
        familyName: sanitizeString(name?.familyName, 100) 
      },
      active: true,
      meta: { resourceType: 'User' }
    }, { status: 201 })
  } catch (error: any) {
    console.error('SCIM POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
