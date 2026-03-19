import { NextRequest, NextResponse } from 'next/server'

const TEMPLATES = {
  trauma: { title: 'Trauma Case', fields: ['mechanism', 'injury_type', 'treatment'] },
  arthroplasty: { title: 'Arthroplasty', fields: ['implant_type', 'approach', 'complications'] },
  sports: { title: 'Sports Medicine', fields: ['injury_mechanism', 'exam_findings', 'repair_type'] },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'trauma'
  
  return NextResponse.json({
    template: TEMPLATES[category as keyof typeof TEMPLATES] || TEMPLATES.trauma,
    all: Object.keys(TEMPLATES),
  })
}

export async function POST(request: NextRequest) {
  const { category, customFields } = await request.json()
  return NextResponse.json({ success: true, template: { category, customFields } })
}
