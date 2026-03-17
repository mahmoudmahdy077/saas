'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Clock, Database } from 'lucide-react'

interface PerformanceMetrics {
  loadTime: number
  fcp: number
  lcp: number
  fid: number
  cls: number
  cacheHitRate: number
  apiCalls: number
  bundleSize: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    // Collect performance metrics
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      const newMetrics = {
        loadTime: navigation ? navigation.loadEventEnd - navigation.startTime : 0,
        fcp: 0,
        lcp: 0,
        fid: 0,
        cls: 0,
        cacheHitRate: 85, // Mock value
        apiCalls: 0,
        bundleSize: 350, // KB
      }

      // Get Core Web Vitals if available
      if (typeof PerformanceObserver !== 'undefined') {
        // FCP
        try {
          const fcp = new PerformanceObserver((entry: any) => {
            const entries = entry.getEntries()
            if (entries.length > 0) {
              newMetrics.fcp = entries[0].startTime
            }
          })
          fcp.observe({ type: 'paint', buffered: true })
        } catch (e) {
          console.warn('FCP observer failed:', e)
        }

        // LCP
        try {
          const lcp = new PerformanceObserver((entry: any) => {
            const entries = entry.getEntries()
            if (entries.length > 0) {
              newMetrics.lcp = entries[entries.length - 1].startTime
            }
          })
          lcp.observe({ type: 'largest-contentful-paint', buffered: true })
        } catch (e) {
          console.warn('LCP observer failed:', e)
        }
      }

      setMetrics(newMetrics)
    }

    collectMetrics()
  }, [])

  if (!metrics) {
    return <div>Loading performance metrics...</div>
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'warning'
    return 'destructive'
  }

  // Calculate overall performance score
  const overallScore = Math.round(
    (Math.max(0, 100 - metrics.loadTime / 30) +
     Math.max(0, 100 - metrics.fcp / 30) +
     Math.max(0, 100 - metrics.lcp / 50) +
     metrics.cacheHitRate) / 4
  )

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <p className="text-sm text-gray-500">out of 100</p>
            </div>
            <Badge variant={getScoreBadge(overallScore)} className="text-lg px-4 py-2">
              {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              First Contentful Paint
            </CardTitle>
            <CardDescription>Time to first content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.fcp.toFixed(0)}ms</div>
            <p className="text-xs text-gray-500">Target: &lt;1800ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Largest Contentful Paint
            </CardTitle>
            <CardDescription>Time to largest content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lcp.toFixed(0)}ms</div>
            <p className="text-xs text-gray-500">Target: &lt;2500ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Cache Hit Rate
            </CardTitle>
            <CardDescription>Cached requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cacheHitRate}%</div>
            <p className="text-xs text-gray-500">Target: &gt;80%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Page Load Time</span>
              <Badge variant={metrics.loadTime < 3000 ? 'success' : 'warning'}>
                {metrics.loadTime.toFixed(0)}ms
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">First Input Delay</span>
              <Badge variant="default">{metrics.fid.toFixed(0)}ms</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Cumulative Layout Shift</span>
              <Badge variant="default">{metrics.cls.toFixed(3)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bundle Size</span>
              <Badge variant={metrics.bundleSize < 500 ? 'success' : 'warning'}>
                {metrics.bundleSize}KB
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Calls (cached)</span>
              <Badge variant="default">{metrics.apiCalls}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



export default PerformanceMonitor
