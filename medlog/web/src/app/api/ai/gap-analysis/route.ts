import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function rateLimit(key: string, limit: number = 10, windowMs: number = 60000): boolean {
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

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    if (!rateLimit(`ai-gap:${ip}`)) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
    }

    try {
        const cookieStore = await cookies()
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

        // Fetch all user cases
        const { data: cases, error } = await supabase
            .from('cases')
            .select('category, role, procedure_type, date, verification_status')
            .eq('user_id', user.id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!cases || cases.length === 0) {
            return NextResponse.json({
                totalCases: 0,
                categoryDistribution: {},
                roleDistribution: {},
                procedureTypes: {},
                monthlyTrend: {},
                verificationRate: 0,
                gaps: [],
                recommendations: [],
            })
        }

        // Category distribution
        const categoryDistribution: Record<string, number> = {}
        cases.forEach(c => {
            categoryDistribution[c.category] = (categoryDistribution[c.category] || 0) + 1
        })

        // Role distribution
        const roleDistribution: Record<string, number> = {}
        cases.forEach(c => {
            roleDistribution[c.role] = (roleDistribution[c.role] || 0) + 1
        })

        // Procedure types
        const procedureTypes: Record<string, number> = {}
        cases.forEach(c => {
            procedureTypes[c.procedure_type] = (procedureTypes[c.procedure_type] || 0) + 1
        })

        // Monthly trend
        const monthlyTrend: Record<string, number> = {}
        cases.forEach(c => {
            const month = c.date.slice(0, 7) // YYYY-MM
            monthlyTrend[month] = (monthlyTrend[month] || 0) + 1
        })

        // Verification rate
        const verified = cases.filter(c => c.verification_status !== 'self').length
        const verificationRate = Math.round((verified / cases.length) * 100)

        // Gap analysis
        const allCategories = ['General Surgery', 'Orthopedics', 'Internal Medicine', 'Pediatrics', 'Obstetrics & Gynecology', 'Emergency Medicine', 'Cardiology', 'Neurology']
        const gaps: string[] = []
        const recommendations: string[] = []

        // Find underrepresented categories
        const avgPerCategory = cases.length / Object.keys(categoryDistribution).length
        allCategories.forEach(cat => {
            const count = categoryDistribution[cat] || 0
            if (count === 0) {
                gaps.push(`No cases logged in ${cat}`)
            } else if (count < avgPerCategory * 0.5) {
                gaps.push(`Low case volume in ${cat} (${count} cases)`)
            }
        })

        // Role distribution gaps
        const primaryCount = roleDistribution['primary'] || 0
        const totalCount = cases.length
        const primaryRate = (primaryCount / totalCount) * 100

        if (primaryRate < 30) {
            gaps.push(`Low primary operator rate (${primaryRate.toFixed(0)}%)`)
            recommendations.push('Focus on taking primary operator roles to demonstrate competency progression.')
        }

        if (primaryRate > 80) {
            recommendations.push('Excellent primary operator rate! Consider assisting in complex cases from other specialties for breadth.')
        }

        // Verification gaps
        if (verificationRate < 50) {
            gaps.push(`Low verification rate (${verificationRate}%)`)
            recommendations.push('Request consultant verification for your cases to strengthen your portfolio.')
        }

        // General recommendations based on volume
        if (cases.length < 10) {
            recommendations.push('Log more cases regularly to build a comprehensive portfolio. Aim for at least 3-5 cases per week.')
        }

        if (Object.keys(categoryDistribution).length < 3) {
            recommendations.push('Diversify your case categories. A well-rounded logbook shows breadth of training.')
        }

        // Try AI-powered recommendations if OpenAI key is available
        const openaiApiKey = process.env.OPENAI_API_KEY
        let aiInsight = ''

        if (openaiApiKey && openaiApiKey.startsWith('sk-')) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openaiApiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a medical education advisor. Analyze case logging patterns and provide actionable training recommendations.'
                            },
                            {
                                role: 'user',
                                content: `Analyze this resident's case log pattern and provide 2-3 specific recommendations:
- Total cases: ${cases.length}
- Categories: ${JSON.stringify(categoryDistribution)}
- Roles: ${JSON.stringify(roleDistribution)}
- Verification rate: ${verificationRate}%
- Primary operator rate: ${primaryRate.toFixed(0)}%

Be specific with recommendations for training improvement.`
                            }
                        ],
                        max_tokens: 300,
                    }),
                })

                if (response.ok) {
                    const data = await response.json()
                    aiInsight = data.choices[0]?.message?.content || ''
                }
            } catch (err) {
                console.error('OpenAI gap analysis error:', err)
            }
        }

        return NextResponse.json({
            totalCases: cases.length,
            categoryDistribution,
            roleDistribution,
            procedureTypes,
            monthlyTrend,
            verificationRate,
            gaps,
            recommendations,
            aiInsight,
        })
    } catch (error) {
        console.error('Gap analysis error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
