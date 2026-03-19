'use client'

import { useState, useEffect } from 'react'
import { PageTransition, SlideUp } from '@/components/ui/page-transition'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, Check, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New case comment', message: 'Dr. Smith commented on your case', time: '5m ago', read: false },
    { id: 2, title: 'Streak milestone', message: 'You reached a 30-day streak!', time: '1h ago', read: false },
    { id: 3, title: 'Case approved', message: 'Your case was verified', time: '2h ago', read: true },
  ])

  const markRead = (id: number) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  const deleteNotif = (id: number) => setNotifications(notifications.filter(n => n.id !== id))

  return (
    <PageTransition>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-gray-500 mt-1">Stay updated with your activity</p>
          </div>
          <Button variant="outline" onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}>
            <Check className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
        </div>

        <SlideUp>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card key={notif.id} className={!notif.read ? 'border-blue-300 bg-blue-50' : ''}>
                <CardContent className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className={`w-5 h-5 ${notif.read ? 'text-gray-400' : 'text-blue-500'}`} />
                    <div>
                      <p className={`font-medium ${notif.read ? 'text-gray-500' : ''}`}>{notif.title}</p>
                      <p className="text-sm text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read && <Button variant="ghost" size="icon" onClick={() => markRead(notif.id)}><Check className="w-4 h-4" /></Button>}
                    <Button variant="ghost" size="icon" onClick={() => deleteNotif(notif.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SlideUp>
      </div>
    </PageTransition>
  )
}
