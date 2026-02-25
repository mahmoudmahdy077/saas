import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function generateAISummary(caseData: {
  procedure_type: string
  category: string
  role: string
  diagnosis: string
  complications: string[]
  notes: string
}): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY

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
              content: 'You are a medical education advisor. Provide concise, helpful feedback on surgical/medical cases for resident training.'
            },
            {
              role: 'user',
              content: `Analyze this case and provide a brief educational summary:
- Procedure: ${caseData.procedure_type}
- Category: ${caseData.category}
- Role: ${caseData.role}
- Diagnosis: ${caseData.diagnosis || 'Not specified'}
- Complications: ${caseData.complications?.join(', ') || 'None'}
- Notes: ${caseData.notes || 'None'}

Provide a 2-3 sentence educational insight.`
            }
          ],
          max_tokens: 200,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices[0]?.message?.content || 'AI summary unavailable.'
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
    }
  }

  return `Educational Note: This ${caseData.procedure_type} case in ${caseData.category} provides good ${caseData.role === 'primary' ? 'primary operator' : caseData.role} experience. ${caseData.complications?.length ? 'Review the complications noted for future reference.' : 'Consider documenting outcomes and follow-up for comprehensive learning.'}`
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseId } = body

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID required' }, { status: 400 })
    }

    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const aiSummary = await generateAISummary({
      procedure_type: caseData.procedure_type,
      category: caseData.category,
      role: caseData.role,
      diagnosis: caseData.diagnosis,
      complications: caseData.complications,
      notes: caseData.notes,
    })

    await supabase
      .from('cases')
      .update({ ai_summary: aiSummary, updated_at: new Date().toISOString() })
      .eq('id', caseId)

    return NextResponse.json({ summary: aiSummary })
  } catch (error) {
    console.error('AI summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
