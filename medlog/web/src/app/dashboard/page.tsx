'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
  Brain,
  Flame,
  Snowflake,
  Trophy,
  Users,
  Building2,
  Shield,
  Award,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Settings,
  FileDown
} from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalCases: number
  thisMonth: number
  verified: number
  pending: number
}

interface ResidentStats {
  totalCases: number
  thisMonth: number
  verified: number
  pending: number
  currentStreak: number
  longestStreak: number
  streakFreezeAvailable: boolean
  streakAtRisk: boolean
}

interface ConsultantStats {
  pendingVerifications: number
  verifiedToday: number
  totalVerified: number
}

interface PDStats {
  totalResidents: number
  activeResidents: number
  pendingVerifications: number
  averageCasesPerResident: number
}

interface InstitutionStats {
  totalUsers: number
  totalCases: number
  activeSpecialties: number
  pendingVerifications: number
}

interface RecentCase {
  id: string
  procedure_type: string
  category: string
  date: string
  verification_status: string
  user_name?: string
}

interface User {
  full_name: string
  role: string
  email?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [residentStats, setResidentStats] = useState<ResidentStats | null>(null)
  const [consultantStats, setConsultantStats] = useState<ConsultantStats | null>(null)
  const [pdStats, setPDStats] = useState<PDStats | null>(null)
  const [institutionStats, setInstitutionStats] = useState<InstitutionStats | null>(null)
  const [recentCases, setRecentCases] = useState<RecentCase[]>([])
  const [casesToVerify, setCasesToVerify] = useState<RecentCase[]>([])
  const [freezing, setFreezing] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' })
        if (!response.ok) {
          window.location.href = '/login'
          return
        }
        const data = await response.json()
        const userProfile = data.profile ? { 
          full_name: data.profile.full_name || data.user?.email?.split('@')[0] || 'User', 
          role: data.profile.role || 'resident',
          email: data.user?.email
        } : { full_name: data.user?.email?.split('@')[0] || 'User', role: 'resident', email: data.user?.email }
        setUser(userProfile)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        window.location.href = '/login'
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        if (user.role === 'resident') {
          const [statsRes, casesRes, streakRes] = await Promise.all([
            fetch('/api/cases/stats', { credentials: 'include' }),
            fetch('/api/cases?limit=5', { credentials: 'include' }),
            fetch('/api/streaks', { credentials: 'include' }),
          ])
          if (statsRes.ok) {
            const statsData = await statsRes.json()
            setResidentStats({ ...statsData, currentStreak: 0, longestStreak: 0, streakFreezeAvailable: true, streakAtRisk: false })
          }
          if (casesRes.ok) {
            const casesData = await casesRes.json()
            setRecentCases(casesData.cases || [])
          }
          if (streakRes.ok) {
            const streakData = await streakRes.json()
            setResidentStats(prev => prev ? { ...prev, ...streakData } : null)
          }
        } else if (user.role === 'consultant') {
          const res = await fetch('/api/institution/residents?action=stats', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setConsultantStats({
              pendingVerifications: data.pendingVerifications || 0,
              verifiedToday: data.verifiedToday || 0,
              totalVerified: data.totalVerified || 0
            })
          }
          const casesRes = await fetch('/api/cases?status=self&limit=10', { credentials: 'include' })
          if (casesRes.ok) setCasesToVerify((await casesRes.json()).cases || [])
        } else if (user.role === 'program_director') {
          const res = await fetch('/api/institution/stats', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setPDStats({
              totalResidents: data.totalResidents || 0,
              activeResidents: data.activeResidents || 0,
              pendingVerifications: data.pendingVerifications || 0,
              averageCasesPerResident: data.averageCasesPerResident || 0
            })
          }
        } else if (user.role === 'institution_admin' || user.role === 'super_admin') {
          const res = await fetch('/api/institution/stats', { credentials: 'include' })
          if (res.ok) {
            const data = await res.json()
            setInstitutionStats({
              totalUsers: data.totalUsers || 0,
              totalCases: data.totalCases || 0,
              activeSpecialties: data.activeSpecialties || 0,
              pendingVerifications: data.pendingVerifications || 0
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const useStreakFreeze = async () => {
    setFreezing(true)
    try {
      const res = await fetch('/api/streaks/freeze', { method: 'POST', credentials: 'include' })
      if (res.ok && residentStats) {
        setResidentStats(prev => prev ? { ...prev, streakAtRisk: false, streakFreezeAvailable: false } : null)
      }
    } catch (error) {
      console.error('Failed to use streak freeze:', error)
    } finally {
      setFreezing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'self': return 'bg-gray-100 text-gray-700'
      case 'consultant_verified': return 'bg-blue-100 text-blue-700'
      case 'pd_approved': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'self': return 'Pending'
      case 'consultant_verified': return 'Verified'
      case 'pd_approved': return 'Approved'
      default: return status
    }
  }

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'consultant': return 'Consultant Dashboard'
      case 'program_director': return 'Program Director Dashboard'
      case 'institution_admin': return 'Institution Admin Dashboard'
      case 'super_admin': return 'Super Admin Dashboard'
      default: return 'Resident Dashboard'
    }
  }

  const getRoleDescription = () => {
    switch (user?.role) {
      case 'consultant': return 'Verify resident cases and track verifications'
      case 'program_director': return 'Monitor resident progress and program analytics'
      case 'institution_admin': return 'Manage institution settings and users'
      case 'super_admin': return 'System administration and monitoring'
      default: return 'Track your case logging progress'
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getRoleTitle()}</h1>
          <p className="text-gray-600">{getRoleDescription()}</p>
        </div>
        {user.role === 'resident' && (
          <Link href="/cases/new" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-600 transition-all">
            <Plus className="h-5 w-5" /> Add Case
          </Link>
        )}
      </div>

      {/* RESIDENT DASHBOARD */}
      {user.role === 'resident' && residentStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard name="Total Cases" value={residentStats.totalCases} icon={FileText} color="bg-blue-500" />
            <StatCard name="This Month" value={residentStats.thisMonth} icon={TrendingUp} color="bg-green-500" />
            <StatCard name="Verified" value={residentStats.verified} icon={CheckCircle} color="bg-accent-500" />
            <StatCard name="Pending" value={residentStats.pending} icon={Clock} color="bg-yellow-500" />
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <Flame className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Current Streak</p>
                    <p className="text-3xl font-bold text-orange-900">{residentStats.currentStreak}🔥</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-orange-200" />
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div><p className="text-xs text-orange-600">Longest</p><p className="text-lg font-bold text-orange-900">{residentStats.longestStreak} days</p></div>
                </div>
                <div className="h-12 w-px bg-orange-200" />
                <div className="flex items-center gap-2">
                  <Snowflake className={`h-5 w-5 ${residentStats.streakFreezeAvailable ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${residentStats.streakFreezeAvailable ? 'text-blue-700' : 'text-gray-500'}`}>
                    Freeze {residentStats.streakFreezeAvailable ? 'Available' : 'Used'}
                  </span>
                </div>
              </div>
              {residentStats.streakAtRisk && residentStats.streakFreezeAvailable && (
                <button onClick={useStreakFreeze} disabled={freezing} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
                  {freezing ? 'Using...' : 'Use Freeze'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction href="/cases/new" icon={Plus} title="Log New Case" desc="Record a new procedure" color="bg-primary-100" />
            <QuickAction href="/cases/cv-export" icon={FileText} title="Export CV" desc="Download your case log" color="bg-accent-100" />
            <QuickAction href="/cases/ai-analysis" icon={Brain} title="AI Analysis" desc="Get insights on your progress" color="bg-purple-100" />
          </div>

          <RecentCasesSection cases={recentCases} />
        </>
      )}

      {/* CONSULTANT DASHBOARD */}
      {user.role === 'consultant' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard name="Pending Verification" value={consultantStats?.pendingVerifications || 0} icon={ClipboardCheck} color="bg-yellow-500" />
            <StatCard name="Verified Today" value={consultantStats?.verifiedToday || 0} icon={CheckCircle} color="bg-green-500" />
            <StatCard name="Total Verified" value={consultantStats?.totalVerified || 0} icon={Award} color="bg-blue-500" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Cases Pending Verification</h2>
              <p className="text-sm text-gray-600">Review and verify resident cases</p>
            </div>
            {casesToVerify.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No cases pending verification</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {casesToVerify.map((caseItem) => (
                  <Link key={caseItem.id} href={`/cases/${caseItem.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{caseItem.procedure_type}</p>
                      <p className="text-sm text-gray-500">{caseItem.category} • {new Date(caseItem.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.verification_status)}`}>
                      {getStatusLabel(caseItem.verification_status)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* PROGRAM DIRECTOR DASHBOARD */}
      {(user.role === 'program_director') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard name="Total Residents" value={pdStats?.totalResidents || 0} icon={Users} color="bg-blue-500" />
            <StatCard name="Active Residents" value={pdStats?.activeResidents || 0} icon={TrendingUp} color="bg-green-500" />
            <StatCard name="Pending Reviews" value={pdStats?.pendingVerifications || 0} icon={ClipboardCheck} color="bg-yellow-500" />
            <StatCard name="Avg Cases/Resident" value={pdStats?.averageCasesPerResident || 0} icon={BarChart3} color="bg-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction href="/institution/reports" icon={BarChart3} title="Program Reports" desc="View program analytics" color="bg-blue-100" />
            <QuickAction href="/institution/residents" icon={Users} title="Manage Residents" desc="View and manage residents" color="bg-green-100" />
            <QuickAction href="/institution/templates" icon={FileText} title="Templates" desc="Manage case templates" color="bg-purple-100" />
          </div>
        </>
      )}

      {/* INSTITUTION ADMIN / SUPER ADMIN DASHBOARD */}
      {(user.role === 'institution_admin' || user.role === 'super_admin') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard name="Total Users" value={institutionStats?.totalUsers || 0} icon={Users} color="bg-blue-500" />
            <StatCard name="Total Cases" value={institutionStats?.totalCases || 0} icon={FileText} color="bg-green-500" />
            <StatCard name="Specialties" value={institutionStats?.activeSpecialties || 0} icon={Building2} color="bg-purple-500" />
            <StatCard name="Pending Reviews" value={institutionStats?.pendingVerifications || 0} icon={ClipboardCheck} color="bg-yellow-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickAction href="/institution/admin" icon={Settings} title="Admin Panel" desc="Manage institution settings" color="bg-blue-100" />
            <QuickAction href="/institution/reports" icon={BarChart3} title="Reports" desc="View detailed reports" color="bg-green-100" />
            <QuickAction href="/institution/specialties" icon={Building2} title="Specialties" desc="Manage specialties" color="bg-purple-100" />
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ name, value, icon: Icon, color }: { name: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{name}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${color}`}><Icon className="h-6 w-6 text-white" /></div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon: Icon, title, desc, color }: { href: string; icon: any; title: string; desc: string; color: string }) {
  return (
    <Link href={href} className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100/50 hover:shadow-lg hover:-translate-y-0.5 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} group-hover:opacity-80 transition-opacity`}><Icon className="h-6 w-6 text-gray-700" /></div>
        <div><h3 className="font-semibold text-gray-900">{title}</h3><p className="text-sm text-gray-600">{desc}</p></div>
      </div>
    </Link>
  )
}

function RecentCasesSection({ cases }: { cases: RecentCase[] }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50">
      <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
        <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
        <Link href="/cases" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {cases.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 mb-4">No cases logged yet</p>
          <Link href="/cases/new" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
            <Plus className="h-4 w-4" /> Add your first case
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {cases.map((caseItem) => (
            <Link key={caseItem.id} href={`/cases/${caseItem.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{caseItem.procedure_type}</p>
                <p className="text-sm text-gray-500">{caseItem.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  caseItem.verification_status === 'consultant_verified' ? 'bg-blue-100 text-blue-700' :
                  caseItem.verification_status === 'pd_approved' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {caseItem.verification_status === 'self' ? 'Pending' : caseItem.verification_status === 'consultant_verified' ? 'Verified' : 'Approved'}
                </span>
                <span className="text-sm text-gray-500">{new Date(caseItem.date).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
