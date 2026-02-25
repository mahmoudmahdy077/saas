import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getAdminUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  if (!user) return null

  const result = await pool.query('SELECT role FROM public.profiles WHERE id = $1', [user.id])
  if (result.rows[0]?.role !== 'super_admin') return null

  return user
}

export async function GET(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await pool.query('SELECT * FROM public.ai_providers ORDER BY name')
    return NextResponse.json({ providers: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await getAdminUser(request)
  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, provider } = body

  try {
    if (action === 'save') {
      const { id, name, apiKey, apiUrl, model, isActive, isDefault, settings } = provider

      if (isDefault) {
        await pool.query('UPDATE public.ai_providers SET is_default = false WHERE is_default = true')
      }

      if (id) {
        await pool.query(`
          UPDATE public.ai_providers 
          SET api_key = $1, api_url = $2, model = $3, is_active = $4, is_default = $5, settings = $6, updated_at = NOW()
          WHERE id = $7
        `, [apiKey, apiUrl, model, isActive, isDefault, JSON.stringify(settings || {}), id])
      } else {
        await pool.query(`
          INSERT INTO public.ai_providers (name, api_key, api_url, model, is_active, is_default, settings)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [name, apiKey, apiUrl, model, isActive, isDefault, JSON.stringify(settings || {})])
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'delete' && provider.id) {
      await pool.query('DELETE FROM public.ai_providers WHERE id = $1', [provider.id])
      return NextResponse.json({ success: true })
    }

    if (action === 'setDefault' && provider.id) {
      await pool.query('UPDATE public.ai_providers SET is_default = false WHERE is_default = true')
      await pool.query('UPDATE public.ai_providers SET is_default = true, is_active = true WHERE id = $1', [provider.id])
      return NextResponse.json({ success: true })
    }

    if (action === 'test' && provider.id) {
      const result = await pool.query('SELECT * FROM public.ai_providers WHERE id = $1', [provider.id])
      const p = result.rows[0]

      let testResult = { success: false, message: 'Unknown provider' }

      if (p.name === 'openai' && p.api_key) {
        try {
          const response = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${p.api_key}` }
          })
          testResult = { success: response.ok, message: response.ok ? 'OpenAI connection successful' : 'Invalid API key' }
        } catch (e: any) {
          testResult = { success: false, message: e.message }
        }
      } else if (p.name === 'openrouter' && p.api_key) {
        try {
          const response = await fetch('https://openrouter.ai/api/v1/models', {
            headers: { 'Authorization': `Bearer ${p.api_key}` }
          })
          testResult = { success: response.ok, message: response.ok ? 'OpenRouter connection successful' : 'Invalid API key' }
        } catch (e: any) {
          testResult = { success: false, message: e.message }
        }
      } else if (p.name === 'ollama' && p.api_url) {
        try {
          const response = await fetch(`${p.api_url}/api/tags`)
          testResult = { success: response.ok, message: response.ok ? 'Ollama connection successful' : 'Cannot connect to Ollama' }
        } catch (e: any) {
          testResult = { success: false, message: e.message }
        }
      }

      return NextResponse.json(testResult)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
