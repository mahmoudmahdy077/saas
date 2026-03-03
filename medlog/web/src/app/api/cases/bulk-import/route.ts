import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const MAX_BULK_CASES = 500

function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: any }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, limit: number = 5, windowMs: number = 60000): boolean {
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

function sanitizeString(input: any, maxLength: number = 1000): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[<>&'"]/g, '').substring(0, maxLength)
}

function sanitizeDate(dateStr: any): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  return date.toISOString().split('T')[0]
}

function sanitizeArray(input: any, maxLength: number = 50): string[] {
  if (!Array.isArray(input)) return []
  return input.slice(0, maxLength).map((item: any) => sanitizeString(item, 100))
}

function validateCaseData(caseData: any): boolean {
  if (!caseData || typeof caseData !== 'object') return false
  if (!caseData.date && !caseData.procedure_type && !caseData.category) return false
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  
  if (!rateLimit(`bulk-import:${ip}`)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
  }

  try {
    const supabase = createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    let { cases } = body

    if (!cases || !Array.isArray(cases)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    if (cases.length > MAX_BULK_CASES) {
      return NextResponse.json({ 
        error: `Too many cases. Maximum ${MAX_BULK_CASES} cases per import.` 
      }, { status: 400 })
    }

    if (cases.length === 0) {
      return NextResponse.json({ error: 'No cases to import' }, { status: 400 })
    }

    const validRoles = ['primary', 'assistant', 'observer']
    const validCategories = [
      'Cardiothoracic', 'Vascular', 'Colorectal', 'Hernia', 'Laparoscopic',
      'Endocrine', 'Breast', 'Skin and Soft Tissue', 'Trauma', 'Burns',
      'Pediatric', 'Surgical Oncology', 'Gastrointestinal', 'Hepatobiliary',
      'Renal', 'Obstetrics', 'Gynecologic', 'Basic Laparoscopic', 'Open Abdominal', 'Other'
    ]

    const formattedCases = cases
      .filter(validateCaseData)
      .slice(0, MAX_BULK_CASES)
      .map(caseData => {
        const role = sanitizeString(caseData.role || caseData.procedureRole || 'observer', 20)
        const category = sanitizeString(caseData.category || caseData.procedureCategory || 'Other', 50)
        
        return {
          user_id: user.id,
          date: sanitizeDate(caseData.date) || new Date().toISOString().split('T')[0],
          procedure_type: sanitizeString(caseData.procedure_type || caseData.procedureType || 'Unknown', 100),
          category: validCategories.includes(category) ? category : 'Other',
          role: validRoles.includes(role) ? role : 'observer',
          diagnosis: sanitizeString(caseData.diagnosis, 1000),
          notes: sanitizeString(caseData.notes, 5000),
          complications: sanitizeArray(caseData.complications, 20),
          verification_status: 'self'
        }
      })

    if (formattedCases.length === 0) {
      return NextResponse.json({ error: 'No valid cases to import after validation' }, { status: 400 })
    }

    const { data: insertedCases, error: insertError } = await supabase
      .from('cases')
      .insert(formattedCases)
      .select()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    try {
      const latestCaseDate = formattedCases.reduce((max: string, c: any) =>
        new Date(c.date) > new Date(max) ? c.date : max,
        formattedCases[0].date
      )

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_streak, longest_streak, last_logged_date')
        .eq('id', user.id)
        .single()

      if (profile) {
        let newStreak = profile.current_streak || 0
        const lastLogged = profile.last_logged_date
        const today = new Date().toISOString().split('T')[0]

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        if (latestCaseDate === today || latestCaseDate === yesterdayStr) {
          newStreak = Math.max(newStreak, 1)
        }

        const newLastLogged = latestCaseDate > (lastLogged || '') ? latestCaseDate : lastLogged

        await supabase.from('profiles').update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, profile.longest_streak || 0),
          last_logged_date: newLastLogged,
          updated_at: new Date().toISOString()
        }).eq('id', user.id)
      }
    } catch (streakError) {
      console.error('Bulk streak update error:', streakError)
    }

    return NextResponse.json({
      success: true,
      count: formattedCases.length
    })
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
