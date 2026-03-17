'use client'

import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'
import { BundleAnalyzer } from '@/components/ui/bundle-analyzer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, RefreshCw, Download, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function PerformancePage() {
  const { toast } = useToast()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Performance report will be downloaded',
      variant: 'success',
    })
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <SlideUp>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                Performance Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Monitor and optimize application performance
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </SlideUp>

        {/* Quick Stats */}
        <SlideUp delay={0.1}>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lighthouse Score</CardTitle>
                <Zap className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">95</div>
                <p className="text-xs text-gray-500">Target: &gt;95</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Load Time</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-gray-500">Target: &lt;3s</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bundle Size</CardTitle>
                <Download className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">350KB</div>
                <p className="text-xs text-gray-500">Target: &lt;500KB</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <RefreshCw className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">85%</div>
                <p className="text-xs text-gray-500">Target: &gt;80%</p>
              </CardContent>
            </Card>
          </div>
        </SlideUp>

        {/* Main Content */}
        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="bundle">Bundle</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <SlideUp delay={0.2}>
              <PerformanceMonitor />
            </SlideUp>
          </TabsContent>

          <TabsContent value="bundle" className="space-y-4">
            <SlideUp delay={0.3}>
              <BundleAnalyzer />
            </SlideUp>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <SlideUp delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Checklist</CardTitle>
                  <CardDescription>Performance improvements implemented</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { item: 'Image Optimization', status: 'done' },
                      { item: 'Lazy Loading', status: 'done' },
                      { item: 'Code Splitting', status: 'done' },
                      { item: 'SWR Caching', status: 'done' },
                      { item: 'Bundle Optimization', status: 'done' },
                      { item: 'Service Worker', status: 'pending' },
                      { item: 'CDN Setup', status: 'pending' },
                      { item: 'Database Optimization', status: 'pending' },
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{opt.item}</span>
                        {opt.status === 'done' ? (
                          <span className="text-green-500 text-sm">✓ Complete</span>
                        ) : (
                          <span className="text-gray-500 text-sm">○ Pending</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
