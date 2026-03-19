'use client'

import { useState } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Shield } from 'lucide-react'

const AUDIT_LOGS = [
  { id: 1, user: 'Dr. John', action: 'Login', ip: '192.168.1.1', time: '2026-03-19 10:30' },
  { id: 2, user: 'Dr. Sarah', action: 'Created Case', ip: '192.168.1.2', time: '2026-03-19 10:25' },
  { id: 3, user: 'Dr. John', action: 'Exported Data', ip: '192.168.1.1', time: '2026-03-19 10:20' },
  { id: 4, user: 'Admin', action: 'User Management', ip: '192.168.1.100', time: '2026-03-19 10:15' },
]

export default function AuditLogPage() {
  const [search, setSearch] = useState('')

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-gray-500 mt-1">Track all user activities</p>
          </div>
          <Button>
            <Shield className="w-4 h-4 mr-2" /> Export Logs
          </Button>
        </div>

        <SlideUp>
          <Card>
            <CardHeader>
              <div className="flex gap-4">
                <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
                <Button><Search className="w-4 h-4" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">IP Address</th>
                    <th className="p-3 text-left">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_LOGS.map((log) => (
                    <tr key={log.id} className="border-t">
                      <td className="p-3">{log.user}</td>
                      <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{log.action}</span></td>
                      <td className="p-3 text-gray-500">{log.ip}</td>
                      <td className="p-3 text-gray-500">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
