import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dateFrom, dateTo, categories } = body

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, specialty_id')
      .eq('id', user.id)
      .single()

    // Fetch cases with filters
    let query = supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }
    if (categories && categories.length > 0) {
      query = query.in('category', categories)
    }

    const { data: cases, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json({ error: 'No cases found for the selected criteria' }, { status: 404 })
    }

    // Build CV data
    const categoryBreakdown: Record<string, { total: number; primary: number; assistant: number; observer: number; verified: number }> = {}

    cases.forEach(c => {
      if (!categoryBreakdown[c.category]) {
        categoryBreakdown[c.category] = { total: 0, primary: 0, assistant: 0, observer: 0, verified: 0 }
      }
      categoryBreakdown[c.category].total++
      categoryBreakdown[c.category][c.role as 'primary' | 'assistant' | 'observer']++
      if (c.verification_status !== 'self') {
        categoryBreakdown[c.category].verified++
      }
    })

    const totalVerified = cases.filter(c => c.verification_status !== 'self').length
    const dateRange = cases.length > 0
      ? `${new Date(cases[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} – ${new Date(cases[cases.length - 1].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
      : 'N/A'

    // Generate top procedures
    const procedureCounts: Record<string, number> = {}
    cases.forEach(c => {
      procedureCounts[c.procedure_type] = (procedureCounts[c.procedure_type] || 0) + 1
    })
    const topProcedures = Object.entries(procedureCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    // Generate HTML CV
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Case Log – ${profile?.full_name || 'Resident'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a2e; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; background: white; }
    .header { text-align: center; border-bottom: 3px double #16213e; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 28px; color: #16213e; letter-spacing: 1px; }
    .header .subtitle { font-size: 14px; color: #666; margin-top: 8px; }
    .header .date-range { font-size: 13px; color: #888; margin-top: 4px; font-style: italic; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 18px; color: #16213e; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; text-align: center; }
    .summary-card .number { font-size: 28px; font-weight: bold; color: #16213e; }
    .summary-card .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #16213e; color: white; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:hover { background: #f8f9fa; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-verified { background: #d4edda; color: #155724; }
    .badge-approved { background: #cce5ff; color: #004085; }
    .badge-self { background: #f8f9fa; color: #666; }
    .footer { text-align: center; margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
    @media print { body { padding: 20px; } .summary-grid { grid-template-columns: repeat(4, 1fr); } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Medical Case Log</h1>
    <div class="subtitle">${profile?.full_name || 'Medical Resident'} · ${profile?.role?.replace('_', ' ').replace(/^\w/, (c: string) => c.toUpperCase()) || 'Resident'}</div>
    <div class="date-range">${dateRange}</div>
  </div>

  <div class="section">
    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="number">${cases.length}</div>
        <div class="label">Total Cases</div>
      </div>
      <div class="summary-card">
        <div class="number">${cases.filter(c => c.role === 'primary').length}</div>
        <div class="label">As Primary</div>
      </div>
      <div class="summary-card">
        <div class="number">${totalVerified}</div>
        <div class="label">Verified</div>
      </div>
      <div class="summary-card">
        <div class="number">${Object.keys(categoryBreakdown).length}</div>
        <div class="label">Specialties</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Category Breakdown</h2>
    <table>
      <thead>
        <tr><th>Category</th><th>Total</th><th>Primary</th><th>Assistant</th><th>Observer</th><th>Verified</th></tr>
      </thead>
      <tbody>
        ${Object.entries(categoryBreakdown).map(([cat, data]) => `
        <tr>
          <td><strong>${cat}</strong></td>
          <td>${data.total}</td>
          <td>${data.primary}</td>
          <td>${data.assistant}</td>
          <td>${data.observer}</td>
          <td>${data.verified}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Top Procedures</h2>
    <table>
      <thead>
        <tr><th>Procedure</th><th>Count</th></tr>
      </thead>
      <tbody>
        ${topProcedures.map(([proc, count]) => `
        <tr><td>${proc}</td><td>${count}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Case Details</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Procedure</th><th>Category</th><th>Role</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${cases.map(c => `
        <tr>
          <td>${new Date(c.date).toLocaleDateString()}</td>
          <td>${c.procedure_type}</td>
          <td>${c.category}</td>
          <td style="text-transform:capitalize">${c.role}</td>
          <td><span class="badge badge-${c.verification_status === 'pd_approved' ? 'approved' : c.verification_status === 'consultant_verified' ? 'verified' : 'self'}">${c.verification_status === 'self' ? 'Self' : c.verification_status === 'consultant_verified' ? 'Verified' : 'Approved'}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    Generated by MedLog · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="medical-case-log-${new Date().toISOString().split('T')[0]}.html"`,
      },
    })
  } catch (error) {
    console.error('CV export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
