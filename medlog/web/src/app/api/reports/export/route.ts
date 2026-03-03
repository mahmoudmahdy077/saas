import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

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

function generateReportHTML(reportType: string, data: any, institutionName: string, periodStart: string, periodEnd: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  
  let content = ''
  
  switch (reportType) {
    case 'case_volume':
      content = `
        <h2>Case Volume Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Total Cases</th>
              <th>Unique Residents</th>
            </tr>
          </thead>
          <tbody>
            ${(data.monthly_data || []).map((row: any) => `
              <tr>
                <td>${new Date(row.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</td>
                <td>${row.total_cases}</td>
                <td>${row.unique_residents}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      break
      
    case 'minimums':
      content = `
        <h2>Case Minimums Compliance</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Required</th>
              <th>Logged</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${(data.minimums || []).map((row: any) => `
              <tr>
                <td>${row.category}</td>
                <td>${row.minimum_required}</td>
                <td>${row.logged_cases}</td>
                <td style="color: ${row.status === 'met' ? 'green' : 'red'}">${row.status === 'met' ? 'Met' : 'Not Met'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      break
      
    case 'resident_summary':
      content = `
        <h2>Resident Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Resident</th>
              <th>Total Cases</th>
              <th>Verified</th>
              <th>Last Case</th>
            </tr>
          </thead>
          <tbody>
            ${(data.residents || []).map((row: any) => `
              <tr>
                <td>${row.full_name || 'Unknown'}</td>
                <td>${row.total_cases || 0}</td>
                <td>${row.verified_cases || 0}</td>
                <td>${row.last_case_date ? new Date(row.last_case_date).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      break
      
    case 'milestone':
      content = `
        <h2>Milestone Assessment Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Competency</th>
              <th>Level</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            ${(data.milestones || []).map((row: any) => `
              <tr>
                <td>${row.competency_area}</td>
                <td>Level ${row.level}</td>
                <td>${row.assessment_count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `
      break
      
    default:
      content = '<p>Report data not available</p>'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>MedLog Report - ${reportType}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          color: #1a1a1a;
        }
        .header {
          border-bottom: 2px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        h1 {
          color: #2563eb;
          margin: 0 0 10px 0;
        }
        .meta {
          color: #666;
          font-size: 14px;
        }
        h2 {
          color: #333;
          margin-top: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background: #f5f5f5;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background: #fafafa;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MedLog Report</h1>
        <div class="meta">
          <p><strong>Institution:</strong> ${institutionName}</p>
          <p><strong>Report Type:</strong> ${reportType.replace('_', ' ').toUpperCase()}</p>
          <p><strong>Period:</strong> ${periodStart} - ${periodEnd}</p>
          <p><strong>Generated:</strong> ${date}</p>
        </div>
      </div>
      
      ${content}
      
      <div class="footer">
        <p>Generated by MedLog - Surgical & Medical Case E-Logbook</p>
        <p>This report is for informational purposes and compliance tracking.</p>
      </div>
    </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { report_type, start_date, end_date, report_id } = body

    let reportData: any = null
    let institutionName = 'Institution'

    if (report_id) {
      const reportResult = await pool.query(`
        SELECT r.*, i.name as institution_name
        FROM public.acgme_reports r
        JOIN public.institutions i ON r.institution_id = i.id
        WHERE r.id = $1
      `, [report_id])
      
      if (reportResult.rows.length === 0) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 })
      }
      
      reportData = reportResult.rows[0].data
      institutionName = reportResult.rows[0].institution_name
    } else {
      const profileResult = await pool.query(`
        SELECT p.institution_id, i.name as institution_name
        FROM public.profiles p
        JOIN public.institutions i ON p.institution_id = i.id
        WHERE p.id = $1
      `, [user.id])

      if (profileResult.rows.length === 0) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      institutionName = profileResult.rows[0].institution_name

      switch (report_type) {
        case 'case_volume':
          const caseVolumeResult = await pool.query(`
            SELECT 
              DATE_TRUNC('month', created_at) as month,
              COUNT(*) as total_cases,
              COUNT(DISTINCT resident_id) as unique_residents
            FROM public.cases
            WHERE institution_id = $1 AND created_at >= $2 AND created_at <= $3
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month
          `, [profileResult.rows[0].institution_id, start_date, end_date])
          reportData = { monthly_data: caseVolumeResult.rows }
          break

        case 'minimums':
          const minimumsResult = await pool.query(`
            SELECT 
              cm.category,
              cm.minimum_required,
              COUNT(c.id) as logged_cases,
              CASE WHEN COUNT(c.id) >= cm.minimum_required THEN 'met' ELSE 'not_met' END as status
            FROM public.case_minimums cm
            LEFT JOIN public.cases c ON c.institution_id = $1 
              AND c.created_at >= $2 
              AND c.created_at <= $3
            WHERE cm.accreditation_type = 'general_surgery'
            GROUP BY cm.id
          `, [profileResult.rows[0].institution_id, start_date, end_date])
          reportData = { minimums: minimumsResult.rows }
          break

        case 'resident_summary':
          const residentsResult = await pool.query(`
            SELECT 
              p.full_name,
              COUNT(c.id) as total_cases,
              COUNT(c.verified_at) as verified_cases,
              MAX(c.created_at) as last_case_date
            FROM public.profiles p
            LEFT JOIN public.cases c ON c.resident_id = p.id
              AND c.created_at >= $1 
              AND c.created_at <= $2
            WHERE p.institution_id = $3 AND p.role = 'resident'
            GROUP BY p.id
          `, [start_date, end_date, profileResult.rows[0].institution_id])
          reportData = { residents: residentsResult.rows }
          break

        case 'milestone':
          const milestonesResult = await pool.query(`
            SELECT 
              md.competency_area,
              ma.level,
              COUNT(*) as assessment_count
            FROM public.milestone_assessments ma
            JOIN public.milestone_definitions md ON md.id = ma.milestone_id
            WHERE ma.assessment_date >= $1 AND ma.assessment_date <= $2
            GROUP BY md.competency_area, ma.level
          `, [start_date, end_date])
          reportData = { milestones: milestonesResult.rows }
          break
      }
    }

    const html = generateReportHTML(
      report_type || 'report',
      reportData,
      institutionName,
      start_date || 'N/A',
      end_date || 'N/A'
    )

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="medlog-${report_type}-report.html"`
      }
    })
  } catch (error: any) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
