'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CloudOff, CheckCircle } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    const checkOnline = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', checkOnline)
    window.addEventListener('offline', checkOnline)
    return () => {
      window.removeEventListener('online', checkOnline)
      window.removeEventListener('offline', checkOnline)
    }
  }, [])

  const handleSync = async () => {
    // Sync pending data
    setPendingSync(0)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <CloudOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <CardTitle className="text-2xl">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500">
            {isOnline ? 'Connection restored!' : 'No internet connection. You can still browse cached content.'}
          </p>
          
          {pendingSync > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">{pendingSync} items pending sync</p>
              <Button onClick={handleSync} className="mt-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Now
              </Button>
            </div>
          )}

          {isOnline && pendingSync === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-green-800">All data synced</p>
            </div>
          )}

          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
