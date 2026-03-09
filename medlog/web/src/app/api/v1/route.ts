import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { randomBytes } from 'crypto'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

function generateApiKey(): string {
    return `ml_${randomBytes(32).toString('hex')}`
}

async function verifyApiKey(request: NextRequest) {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        return null
    }

    const apiKey = authHeader.substring(7)

    if (!apiKey || apiKey.length < 10) {
        return null
    }

    const result = await pool.query(`
    SELECT ak.*, p.institution_id, p.role
    FROM public.api_keys ak
    JOIN public.profiles p ON ak.user_id = p.id
    WHERE ak.key = $1 AND ak.is_active = true AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
  `, [apiKey])

    if (result.rows.length === 0) {
        return null
    }

    return result.rows[0]
}

function sanitizeLimitOffset(limit: number, offset: number): { limit: number, offset: number } {
    const maxLimit = 100
    return {
        limit: Math.min(Math.max(1, Math.floor(limit || 50)), maxLimit),
        offset: Math.max(0, Math.floor(offset || 0))
    }
}

export async function GET(request: NextRequest) {
    const apiUser = await verifyApiKey(request)
    if (!apiUser) {
        return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const resource = searchParams.get('resource')
        const id = searchParams.get('id')
        const { limit, offset } = sanitizeLimitOffset(
            parseInt(searchParams.get('limit') || '50'),
            parseInt(searchParams.get('offset') || '0')
        )

        if (resource === 'cases') {
            let query = `
        SELECT c.*, p.full_name as resident_name, s.name as specialty_name
        FROM public.cases c
        LEFT JOIN public.profiles p ON c.resident_id = p.id
        LEFT JOIN public.specialties s ON c.specialty_id = s.id
        WHERE c.institution_id = $1
      `
            const params: any[] = [apiUser.institution_id]

            if (id) {
                if (!/^[0-9a-f-]{36}$/i.test(id)) {
                    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
                }
                query += ` AND c.id = $2`
                params.push(id)
            }

            query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
            params.push(limit, offset)

            const result = await pool.query(query, params)
            return NextResponse.json({ data: result.rows })
        }

        if (resource === 'residents') {
            let query = `
        SELECT p.id, p.full_name, p.role, s.name as specialty_name,
               (SELECT COUNT(*) FROM public.cases WHERE resident_id = p.id) as case_count
        FROM public.profiles p
        LEFT JOIN public.specialties s ON p.specialty_id = s.id
        WHERE p.institution_id = $1 AND p.role = 'resident'
      `
            const params: any[] = [apiUser.institution_id]

            if (id) {
                if (!/^[0-9a-f-]{36}$/i.test(id)) {
                    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
                }
                query += ` AND p.id = $2`
                params.push(id)
            }

            query += ` ORDER BY p.full_name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
            params.push(limit, offset)

            const result = await pool.query(query, params)
            return NextResponse.json({ data: result.rows })
        }

        if (resource === 'progress') {
            let query = `
        SELECT rp.*, p.full_name as resident_name
        FROM public.resident_progress rp
        JOIN public.profiles p ON rp.resident_id = p.id
        WHERE p.institution_id = $1
      `
            const params: any[] = [apiUser.institution_id]

            if (id) {
                if (!/^[0-9a-f-]{36}$/i.test(id)) {
                    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
                }
                query += ` AND rp.resident_id = $2`
                params.push(id)
            }

            const result = await pool.query(query, params)
            return NextResponse.json({ data: result.rows })
        }

        if (resource === 'stats') {
            const casesResult = await pool.query(`
        SELECT 
          COUNT(*) as total_cases,
          COUNT(DISTINCT resident_id) as total_residents,
          COUNT(CASE WHEN verified_at IS NOT NULL THEN 1 END) as verified_cases
        FROM public.cases
        WHERE institution_id = $1
      `, [apiUser.institution_id])

            return NextResponse.json({ data: casesResult.rows[0] })
        }

        return NextResponse.json({
            error: 'Invalid resource. Available: cases, residents, progress, stats'
        }, { status: 400 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const apiUser = await verifyApiKey(request)
    if (!apiUser) {
        return NextResponse.json({ error: 'Invalid or expired API key' }, { status: 401 })
    }

    if (!apiUser.can_write) {
        return NextResponse.json({ error: 'API key does not have write permissions' }, { status: 403 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const resource = searchParams.get('resource')

        if (resource === 'cases') {
            const body = await request.json()

            const result = await pool.query(`
        INSERT INTO public.cases (
          resident_id,
          institution_id,
          title,
          date,
          category,
          procedure_type,
          diagnosis,
          description,
          specialty_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
                body.resident_id || apiUser.user_id,
                apiUser.institution_id,
                body.title,
                body.date || new Date(),
                body.category,
                body.procedure_type,
                body.diagnosis,
                body.description,
                body.specialty_id
            ])

            return NextResponse.json({ data: result.rows[0] }, { status: 201 })
        }

        return NextResponse.json({
            error: 'Invalid resource for POST. Available: cases'
        }, { status: 400 })

    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
