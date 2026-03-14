'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Building2, 
  Users, 
  FileText, 
  Shield, 
  TrendingUp,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

/**
 * Enterprise Dashboard v2.0
 * Advanced analytics for healthcare institutions
 */

interface DashboardData {
  totalResidents: number
  activeThisMonth: number
  totalCases: number
  complianceRate: number
  caseTrend: Array<{ date: string; count: number }>
  specialtyDistribution: Array<{ name: string; value: number }>
  topPerformers: Array<{
    id: string
    name: string
    caseCount: number
    specialty: string
    growth: number
  }>
  atRiskResidents: Array<{
    id: string
    name: string
    deficit: number
    year: number
    complianceRate: number
  }>
  recentActivity: Array<{
    id: string
    user: string
    action: string
    timestamp: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function EnterpriseDashboardV2() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/institution/analytics')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/reports/export?type=${type}`, {
        method: 'POST',
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medlog-${type}-${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading enterprise dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Enterprise Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Institution-wide analytics and compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('cases')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Cases
          </Button>
          <Button onClick={() => exportReport('compliance')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Compliance
          </Button>
          <Button onClick={fetchDashboardData} variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalResidents}</div>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">
                {data.activeThisMonth} active this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCases.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-green-500">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceRate}%</div>
            <Progress value={data.complianceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              ACGME requirements met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Actions in last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Case Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Case Volume Trend</CardTitle>
                <CardDescription>Cases logged over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.caseTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#0088FE" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Specialty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Specialty Distribution</CardTitle>
                <CardDescription>Cases by specialty</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.specialtyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.specialtyDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Performers & At-Risk */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Top Performers
                </CardTitle>
                <CardDescription>Residents with most cases this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topPerformers.slice(0, 5).map((performer, index) => (
                    <div key={performer.id} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {performer.specialty} • {performer.caseCount} cases
                        </p>
                      </div>
                      <Badge variant="success">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{performer.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Needs Attention
                </CardTitle>
                <CardDescription>Residents at risk of non-compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.atRiskResidents.slice(0, 5).map((resident) => (
                    <div key={resident.id} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium">{resident.name}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={resident.complianceRate} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">
                            {resident.complianceRate}% complete
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep dive into institutional data</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.caseTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                ACGME Compliance
              </CardTitle>
              <CardDescription>Milestone requirements tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.atRiskResidents.map((resident) => (
                  <div key={resident.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{resident.name}</p>
                        <p className="text-sm text-muted-foreground">Year {resident.year}</p>
                      </div>
                      <Badge variant={resident.complianceRate < 50 ? 'destructive' : 'warning'}>
                        {resident.deficit} cases behind
                      </Badge>
                    </div>
                    <Progress value={resident.complianceRate} className="h-3" />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        Required: {Math.ceil(resident.deficit + (resident.complianceRate/100 * 100))} cases
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Completed: {Math.ceil(resident.complianceRate/100 * 100)} cases
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="residents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resident Directory</CardTitle>
              <CardDescription>Manage all residents and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Full resident management interface coming in next update...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
