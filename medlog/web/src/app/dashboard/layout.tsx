'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Stethoscope,
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  BarChart3,
  Brain,
  FileDown,
  Users,
  Building2,
  ClipboardCheck,
  Shield
} from 'lucide-react'
import NotificationDropdown from '@/components/NotificationDropdown'

const residentNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'AI Analysis', href: '/cases/ai-analysis', icon: Brain },
  { name: 'Cases', href: '/cases', icon: FileText },
  { name: 'CV Export', href: '/cases/cv-export', icon: FileDown },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const consultantNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Verify Cases', href: '/cases?status=self', icon: ClipboardCheck },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const pdNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Residents', href: '/institution/residents', icon: Users },
  { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
  { name: 'Templates', href: '/institution/templates', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const adminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/institution/residents', icon: Users },
  { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
  { name: 'Specialties', href: '/institution/specialties', icon: Building2 },
  { name: 'Templates', href: '/institution/templates', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const superAdminNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Super Admin', href: '/superadmin', icon: Shield },
  { name: 'Users', href: '/institution/residents', icon: Users },
  { name: 'Reports', href: '/institution/reports', icon: BarChart3 },
  { name: 'Specialties', href: '/institution/specialties', icon: Building2 },
  { name: 'Templates', href: '/institution/templates', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function getNavigation(role: string) {
  switch (role) {
    case 'consultant': return consultantNav
    case 'program_director': return pdNav
    case 'institution_admin': return adminNav
    case 'super_admin': return superAdminNav
    default: return residentNav
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = user ? getNavigation(user.role) : residentNav

  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    if (isRedirecting) return

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Auth check failed:', response.status, errorData)

          setIsRedirecting(true)
          window.location.href = '/login'
          return
        }
        const data = await response.json()
        console.log('User data:', data)
        console.log('Profile:', data.profile)
        setUserData(data)
        // Use profile if available, otherwise use user data
        const userProfile = data.profile ? { 
          full_name: data.profile.full_name || data.user?.email?.split('@')[0] || 'User', 
          role: data.profile.role || 'resident' 
        } : { full_name: data.user?.email?.split('@')[0] || 'User', role: 'resident' }
        console.log('Setting user:', userProfile)
        setUser(userProfile)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setIsRedirecting(true)
        window.location.href = '/login'
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [router, isRedirecting])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:block">
        <SidebarContent
          navigation={navigation}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <NotificationDropdown />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-medium">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  navigation,
  pathname,
  user,
  onLogout,
  onClose
}: {
  navigation: any[]
  pathname: string
  user: { full_name: string; role: string }
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100/50">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100/50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-primary-900">MedLog</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-medium">
              {user.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
