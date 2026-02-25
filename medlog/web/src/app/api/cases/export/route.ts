import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
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

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('verification_status', status)
    }

    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    const { data: cases, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const csvHeader = [
      'Date',
      'Procedure',
      'Category',
      'Subcategory',
      'Role',
      'Patient Age',
      'Patient Gender',
      'Diagnosis',
      'Complications',
      'Notes',
      'Status',
    ].join(',')

    const csvRows = cases.map(c => [
      c.date,
      `"${c.procedure_type}"`,
      c.category,
      c.subcategory || '',
      c.role,
      c.patient_demographics?.age || '',
      c.patient_demographics?.gender || '',
      `"${(c.diagnosis || '').replace(/"/g, '""')}"`,
      `"${(c.complications || []).join('; ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.verification_status,
    ].join(','))

    const csv = [csvHeader, ...csvRows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="medlog-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting cases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
