'use client'

import { useState, useEffect } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  Save,
  Upload,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    streak: true,
    milestones: true,
  })
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    specialty: '',
    year: '',
  })

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as typeof theme || 'system'
    setTheme(savedTheme)
    
    // Load user profile
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const handleSaveTheme = () => {
    localStorage.setItem('theme', theme)
    document.documentElement.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.add(systemTheme)
    } else {
      document.documentElement.classList.add(theme)
    }
    
    toast({
      title: 'Theme Updated',
      description: `Switched to ${theme} mode`,
      variant: 'success',
    })
  }

  const handleSaveNotifications = () => {
    toast({
      title: 'Preferences Saved',
      description: 'Notification settings updated',
      variant: 'success',
    })
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/cases/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'json' }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `medlog-data-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        
        toast({
          title: 'Export Complete',
          description: 'Your data has been exported',
          variant: 'success',
        })
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export your data',
        variant: 'destructive',
      })
    }
  }

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <SlideUp>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-500 mt-1">
              Manage your preferences and account settings
            </p>
          </div>
        </SlideUp>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data">
              <Database className="w-4 h-4 mr-2" />
              Data
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <SlideUp delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Name</label>
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email</label>
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        type="email"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Specialty</label>
                      <Input
                        value={profile.specialty}
                        onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                        placeholder="Orthopedic Surgery"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Year</label>
                      <Input
                        value={profile.year}
                        onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                        placeholder="PGY-3"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <SlideUp delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize the appearance of MedLog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div
                      onClick={() => setTheme('light')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                        theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <div className="font-medium">Light</div>
                    </div>
                    <div
                      onClick={() => setTheme('dark')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                        theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Moon className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="font-medium">Dark</div>
                    </div>
                    <div
                      onClick={() => setTheme('system')}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                        theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Monitor className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                      <div className="font-medium">System</div>
                    </div>
                  </div>
                  <Button onClick={handleSaveTheme}>
                    <Palette className="w-4 h-4 mr-2" />
                    Apply Theme
                  </Button>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <SlideUp delay={0.3}>
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-gray-500">Receive updates via email</div>
                    </div>
                    <Button
                      variant={notifications.email ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    >
                      {notifications.email ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-gray-500">Browser push notifications</div>
                    </div>
                    <Button
                      variant={notifications.push ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                    >
                      {notifications.push ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Streak Reminders</div>
                      <div className="text-sm text-gray-500">Daily streak reminders</div>
                    </div>
                    <Button
                      variant={notifications.streak ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications({ ...notifications, streak: !notifications.streak })}
                    >
                      {notifications.streak ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Milestone Alerts</div>
                      <div className="text-sm text-gray-500">Celebrate achievements</div>
                    </div>
                    <Button
                      variant={notifications.milestones ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNotifications({ ...notifications, milestones: !notifications.milestones })}
                    >
                      {notifications.milestones ? 'On' : 'Off'}
                    </Button>
                  </div>
                  <Button onClick={handleSaveNotifications} className="mt-4">
                    <Bell className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </SlideUp>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <SlideUp delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>Export, import, or delete your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Export All Data</div>
                      <div className="text-sm text-gray-500">Download all your cases and settings</div>
                    </div>
                    <Button onClick={handleExportData} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Import Data</div>
                      <div className="text-sm text-gray-500">Import cases from a file</div>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                    <div>
                      <div className="font-medium text-red-600">Delete All Data</div>
                      <div className="text-sm text-gray-500">Permanently delete all your data</div>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
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
