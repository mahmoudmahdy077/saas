import { NextResponse } from 'next/server'

export async function GET() {
  // Mock analytics data (replace with real DB queries)
  return NextResponse.json({
    totalCases: 156,
    thisMonth: 23,
    successRate: 98,
    avgRecovery: 6,
    patientSatisfaction: 4.8,
    trends: [
      { month: 'Jan', cases: 12 },
      { month: 'Feb', cases: 15 },
      { month: 'Mar', cases: 23 },
      { month: 'Apr', cases: 18 },
      { month: 'May', cases: 25 },
      { month: 'Jun', cases: 20 },
    ],
    categories: [
      { name: 'Trauma', value: 45 },
      { name: 'Arthroplasty', value: 35 },
      { name: 'Sports', value: 25 },
      { name: 'Shoulder', value: 20 },
      { name: 'Hand', value: 15 },
      { name: 'Spine', value: 16 },
    ],
  })
}
