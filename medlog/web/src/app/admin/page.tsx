'use client'

import { useState, useEffect } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Activity, DollarSign, Settings } from 'lucide-react'

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, cases: 0, revenue: 0 })

  useEffect(() => {
    // Fetch admin stats
    setStats({ users: 150, cases: 2500, revenue: 4500 })
  }, [])

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage users, cases, and settings</p>
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>

        <SlideUp>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.users}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <Activity className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{stats.cases}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">${stats.revenue}</div></CardContent>
            </Card>
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <Card>
            <CardHeader><CardTitle>User Management</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input placeholder="Search users..." className="max-w-sm" />
                <Button>Search</Button>
              </div>
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Plan</th>
                      <th className="p-3 text-left">Cases</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3">Dr. John Doe</td>
                      <td className="p-3">john@example.com</td>
                      <td className="p-3"><Badge>Pro</Badge></td>
                      <td className="p-3">45</td>
                      <td className="p-3"><Button variant="outline" size="sm">Manage</Button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}

function Badge({ children }: any) {
  return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{children}</span>
}
