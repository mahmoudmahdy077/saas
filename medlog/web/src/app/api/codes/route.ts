import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const type = searchParams.get('type') // 'cpt' or 'icd'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Search CPT codes
    if (type === 'cpt' || action === 'procedures') {
      let query = 'SELECT * FROM procedure_codes WHERE 1=1'
      const params: any[] = []

      if (search) {
        params.push(`%${search}%`)
        query += ` AND (code ILIKE $${params.length} OR description ILIKE $${params.length})`
      }

      if (category) {
        params.push(category)
        query += ` AND category = $${params.length}`
      }

      query += ` ORDER BY code LIMIT $${params.length + 1}`
      params.push(limit)

      const result = await pool.query(query, params)
      return NextResponse.json({ codes: result.rows, type: 'cpt' })
    }

    // Search ICD-10 codes
    if (type === 'icd' || action === 'diagnoses') {
      let query = 'SELECT * FROM diagnosis_codes WHERE 1=1'
      const params: any[] = []

      if (search) {
        params.push(`%${search}%`)
        query += ` AND (code ILIKE $${params.length} OR description ILIKE $${params.length})`
      }

      if (category) {
        params.push(category)
        query += ` AND category = $${params.length}`
      }

      query += ` ORDER BY code LIMIT $${params.length + 1}`
      params.push(limit)

      const result = await pool.query(query, params)
      return NextResponse.json({ codes: result.rows, type: 'icd' })
    }

    // Get categories
    if (action === 'categories') {
      const cptCategories = await pool.query('SELECT DISTINCT category FROM procedure_codes ORDER BY category')
      const icdCategories = await pool.query('SELECT DISTINCT category FROM diagnosis_codes ORDER BY category')
      
      return NextResponse.json({ 
        cpt: cptCategories.rows.map(r => r.category),
        icd: icdCategories.rows.map(r => r.category)
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
