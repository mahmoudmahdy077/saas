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

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
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
    SELECT s.* FROM public.saml_configurations s
    WHERE s.scim_token = $1 AND s.enabled = true
  `, [token])
  return result.rows[0] || null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramsId } = await params
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

  if (!validateUUID(paramsId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const result = await pool.query(`
      SELECT id, email, full_name, role, created_at
      FROM public.profiles
      WHERE id = $1 AND institution_id = $2
    `, [paramsId, scim.institution_id])

    if (result.rows.length === 0) {
      return NextResponse.json({
        schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
        detail: 'User not found'
      }, { status: 404 })
    }

    const user = result.rows[0]
    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: user.id,
      userName: user.email,
      name: { 
        givenName: user.full_name?.split(' ')[0] || '', 
        familyName: user.full_name?.split(' ').slice(1).join(' ') || '' 
      },
      emails: [{ value: user.email, primary: true }],
      active: true,
      meta: { resourceType: 'User', created: user.created_at }
    })
  } catch (error: any) {
    console.error('SCIM GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramsId } = await params
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

  if (!validateUUID(paramsId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { userName, name, active } = body
    
    const fullName = [
      sanitizeString(name?.givenName, 100),
      sanitizeString(name?.familyName, 100)
    ].filter(Boolean).join(' ')

    await pool.query(`
      UPDATE public.profiles SET
        full_name = $1,
        updated_at = NOW()
      WHERE id = $2 AND institution_id = $3
    `, [fullName, paramsId, scim.institution_id])

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: paramsId,
      userName: sanitizeString(userName, 255),
      name: { 
        givenName: sanitizeString(name?.givenName, 100), 
        familyName: sanitizeString(name?.familyName, 100) 
      },
      active: Boolean(active),
      meta: { resourceType: 'User' }
    })
  } catch (error: any) {
    console.error('SCIM PUT Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramsId } = await params
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

  if (!validateUUID(paramsId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    await pool.query(`
      DELETE FROM public.profiles 
      WHERE id = $1 AND institution_id = $2
    `, [paramsId, scim.institution_id])

    return new NextResponse(null, { status: 204 })
  } catch (error: any) {
    console.error('SCIM DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: paramsId } = await params
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

  if (!validateUUID(paramsId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const operations = body.operations || []

    if (!Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid operations' }, { status: 400 })
    }

    for (const op of operations) {
      if (op.op === 'replace' && op.path === 'active') {
        await pool.query(`
          UPDATE public.profiles SET updated_at = NOW()
          WHERE id = $1 AND institution_id = $2
        `, [paramsId, scim.institution_id])
      }
    }

    return NextResponse.json({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: paramsId,
      meta: { resourceType: 'User' }
    })
  } catch (error: any) {
    console.error('SCIM PATCH Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
