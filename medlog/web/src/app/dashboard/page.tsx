'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  TrendingUp,
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCard, AnimatedStatCard, AnimatedList, AnimatedProgressBar, AnimatedCounter } from '@/components/ui/animated-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { useCachedData, invalidateCases } from '@/lib/cache'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface DashboardData {
  totalCases: number
  thisMonth: number
  verified: number
  pending: number
  currentStreak: number
  longestStreak: number
  recentCases: Array<{
    id: string
    date: string
    procedure_type: string
    category: string
    verification_status: string
  }>
  milestones: Array<{
    id: string
    title: string
    progress: number
    target: number
    completed: boolean
  }>
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  
  // Use SWR caching for dashboard data
  const { data: cachedData, error, isLoading } = useCachedData<DashboardData>('/api/cases/stats')

  useEffect(() => {
    if (cachedData && !isLoading) {
      setData(cachedData)
      setLoading(false)
    }
  }, [cachedData, isLoading])

  useEffect(() => {
    // Initial fetch if SWR doesn't have data
    if (!cachedData && !isLoading) {
      fetchDashboardData()
    }
  }, [cachedData, isLoading])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/cases/stats')
      const stats = await response.json()
      
      const casesResponse = await fetch('/api/cases?limit=5')
      const cases = await casesResponse.json()

      const dashboardData = {
        totalCases: stats.totalCases || 0,
        thisMonth: stats.thisMonth || 0,
        verified: stats.verified || 0,
        pending: stats.pending || 0,
        currentStreak: 7,
        longestStreak: 21,
        recentCases: cases.cases || [],
        milestones: [
          { id: '1', title: '50 Cases', progress: 35, target: 50, completed: false },
          { id: '2', title: '100 Cases', progress: 35, target: 100, completed: false },
          { id: '3', title: '250 Cases', progress: 35, target: 250, completed: false },
        ]
      }
      
      setData(dashboardData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    await invalidateCases()
    await fetchDashboardData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return <div>Failed to load dashboard data</div>
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track your orthopedic surgery progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Log Case
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AnimatedStatCard
            title="Total Cases"
            value={data.totalCases}
            change={{ value: 20.1, isPositive: true }}
            icon={FileText}
            delay={0}
          />
          <AnimatedStatCard
            title="This Month"
            value={data.thisMonth}
            change={{ value: 15.3, isPositive: true }}
            icon={TrendingUp}
            delay={0.1}
          />
          <AnimatedStatCard
            title="Verified Cases"
            value={data.verified}
            change={{ value: 8.5, isPositive: true }}
            icon={CheckCircle2}
            delay={0.2}
          />
          <AnimatedStatCard
            title="Pending Review"
            value={data.pending}
            change={{ value: 5.2, isPositive: false }}
            icon={Clock}
            delay={0.3}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Recent Cases */}
              <AnimatedCard delay={0.4}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Recent Cases
                  </CardTitle>
                  <CardDescription>Your latest logged procedures</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatedList>
                    {data.recentCases.map((caseItem) => (
                      <motion.div
                        key={caseItem.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 border-b last:border-0"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{caseItem.procedure_type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(caseItem.date).toLocaleDateString()} • {caseItem.category}
                          </p>
                        </div>
                        <Badge
                          variant={
                            caseItem.verification_status === 'verified' ? 'success' :
                            caseItem.verification_status === 'pending' ? 'warning' : 'default'
                          }
                        >
                          {caseItem.verification_status}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatedList>
                  <Button variant="outline" className="w-full mt-4">
                    View All Cases
                  </Button>
                </CardContent>
              </AnimatedCard>

              {/* Streaks */}
              <AnimatedCard delay={0.5}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Streak Progress
                  </CardTitle>
                  <CardDescription>Keep logging cases daily</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        <AnimatedCounter value={data.currentStreak} suffix=" days" />
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Award className="w-12 h-12 text-blue-500" />
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {data.longestStreak} days
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>

                  <AnimatedProgressBar value={data.currentStreak} max={30} color="blue" />
                  <p className="text-xs text-gray-500 text-center">
                    {30 - data.currentStreak} days until next milestone!
                  </p>
                </CardContent>
              </AnimatedCard>
            </div>

            {/* Milestones */}
            <AnimatedCard delay={0.6}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Milestones
                </CardTitle>
                <CardDescription>Track your progress towards key goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {milestone.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-blue-500" />
                          )}
                          <span className="font-medium">{milestone.title}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {milestone.progress} / {milestone.target}
                        </span>
                      </div>
                      <AnimatedProgressBar
                        value={milestone.progress}
                        max={milestone.target}
                        showLabel={false}
                        color={milestone.completed ? 'green' : 'blue'}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </TabsContent>

          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>All Cases</CardTitle>
                    <CardDescription>Manage and view all your logged procedures</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search cases..."
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Case list coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Milestones & Achievements</CardTitle>
                <CardDescription>Track your orthopedic surgery journey</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Detailed milestone tracking coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Streak History</CardTitle>
                <CardDescription>Your logging consistency over time</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Streak analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  )
}
