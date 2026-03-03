import { create } from 'zustand'
import { supabase } from './authStore'

export interface Institution {
  id: string
  name: string
  logo_url: string | null
  primary_color: string | null
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}

interface AppState {
  institution: Institution | null
  notifications: Notification[]
  unreadCount: number
  isOffline: boolean
  syncQueue: any[]
  
  fetchInstitution: () => Promise<void>
  fetchNotifications: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  setOffline: (offline: boolean) => void
  addToSyncQueue: (item: any) => void
  clearSyncQueue: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  institution: null,
  notifications: [],
  unreadCount: 0,
  isOffline: false,
  syncQueue: [],

  fetchInstitution: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('id', user.id)
        .single()

      if (profile?.institution_id) {
        const { data: institution } = await supabase
          .from('institutions')
          .select('*')
          .eq('id', profile.institution_id)
          .single()

        set({ institution: institution as Institution })
      }
    } catch (error) {
      console.error('Error fetching institution:', error)
    }
  },

  fetchNotifications: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (notifications) {
        const unreadCount = notifications.filter(n => !n.read).length
        set({ notifications, unreadCount })
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  },

  markNotificationRead: async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
      const unreadCount = notifications.filter(n => !n.read).length
      set({ notifications, unreadCount })
    } catch (error) {
      console.error('Error marking notification read:', error)
    }
  },

  markAllNotificationsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      const notifications = get().notifications.map(n => ({ ...n, read: true }))
      set({ notifications, unreadCount: 0 })
    } catch (error) {
      console.error('Error marking all notifications read:', error)
    }
  },

  setOffline: (offline: boolean) => {
    set({ isOffline: offline })
  },

  addToSyncQueue: (item: any) => {
    const queue = [...get().syncQueue, item]
    set({ syncQueue: queue })
  },

  clearSyncQueue: () => {
    set({ syncQueue: [] })
  },
}))
