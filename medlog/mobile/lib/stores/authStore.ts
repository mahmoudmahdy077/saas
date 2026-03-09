import { create } from 'zustand'
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const secureStorage = Platform.OS === 'web' 
  ? {
      getItem: async (key: string): Promise<string | null> => {
        try { return localStorage.getItem(key) } catch { return null }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try { localStorage.setItem(key, value) } catch { }
      },
      removeItem: async (key: string): Promise<void> => {
        try { localStorage.removeItem(key) } catch { }
      },
    }
  : {
      getItem: async (key: string): Promise<string | null> => {
        try { return await SecureStore.getItemAsync(key) } catch { return null }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try { 
          await SecureStore.setItemAsync(key, value, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED
          })
        } catch { }
      },
      removeItem: async (key: string): Promise<void> => {
        try { await SecureStore.deleteItemAsync(key) } catch { }
      },
    }

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// Platform-aware storage: localStorage on web, SecureStore on native
const createStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          localStorage.setItem(key, value)
        } catch { }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          localStorage.removeItem(key)
        } catch { }
      },
    }
  }

  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        return await SecureStore.getItemAsync(key)
      } catch {
        return null
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED
        })
      } catch { }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await SecureStore.deleteItemAsync(key)
      } catch { }
    },
  }
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  institution_id: string
  specialty_id: string | null
  training_year: number
  current_streak: number
  longest_streak: number
  last_logged_date: string | null
  notification_settings: {
    reminder_enabled: boolean
    reminder_time: string
    vacation_mode: boolean
  }
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: any | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, specialty: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({
          user: session.user,
          profile: profile as Profile,
          session,
          initialized: true
        })
      } else {
        set({ initialized: true })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          user: data.user,
          profile: profile as Profile,
          session: data.session,
          loading: false
        })
      }

      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  signUp: async (email: string, password: string, fullName: string, specialty: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      if (data.user) {
        const { data: specialtyData } = await supabase
          .from('specialties')
          .select('id')
          .eq('name', specialty)
          .single()

        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'resident',
          specialty_id: specialtyData?.id || null,
          notification_settings: {
            reminder_enabled: true,
            reminder_time: '21:00',
            vacation_mode: false,
          },
        })

        if (profileError) {
          set({ loading: false })
          return { error: profileError.message }
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        set({
          user: data.user,
          profile: profile as Profile,
          loading: false
        })
      }

      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      await secureStorage.removeItem('sb-access-token')
      await secureStorage.removeItem('sb-refresh-token')
      set({ user: null, profile: null, session: null, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      set({ loading: false })
      return { error: error?.message || null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get()
    if (!user) return { error: 'Not authenticated' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) return { error: error.message }

      set({ profile: data as Profile })
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  },
}))
