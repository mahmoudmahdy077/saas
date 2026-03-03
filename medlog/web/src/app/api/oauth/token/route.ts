import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

function generateClientId(): string {
  return randomBytes(16).toString('hex')
}

function generateClientSecret(): string {
  return randomBytes(32).toString('hex')
}

function generateCode(): string {
  return randomBytes(32).toString('hex')
}

function generateAccessToken(): string {
  return randomBytes(32).toString('hex')
}

function generateRefreshToken(): string {
  return randomBytes(32).toString('hex')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const responseType = searchParams.get('response_type')
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const scope = searchParams.get('scope') || 'read'

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'invalid_request', error_description: 'Missing required parameters' }, { status: 400 })
  }

  try {
    const appResult = await pool.query(`
      SELECT * FROM public.oauth_applications WHERE client_id = $1
    `, [clientId])

    if (appResult.rows.length === 0) {
      return NextResponse.json({ error: 'invalid_client', error_description: 'Unknown client' }, { status: 401 })
    }

    const app = appResult.rows[0]
    const allowedRedirects = Array.isArray(app.redirect_uris) ? app.redirect_uris : JSON.parse(app.redirect_uris || '[]')
    
    if (!allowedRedirects.includes(redirectUri)) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Invalid redirect URI' }, { status: 400 })
    }

    if (responseType === 'code') {
      return NextResponse.json({
        client: { name: app.name, client_id: clientId },
        scope,
        redirect_uri: redirectUri
      })
    }

    return NextResponse.json({ error: 'unsupported_response_type' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { grant_type, code, client_id, client_secret, redirect_uri, refresh_token } = body

  if (grant_type === 'authorization_code') {
    if (!code || !client_id || !client_secret || !redirect_uri) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing required parameters' }, { status: 400 })
    }

    try {
      const appResult = await pool.query(`
        SELECT * FROM public.oauth_applications WHERE client_id = $1
      `, [client_id])

      if (appResult.rows.length === 0) {
        return NextResponse.json({ error: 'invalid_client', error_description: 'Unknown client' }, { status: 401 })
      }

      const app = appResult.rows[0]
      
      if (app.client_secret !== client_secret) {
        return NextResponse.json({ error: 'invalid_client', error_description: 'Invalid client credentials' }, { status: 401 })
      }

      const codeResult = await pool.query(`
        SELECT * FROM public.oauth_codes 
        WHERE code = $1 AND client_id = $2 AND redirect_uri = $3 AND expires_at > NOW()
      `, [code, client_id, redirect_uri])

      if (codeResult.rows.length === 0) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
      }

      const authCode = codeResult.rows[0]
      await pool.query('DELETE FROM public.oauth_codes WHERE id = $1', [authCode.id])

      const accessToken = generateAccessToken()
      const refreshToken = generateRefreshToken()
      const expiresAt = new Date(Date.now() + 3600 * 1000)

      await pool.query(`
        INSERT INTO public.oauth_tokens (client_id, user_id, access_token, refresh_token, scope, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [client_id, authCode.user_id, accessToken, refreshToken, authCode.scope, expiresAt])

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: refreshToken,
        scope: authCode.scope
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  if (grant_type === 'refresh_token') {
    if (!refresh_token || !client_id || !client_secret) {
      return NextResponse.json({ error: 'invalid_request', error_description: 'Missing required parameters' }, { status: 400 })
    }

    try {
      const appResult = await pool.query(`
        SELECT * FROM public.oauth_applications WHERE client_id = $1
      `, [client_id])

      if (appResult.rows.length === 0) {
        return NextResponse.json({ error: 'invalid_client', error_description: 'Unknown client' }, { status: 401 })
      }

      const app = appResult.rows[0]
      
      if (app.client_secret !== client_secret) {
        return NextResponse.json({ error: 'invalid_client', error_description: 'Invalid client credentials' }, { status: 401 })
      }

      const tokenResult = await pool.query(`
        SELECT * FROM public.oauth_tokens 
        WHERE refresh_token = $1 AND client_id = $2 AND expires_at > NOW()
      `, [refresh_token, client_id])

      if (tokenResult.rows.length === 0) {
        return NextResponse.json({ error: 'invalid_grant' }, { status: 400 })
      }

      const accessToken = generateAccessToken()
      const newRefreshToken = generateRefreshToken()
      const expiresAt = new Date(Date.now() + 3600 * 1000)

      await pool.query(`
        UPDATE public.oauth_tokens SET
          access_token = $1,
          refresh_token = $2,
          expires_at = $3
        WHERE id = $4
      `, [accessToken, newRefreshToken, expiresAt, tokenResult.rows[0].id])

      return NextResponse.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken
      })
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 })
}
