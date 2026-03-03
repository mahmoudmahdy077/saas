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

function generateSecret(): string {
  return randomBytes(32).toString('hex')
}

function validateWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    
    const hostname = parsed.hostname.toLowerCase()
    
    const privateIPPatterns = [
      /^localhost$/i,
      /^127\.\d+\.\d+\.\d+$/,
      /^10\.\d+\.\d+\.\d+$/,
      /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
      /^192\.168\.\d+\.\d+$/,
      /^::1$/,
      /^fe80:/i,
      /^fc00:/i,
      /^fd00:/i,
    ]
    
    for (const pattern of privateIPPatterns) {
      if (pattern.test(hostname)) {
        return false
      }
    }
    
    const blockedDomains = [
      '169.254.169.254',
      'metadata.google.internal',
      'metadata.googleusercontent.com',
    ]
    
    if (blockedDomains.includes(hostname)) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

function sanitizeString(input: any, maxLength: number = 500): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>'"]/g, '').substring(0, maxLength)
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
      SELECT * FROM public.webhooks 
      WHERE institution_id = $1 
      ORDER BY created_at DESC
    `, [profile.institution_id])

    return NextResponse.json({ webhooks: result.rows })
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
    const profileResult = await pool.query(
      'SELECT institution_id, role FROM public.profiles WHERE id = $1',
      [user.id]
    )
    const profile = profileResult.rows[0]

    if (!profile || !['program_director', 'institution_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { action, webhook } = body

    if (action === 'create') {
      if (!webhook?.url || !validateWebhookUrl(webhook.url)) {
        return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
      }
      
      const secret = generateSecret()
      
      const result = await pool.query(`
        INSERT INTO public.webhooks (institution_id, url, events, secret)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [
        profile.institution_id,
        webhook.url,
        JSON.stringify(webhook.events || []),
        secret
      ])

      return NextResponse.json({ 
        webhook: { ...result.rows[0], secret } 
      })
    }

    if (action === 'update' && webhook?.id) {
      if (webhook?.url && !validateWebhookUrl(webhook.url)) {
        return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 })
      }
      
      const result = await pool.query(`
        UPDATE public.webhooks SET
          url = $1,
          events = $2,
          updated_at = NOW()
        WHERE id = $3 AND institution_id = $4
        RETURNING *
      `, [
        webhook.url,
        JSON.stringify(webhook.events || []),
        webhook.id,
        profile.institution_id
      ])

      return NextResponse.json({ webhook: result.rows[0] })
    }

    if (action === 'toggle' && webhook.id) {
      const result = await pool.query(`
        UPDATE public.webhooks SET
          is_active = NOT is_active,
          updated_at = NOW()
        WHERE id = $1 AND institution_id = $2
        RETURNING *
      `, [webhook.id, profile.institution_id])

      return NextResponse.json({ webhook: result.rows[0] })
    }

    if (action === 'delete' && webhook.id) {
      await pool.query(`
        DELETE FROM public.webhooks WHERE id = $1 AND institution_id = $2
      `, [webhook.id, profile.institution_id])

      return NextResponse.json({ success: true })
    }

    if (action === 'test' && webhook.id) {
      const webhookResult = await pool.query(`
        SELECT * FROM public.webhooks WHERE id = $1 AND institution_id = $2
      `, [webhook.id, profile.institution_id])

      if (webhookResult.rows.length === 0) {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
      }

      const wh = webhookResult.rows[0]
      
      try {
        const response = await fetch(wh.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MedLog-Webhook-Secret': wh.secret,
            'X-MedLog-Event': 'test'
          },
          body: JSON.stringify({
            event: 'test',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test webhook from MedLog' }
          })
        })

        return NextResponse.json({ 
          success: response.ok,
          status: response.status
        })
      } catch (error: any) {
        return NextResponse.json({ 
          success: false, 
          error: error.message 
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
