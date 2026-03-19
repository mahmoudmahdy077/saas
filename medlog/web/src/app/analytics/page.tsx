'use client'

import { useState, useEffect } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Comprehensive insights into your surgical practice</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <SlideUp>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Total Cases</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{stats?.totalCases || 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">This Month</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{stats?.thisMonth || 0}</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{stats?.successRate || 98}%</div></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Avg Recovery</CardTitle></CardHeader>
                  <CardContent><div className="text-3xl font-bold">{stats?.avgRecovery || 6} weeks</div></CardContent>
                </Card>
              </div>
            </SlideUp>

            <SlideUp delay={0.1}>
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <Card>
                  <CardHeader><CardTitle>Case Volume Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats?.trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="cases" stroke="#0088FE" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Category Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={stats?.categories || []} cx="50%" cy="50%" labelLine={false} label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                          {stats?.categories?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </SlideUp>
          </TabsContent>

          <TabsContent value="trends">
            <SlideUp>
              <Card>
                <CardHeader><CardTitle>Monthly Case Trends</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats?.trends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cases" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          <TabsContent value="categories">
            <SlideUp>
              <Card>
                <CardHeader><CardTitle>Specialty Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie data={stats?.categories || []} cx="50%" cy="50%" outerRadius={150} fill="#8884d8" dataKey="value" label>
                        {stats?.categories?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          <TabsContent value="outcomes">
            <SlideUp>
              <Card>
                <CardHeader><CardTitle>Patient Outcomes</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-green-500">{stats?.successRate || 98}%</div>
                          <p className="text-sm text-gray-500 mt-2">Success Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-500">{stats?.avgRecovery || 6}</div>
                          <p className="text-sm text-gray-500 mt-2">Weeks to Recovery</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-purple-500">{stats?.patientSatisfaction || 4.8}</div>
                          <p className="text-sm text-gray-500 mt-2">Patient Satisfaction</p>
                        </div>
                      </CardContent>
                    </Card>
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
