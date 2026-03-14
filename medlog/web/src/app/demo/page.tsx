'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  TrendingUp, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock,
  Calendar,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react'

import { PageTransition, SlideUp, FadeIn, StaggerContainer, ScaleIn } from '@/components/ui/page-transition'
import { AnimatedCard, AnimatedStatCard, AnimatedList, AnimatedProgressBar, AnimatedCounter } from '@/components/ui/animated-card'
import { DataTable, createColumn, BadgeCell, DateCell, ActionCell } from '@/components/ui/data-table'
import { CalendarView } from '@/components/ui/calendar-view'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock Data
const mockCases = [
  {
    id: '1',
    procedure_type: 'Total Knee Arthroplasty',
    date: '2026-03-14',
    category: 'Arthroplasty',
    role: 'Primary Surgeon',
    verification_status: 'verified',
  },
  {
    id: '2',
    procedure_type: 'ACL Reconstruction',
    date: '2026-03-13',
    category: 'Sports Medicine',
    role: 'Assistant',
    verification_status: 'pending',
  },
  {
    id: '3',
    procedure_type: 'Rotator Cuff Repair',
    date: '2026-03-12',
    category: 'Shoulder',
    role: 'Primary Surgeon',
    verification_status: 'verified',
  },
  {
    id: '4',
    procedure_type: 'Hip Fracture ORIF',
    date: '2026-03-11',
    category: 'Trauma',
    role: 'Primary Surgeon',
    verification_status: 'self',
  },
  {
    id: '5',
    procedure_type: 'Carpal Tunnel Release',
    date: '2026-03-10',
    category: 'Hand',
    role: 'Primary Surgeon',
    verification_status: 'verified',
  },
]

const mockEvents = [
  {
    id: '1',
    title: '50 Case Milestone',
    date: new Date(),
    type: 'milestone' as const,
    description: 'You\'ve logged 50 cases!',
  },
  {
    id: '2',
    title: 'Case Review Due',
    date: new Date(Date.now() + 86400000),
    type: 'deadline' as const,
    description: 'Review 3 pending cases',
  },
  {
    id: '3',
    title: 'Grand Rounds',
    date: new Date(Date.now() + 172800000),
    type: 'meeting' as const,
    description: 'Present interesting case',
  },
  {
    id: '4',
    title: 'Board Exam',
    date: new Date(Date.now() + 604800000),
    type: 'deadline' as const,
    description: 'Orthopedic Board Certification',
  },
]

export default function DemoPage() {
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const columns = createMockColumns()

  function createMockColumns() {
    return [
      createColumn<typeof mockCases[0], string>('procedure_type', 'Procedure', {
        width: 250,
      }),
      createColumn<typeof mockCases[0], string>('date', 'Date', {
        cell: (row) => <DateCell date={row.date} />,
        width: 120,
      }),
      createColumn<typeof mockCases[0], string>('category', 'Category', {
        width: 150,
      }),
      createColumn<typeof mockCases[0], string>('role', 'Role', {
        width: 150,
      }),
      createColumn<typeof mockCases[0], string>('verification_status', 'Status', {
        cell: (row) => (
          <BadgeCell
            value={row.verification_status}
            variant={
              row.verification_status === 'verified' ? 'success' :
              row.verification_status === 'pending' ? 'warning' : 'default'
            }
          />
        ),
        width: 120,
      }),
    ]
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <SlideUp>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                UI Component Demo
              </h1>
              <p className="text-gray-500 mt-2">
                Testing all new enterprise UI components
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setLoading(!loading)} variant="outline">
                Toggle Loading
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Component
              </Button>
            </div>
          </div>
        </SlideUp>

        {/* Animated Stat Cards */}
        <SlideUp delay={0.1}>
          <h2 className="text-2xl font-bold mb-4">1. Animated Stat Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-[60px] mb-2" />
                    <Skeleton className="h-3 w-[120px]" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <AnimatedStatCard
                  title="Total Cases"
                  value={156}
                  change={{ value: 20.1, isPositive: true }}
                  icon={FileText}
                  delay={0}
                />
                <AnimatedStatCard
                  title="This Month"
                  value={23}
                  change={{ value: 15.3, isPositive: true }}
                  icon={TrendingUp}
                  delay={0.1}
                />
                <AnimatedStatCard
                  title="Verified"
                  value={142}
                  change={{ value: 8.5, isPositive: true }}
                  icon={CheckCircle2}
                  delay={0.2}
                />
                <AnimatedStatCard
                  title="Pending"
                  value={14}
                  change={{ value: 5.2, isPositive: false }}
                  icon={Clock}
                  delay={0.3}
                />
              </>
            )}
          </div>
        </SlideUp>

        {/* Data Table */}
        <SlideUp delay={0.2}>
          <h2 className="text-2xl font-bold mb-4">2. Animated Data Table</h2>
          <AnimatedCard>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Cases</CardTitle>
                  <CardDescription>
                    Sorted, filtered, and animated table
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={mockCases.filter(c => 
                    c.procedure_type.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  searchKey="procedure_type"
                  pageSize={5}
                  onRowClick={(row) => console.log('Clicked:', row)}
                />
              )}
            </CardContent>
          </AnimatedCard>
        </SlideUp>

        {/* Calendar */}
        <SlideUp delay={0.3}>
          <h2 className="text-2xl font-bold mb-4">3. Calendar with Events</h2>
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-[200px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <CalendarView
              events={mockEvents}
              onDateClick={(date) => console.log('Date clicked:', date)}
              onEventClick={(event) => console.log('Event clicked:', event)}
            />
          )}
        </SlideUp>

        {/* Page Transitions Demo */}
        <SlideUp delay={0.4}>
          <h2 className="text-2xl font-bold mb-4">4. Page Transitions</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <ScaleIn delay={0.1}>
              <AnimatedCard className="p-6 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center"
                >
                  <Award className="w-6 h-6 text-blue-500" />
                </motion.div>
                <h3 className="font-bold mb-2">Scale In</h3>
                <p className="text-sm text-gray-500">Zoom-in animation</p>
              </AnimatedCard>
            </ScaleIn>
            <FadeIn delay={0.2}>
              <AnimatedCard className="p-6 text-center">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </motion.div>
                <h3 className="font-bold mb-2">Fade In</h3>
                <p className="text-sm text-gray-500">Simple fade animation</p>
              </AnimatedCard>
            </FadeIn>
            <SlideUp delay={0.3}>
              <AnimatedCard className="p-6 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center"
                >
                  <Users className="w-6 h-6 text-purple-500" />
                </motion.div>
                <h3 className="font-bold mb-2">Slide Up</h3>
                <p className="text-sm text-gray-500">Slide from bottom</p>
              </AnimatedCard>
            </SlideUp>
          </div>
        </SlideUp>

        {/* Staggered List */}
        <SlideUp delay={0.5}>
          <h2 className="text-2xl font-bold mb-4">5. Staggered Animations</h2>
          <StaggerContainer staggerDelay={0.1}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))
            ) : (
              <>
                <AnimatedCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="font-bold text-blue-500">1</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">First Item</p>
                      <p className="text-sm text-gray-500">Stagger delay: 0.1s</p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                </AnimatedCard>
                <AnimatedCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <span className="font-bold text-green-500">2</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Second Item</p>
                      <p className="text-sm text-gray-500">Stagger delay: 0.2s</p>
                    </div>
                    <Badge variant="default">Pending</Badge>
                  </div>
                </AnimatedCard>
                <AnimatedCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="font-bold text-purple-500">3</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Third Item</p>
                      <p className="text-sm text-gray-500">Stagger delay: 0.3s</p>
                    </div>
                    <Badge variant="warning">Review</Badge>
                  </div>
                </AnimatedCard>
                <AnimatedCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <span className="font-bold text-orange-500">4</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Fourth Item</p>
                      <p className="text-sm text-gray-500">Stagger delay: 0.4s</p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </AnimatedCard>
              </>
            )}
          </StaggerContainer>
        </SlideUp>

        {/* Progress Bars */}
        <SlideUp delay={0.6}>
          <h2 className="text-2xl font-bold mb-4">6. Animated Progress Bars</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatedCard className="p-6">
              <h3 className="font-bold mb-4">Milestone Progress</h3>
              <div className="space-y-4">
                <AnimatedProgressBar value={35} max={50} showLabel color="blue" />
                <AnimatedProgressBar value={35} max={100} showLabel color="green" />
                <AnimatedProgressBar value={35} max={250} showLabel color="purple" />
              </div>
            </AnimatedCard>
            <AnimatedCard className="p-6">
              <h3 className="font-bold mb-4">Animated Counter</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Cases:</span>
                  <span className="text-2xl font-bold">
                    <AnimatedCounter value={156} prefix="" suffix="" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month:</span>
                  <span className="text-2xl font-bold text-green-500">
                    <AnimatedCounter value={23} prefix="+" />
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Streak:</span>
                  <span className="text-2xl font-bold text-blue-500">
                    <AnimatedCounter value={7} suffix=" days" />
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </SlideUp>

        {/* Tabs Demo */}
        <SlideUp delay={0.7}>
          <h2 className="text-2xl font-bold mb-4">7. Tabbed Interface</h2>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <AnimatedCard className="p-6">
                <h3 className="font-bold mb-2">Overview Content</h3>
                <p className="text-gray-500">
                  This is the overview tab content with smooth transitions.
                </p>
              </AnimatedCard>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <AnimatedCard className="p-6">
                <h3 className="font-bold mb-2">Analytics Content</h3>
                <p className="text-gray-500">
                  Analytics data would be displayed here with charts and graphs.
                </p>
              </AnimatedCard>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <AnimatedCard className="p-6">
                <h3 className="font-bold mb-2">Settings Content</h3>
                <p className="text-gray-500">
                  Settings and configuration options would go here.
                </p>
              </AnimatedCard>
            </TabsContent>
          </Tabs>
        </SlideUp>

        {/* Footer */}
        <FadeIn delay={0.8}>
          <div className="text-center py-8 border-t">
            <p className="text-gray-500">
              All components tested and working! ✨
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Built with Framer Motion + Tailwind CSS + shadcn/ui
            </p>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  )
}
