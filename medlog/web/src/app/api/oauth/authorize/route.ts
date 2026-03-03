import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

function generateCode(): string {
  return randomBytes(32).toString('hex')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('client_id')
  const redirectUri = searchParams.get('redirect_uri')
  const scope = searchParams.get('scope') || 'read'
  const state = searchParams.get('state')

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

    const formHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorize Application</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen">
  <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Authorize Application</h1>
    <p class="text-gray-600 mb-6">
      <strong>${app.name}</strong> is requesting access to your MedLog account.
    </p>
    <p class="text-sm text-gray-500 mb-6">
      This application will be able to: <span class="font-medium">${scope}</span>
    </p>
    
    <form method="POST" action="/api/oauth/authorize">
      <input type="hidden" name="client_id" value="${clientId}">
      <input type="hidden" name="redirect_uri" value="${redirectUri}">
      <input type="hidden" name="scope" value="${scope}">
      ${state ? `<input type="hidden" name="state" value="${state}">` : ''}
      
      <div class="flex gap-3">
        <button type="submit" name="action" value="deny" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Deny
        </button>
        <button type="submit" name="action" value="allow" class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Allow
        </button>
      </div>
    </form>
  </div>
</body>
</html>
    `
    return new NextResponse(formHtml, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }

  const formData = await request.formData()
  const clientId = formData.get('client_id') as string
  const redirectUri = formData.get('redirect_uri') as string
  const scope = formData.get('scope') as string
  const state = formData.get('state') as string
  const action = formData.get('action') as string

  if (action === 'deny') {
    const errorUrl = new URL(redirectUri)
    errorUrl.searchParams.set('error', 'access_denied')
    if (state) errorUrl.searchParams.set('state', state)
    return NextResponse.redirect(errorUrl)
  }

  try {
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query(`
      INSERT INTO public.oauth_codes (code, client_id, user_id, redirect_uri, scope, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [code, clientId, user.id, redirectUri, scope, expiresAt])

    const successUrl = new URL(redirectUri)
    successUrl.searchParams.set('code', code)
    if (state) successUrl.searchParams.set('state', state)

    return NextResponse.redirect(successUrl)
  } catch (error: any) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
  }
}
