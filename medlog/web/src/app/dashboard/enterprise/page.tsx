'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Building2, 
  Users, 
  FileText, 
  Shield, 
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react'

/**
 * Enterprise Dashboard - Multi-institution analytics
 * For program directors and administrators
 */

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResidents: 0,
    activeThisMonth: 0,
    totalCases: 0,
    complianceRate: 0,
    topPerformers: [],
    atRiskResidents: [],
    caseDistribution: [],
    recentActivity: []
  })

  useEffect(() => {
    fetchEnterpriseStats()
  }, [])

  const fetchEnterpriseStats = async () => {
    try {
      const response = await fetch('/api/institution/analytics')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch enterprise stats:', error)
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
      a.download = `medlog-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">Institution-wide analytics and compliance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportReport('cases')}>
            <Download className="w-4 h-4 mr-2" />
            Export Cases
          </Button>
          <Button onClick={() => exportReport('compliance')}>
            <Download className="w-4 h-4 mr-2" />
            Compliance Report
          </Button>
          <Button onClick={fetchEnterpriseStats} variant="outline">
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
            <div className="text-2xl font-bold">{stats.totalResidents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeThisMonth} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              ACGME requirements met
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Actions in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Detailed Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Residents with most cases this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topPerformers?.map((performer: any, index: number) => (
                    <div key={performer.id} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">{performer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {performer.caseCount} cases • {performer.specialty}
                        </p>
                      </div>
                      <Badge className="ml-auto">
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
                <CardTitle>At-Risk Residents</CardTitle>
                <CardDescription>Need attention for compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.atRiskResidents?.map((resident: any) => (
                    <div key={resident.id} className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive text-destructive-foreground">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium">{resident.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {resident.deficit} cases behind • {resident.year} year
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="residents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resident Directory</CardTitle>
              <CardDescription>Manage all residents and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Resident management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ACGME Compliance</CardTitle>
              <CardDescription>Track milestone requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Compliance tracking interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>Deep dive into institutional data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Advanced analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
