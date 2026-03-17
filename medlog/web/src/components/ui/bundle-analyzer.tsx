'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BundleStats {
  totalSize: number
  chunks: Array<{
    name: string
    size: number
    color: string
  }>
}

export function BundleAnalyzer() {
  const [stats, setStats] = useState<BundleStats | null>(null)

  useEffect(() => {
    // In production, this would fetch actual bundle stats
    // For now, using mock data
    setStats({
      totalSize: 350000, // 350KB
      chunks: [
        { name: 'Main Bundle', size: 120000, color: '#0088FE' },
        { name: 'Pages', size: 80000, color: '#00C49F' },
        { name: 'Components', size: 60000, color: '#FFBB28' },
        { name: 'Vendor', size: 50000, color: '#FF8042' },
        { name: 'Other', size: 40000, color: '#8884D8' },
      ],
    })
  }, [])

  if (!stats) {
    return <div>Loading bundle analysis...</div>
  }

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(2)} MB`
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(2)} KB`
    return `${bytes} B`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bundle Analysis</CardTitle>
        <CardDescription>
          Total Size: {formatSize(stats.totalSize)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.chunks}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="size"
              >
                {stats.chunks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatSize(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-4">
            {stats.chunks.map((chunk) => (
              <div key={chunk.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{chunk.name}</span>
                  <span>{formatSize(chunk.size)}</span>
                </div>
                <Progress value={(chunk.size / stats.totalSize) * 100} />
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Bundle Size</span>
                <Badge variant={stats.totalSize < 500000 ? 'success' : 'warning'}>
                  {formatSize(stats.totalSize)}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Target: &lt;500KB | Current: {formatSize(stats.totalSize)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
