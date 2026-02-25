'use client'

import { useEffect, useState, useRef } from 'react'
import {
    Bell,
    X,
    Check,
    Flame,
    Brain,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react'

interface Notification {
    id: string
    type: 'reminder' | 'streak' | 'achievement' | 'gap_alert' | 'verification'
    title: string
    message: string
    read: boolean
    created_at: string
}

const typeIcons: Record<string, typeof Bell> = {
    reminder: Clock,
    streak: Flame,
    achievement: CheckCircle,
    gap_alert: Brain,
    verification: AlertTriangle,
}

const typeColors: Record<string, string> = {
    reminder: 'text-blue-500 bg-blue-50',
    streak: 'text-orange-500 bg-orange-50',
    achievement: 'text-green-500 bg-green-50',
    gap_alert: 'text-purple-500 bg-purple-50',
    verification: 'text-yellow-500 bg-yellow-50',
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        fetchNotifications()
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/notifications', { credentials: 'include' })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data.notifications || [])
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId, read: true }),
            })
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            )
        } catch (error) {
            console.error('Failed to mark notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        const unread = notifications.filter(n => !n.read)
        for (const n of unread) {
            await markAsRead(n.id)
        }
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        return `${days}d ago`
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) fetchNotifications()
                }}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100/50 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2" />
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                                <p className="text-gray-400 text-xs mt-1">You&apos;re all caught up!</p>
                            </div>
                        ) : (
                            notifications.map(notification => {
                                const Icon = typeIcons[notification.type] || Bell
                                const colorClass = typeColors[notification.type] || 'text-gray-500 bg-gray-50'
                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50/30' : ''
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 bg-primary-500 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
