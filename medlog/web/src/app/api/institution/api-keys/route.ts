import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAuthenticatedUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  return user
}

function generateApiKey(): string {
  return `ml_${randomBytes(32).toString('hex')}`
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const result = await pool.query(`
      SELECT * FROM public.api_keys 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [user.id])

    return NextResponse.json({ keys: result.rows.map(k => ({ ...k, key: k.key.substring(0, 20) + '...' })) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, keyData } = body

    if (action === 'create') {
      const apiKey = generateApiKey()
      
      const result = await pool.query(`
        INSERT INTO public.api_keys (user_id, name, key, can_read, can_write, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
        user.id,
        keyData.name,
        apiKey,
        keyData.can_read !== false,
        keyData.can_write || false,
        keyData.expires_at || null
      ])

      return NextResponse.json({ 
        key: { ...result.rows[0], key: apiKey } 
      })
    }

    if (action === 'revoke' && keyData.id) {
      await pool.query(`
        UPDATE public.api_keys SET is_active = false WHERE id = $1 AND user_id = $2
      `, [keyData.id, user.id])

      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && keyData.id) {
      await pool.query(`
        DELETE FROM public.api_keys WHERE id = $1 AND user_id = $2
      `, [keyData.id, user.id])

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
