'use client'

import { useState } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, Play, Trash2 } from 'lucide-react'

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    // Upload logic here
    setVideos([...videos, { id: Date.now(), name: file.name, url: URL.createObjectURL(file) }])
    setUploading(false)
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Surgical Videos</h1>
            <p className="text-gray-500 mt-1">Upload and manage surgical procedure videos</p>
          </div>
          <div className="flex gap-2">
            <Button disabled={uploading} onClick={() => document.getElementById('video-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
            <Input id="video-upload" type="file" accept="video/*" onChange={handleUpload} className="hidden" />
          </div>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardContent className="p-4">
                  <video src={video.url} controls className="w-full h-40 object-cover rounded mb-4" />
                  <div className="flex justify-between items-center">
                    <p className="font-medium truncate">{video.name}</p>
                    <Button variant="ghost" size="icon" onClick={() => setVideos(videos.filter(v => v.id !== video.id))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>

        {videos.length === 0 && (
          <SlideUp delay={0.1}>
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No videos uploaded yet</p>
                <p className="text-sm text-gray-400 mt-2">Upload surgical videos to build your video library</p>
              </CardContent>
            </Card>
          </SlideUp>
        )}
      </div>
    </PageTransition>
  )
}
