import { NextRequest, NextResponse } from 'next/server'

const CPT_CODES = {
  'knee': '29881',
  'shoulder': '29822',
  'hip': '27130',
  'ankle': '27870',
  'elbow': '24341',
  'wrist': '25607',
  'hand': '25100',
  'fracture': '25600',
  'repair': '29800',
  'replacement': '27130',
}

export async function POST(request: NextRequest) {
  try {
    const { procedure, notes } = await request.json()
    const lower = `${procedure} ${notes}`.toLowerCase()

    // Auto-detect CPT code
    let detectedCode = 'unlisted'
    for (const [keyword, code] of Object.entries(CPT_CODES)) {
      if (lower.includes(keyword)) {
        detectedCode = code
        break
      }
    }

    return NextResponse.json({
      cptCode: detectedCode,
      confidence: 0.85,
      alternatives: Object.values(CPT_CODES).slice(0, 3),
    })
  } catch {
    return NextResponse.json({ error: 'Coding failed' }, { status: 500 })
  }
}
