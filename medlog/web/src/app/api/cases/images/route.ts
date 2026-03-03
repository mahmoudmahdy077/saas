import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

async function getUser(request: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  })

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) return null

  const { data: { user } } = await supabaseAdmin.auth.getUser(accessToken)
  return user
}

function validateColumnName(columnName: string): boolean {
  const allowedColumns = ['images', 'preop_images', 'postop_images']
  return allowedColumns.includes(columnName)
}

function sanitizeFileName(fileName: string): string {
  const baseName = path.basename(fileName, path.extname(fileName))
  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')
  return sanitized.substring(0, 50)
}

function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export async function POST(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const caseId = formData.get('caseId') as string
  const imageType = formData.get('imageType') as string || 'images'

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!caseId || !validateUUID(caseId)) {
    return NextResponse.json({ error: 'Invalid Case ID' }, { status: 400 })
  }

  if (!['images', 'preop', 'postop'].includes(imageType)) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
  }

  // Verify user owns the case
  const caseResult = await pool.query(
    'SELECT user_id, verification_status FROM cases WHERE id = $1',
    [caseId]
  )

  if (caseResult.rows.length === 0) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  if (caseResult.rows[0].user_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Validate file type - strict allowlist
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 })
  }

  const fileExt = path.extname(file.name).toLowerCase()
  if (!allowedExtensions.includes(fileExt)) {
    return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 })
  }

  try {
    // Generate unique filename with sanitization
    const sanitizedName = sanitizeFileName(file.name)
    const ext = fileExt
    const fileName = `${uuidv4()}_${sanitizedName}${ext}`
    const folder = imageType === 'preop' ? 'preop' : imageType === 'postop' ? 'postop' : 'general'
    const storagePath = `${user.id}/${caseId}/${folder}/${fileName}`

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to MinIO directly
    const minioEndpoint = process.env.MINIO_ENDPOINT || 'storage'
    const minioPort = parseInt(process.env.MINIO_PORT || '9000')
    const minioAccessKey = process.env.MINIO_USER || 'medlog'
    const minioSecretKey = process.env.MINIO_PASSWORD || 'medlog2024'

    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    
    const s3Client = new S3Client({
      endpoint: `http://${minioEndpoint}:${minioPort}`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: minioAccessKey,
        secretAccessKey: minioSecretKey,
      },
      region: 'us-east-1',
    })

    const bucketName = imageType === 'preop' ? 'case-preop' : imageType === 'postop' ? 'case-postop' : 'case-images'

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: storagePath,
        Body: buffer,
        ContentType: file.type,
      })
    )

    // Get public URL
    const publicUrl = `http://${minioEndpoint}:${minioPort}/${bucketName}/${storagePath}`

    // Sanitize original filename before storing
    const storedFileName = sanitizeFileName(file.name) + ext
    
    // Save to database
    const imageRecord = {
      id: uuidv4(),
      name: storedFileName,
      path: storagePath,
      url: publicUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }

    // Validate column name to prevent SQL injection
    const columnName = imageType === 'preop' ? 'preop_images' : imageType === 'postop' ? 'postop_images' : 'images'
    
    if (!validateColumnName(columnName)) {
      return NextResponse.json({ error: 'Invalid column' }, { status: 400 })
    }
    
    // Use parameterized query with validated column
    await pool.query(`
      UPDATE cases 
      SET ${columnName} = COALESCE(${columnName}, '[]'::jsonb) || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify([imageRecord]), caseId])

    return NextResponse.json({ 
      success: true, 
      image: imageRecord 
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const caseId = searchParams.get('caseId')
  const imageId = searchParams.get('imageId')
  const imageType = searchParams.get('imageType') || 'images'

  if (!caseId || !imageId) {
    return NextResponse.json({ error: 'Case ID and Image ID required' }, { status: 400 })
  }

  if (!validateUUID(caseId) || !validateUUID(imageId)) {
    return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
  }

  if (!['images', 'preop', 'postop'].includes(imageType)) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
  }

  // Validate column name to prevent SQL injection
  const columnName = imageType === 'preop' ? 'preop_images' : imageType === 'postop' ? 'postop_images' : 'images'
  
  if (!validateColumnName(columnName)) {
    return NextResponse.json({ error: 'Invalid column' }, { status: 400 })
  }

  try {
    // Get current images
    const result = await pool.query(
      `SELECT user_id, ${columnName} as images FROM cases WHERE id = $1`,
      [caseId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (result.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const images = result.rows[0].images || []
    const imageToDelete = images.find((img: any) => img.id === imageId)

    if (!imageToDelete) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from MinIO
    try {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
      
      const minioEndpoint = process.env.MINIO_ENDPOINT || 'storage'
      const minioPort = parseInt(process.env.MINIO_PORT || '9000')
      const minioAccessKey = process.env.MINIO_USER || 'medlog'
      const minioSecretKey = process.env.MINIO_PASSWORD || 'medlog2024'

      const s3Client = new S3Client({
        endpoint: `http://${minioEndpoint}:${minioPort}`,
        forcePathStyle: true,
        credentials: {
          accessKeyId: minioAccessKey,
          secretAccessKey: minioSecretKey,
        },
        region: 'us-east-1',
      })

      const bucketName = imageType === 'preop' ? 'case-preop' : imageType === 'postop' ? 'case-postop' : 'case-images'

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: imageToDelete.path,
        })
      )
    } catch (minioError) {
      console.error('MinIO delete error:', minioError)
    }

    // Update database
    const updatedImages = images.filter((img: any) => img.id !== imageId)
    
    await pool.query(`
      UPDATE cases 
      SET ${columnName} = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(updatedImages), caseId])

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
