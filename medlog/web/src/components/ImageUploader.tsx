'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image, Loader2 } from 'lucide-react'

interface ImageRecord {
  id: string
  name: string
  path: string
  url: string
  size: number
  type: string
  uploadedAt: string
}

interface ImageUploaderProps {
  caseId: string
  imageType: 'images' | 'preop' | 'postop'
  images: ImageRecord[]
  onUploadComplete: (images: ImageRecord[]) => void
}

export default function ImageUploader({ caseId, imageType, images, onUploadComplete }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('caseId', caseId)
        formData.append('imageType', imageType)

        const response = await fetch('/api/cases/images', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        onUploadComplete([...images, data.image])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    try {
      const params = new URLSearchParams({
        caseId,
        imageId,
        imageType,
      })

      const response = await fetch(`/api/cases/images?${params}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      onUploadComplete(images.filter(img => img.id !== imageId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const label = imageType === 'preop' ? 'Preoperative' : imageType === 'postop' ? 'Postoperative' : 'Images'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label} {images.length > 0 && `(${images.length})`}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-600 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Add {label}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to upload {label.toLowerCase()}</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF (max 10MB)</p>
        </div>
      )}
    </div>
  )
}
