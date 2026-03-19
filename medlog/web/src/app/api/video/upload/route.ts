import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // In production: Upload to S3/Cloudinary
    // For now: Return file info
    return NextResponse.json({
      success: true,
      video: {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
