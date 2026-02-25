import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:8000'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'resident' | 'consultant' | 'program_director' | 'institution_admin'
          specialty_id: string | null
          institution_id: string | null
          created_at: string
          updated_at: string
          timezone: string
          current_streak: number
          longest_streak: number
          last_logged_date: string | null
          streak_freeze_available: boolean
          notification_settings: {
            reminder_enabled: boolean
            reminder_time: string
            vacation_mode: boolean
            skip_weekends: boolean
          }
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'resident' | 'consultant' | 'program_director' | 'institution_admin'
          specialty_id?: string | null
          institution_id?: string | null
          created_at?: string
          updated_at?: string
          current_streak?: number
          longest_streak?: number
          last_logged_date?: string | null
          streak_freeze_available?: boolean
          notification_settings?: {
            reminder_enabled: boolean
            reminder_time: string
            vacation_mode: boolean
            skip_weekends: boolean
          }
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'resident' | 'consultant' | 'program_director' | 'institution_admin'
          specialty_id?: string | null
          institution_id?: string | null
          updated_at?: string
          timezone?: string
          current_streak?: number
          longest_streak?: number
          last_logged_date?: string | null
          streak_freeze_available?: boolean
          notification_settings?: {
            reminder_enabled: boolean
            reminder_time: string
            vacation_mode: boolean
            skip_weekends: boolean
          }
        }
      }
      cases: {
        Row: {
          id: string
          user_id: string
          specialty_id: string | null
          template_id: string | null
          date: string
          procedure_type: string
          category: string
          subcategory: string | null
          role: 'primary' | 'assistant' | 'observer'
          patient_demographics: {
            age: number
            gender: string
          }
          diagnosis: string
          complications: string[]
          notes: string
          custom_fields: Record<string, unknown>
          ai_summary: string | null
          verification_status: 'self' | 'consultant_verified' | 'pd_approved'
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          specialty_id?: string | null
          template_id?: string | null
          date: string
          procedure_type: string
          category: string
          subcategory?: string | null
          role: 'primary' | 'assistant' | 'observer'
          patient_demographics: {
            age: number
            gender: string
          }
          diagnosis: string
          complications?: string[]
          notes: string
          custom_fields?: Record<string, unknown>
          ai_summary?: string | null
          verification_status?: 'self' | 'consultant_verified' | 'pd_approved'
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          specialty_id?: string | null
          template_id?: string | null
          date?: string
          procedure_type?: string
          category?: string
          subcategory?: string | null
          role?: 'primary' | 'assistant' | 'observer'
          patient_demographics?: {
            age: number
            gender: string
          }
          diagnosis?: string
          complications?: string[]
          notes?: string
          custom_fields?: Record<string, unknown>
          ai_summary?: string | null
          verification_status?: 'self' | 'consultant_verified' | 'pd_approved'
          verified_by?: string | null
          verified_at?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reminder' | 'streak' | 'achievement' | 'gap_alert' | 'verification'
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reminder' | 'streak' | 'achievement' | 'gap_alert' | 'verification'
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
      institutions: {
        Row: {
          id: string
          name: string
          created_at: string
          admin_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          admin_id: string
        }
        Update: {
          name?: string
        }
      }
      specialties: {
        Row: {
          id: string
          institution_id: string | null
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          institution_id?: string | null
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          institution_id?: string | null
          name?: string
          description?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          type: 'universal' | 'specialty' | 'institution'
          owner_id: string | null
          fields: Array<{
            name: string
            label: string
            type: 'text' | 'number' | 'date' | 'select' | 'multiselect'
            required: boolean
            options?: string[]
          }>
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'universal' | 'specialty' | 'institution'
          owner_id?: string | null
          fields: Array<{
            name: string
            label: string
            type: 'text' | 'number' | 'date' | 'select' | 'multiselect'
            required: boolean
            options?: string[]
          }>
          created_at?: string
        }
        Update: {
          name?: string
          fields?: Array<{
            name: string
            label: string
            type: 'text' | 'number' | 'date' | 'select' | 'multiselect'
            required: boolean
            options?: string[]
          }>
        }
      }
      share_links: {
        Row: {
          id: string
          user_id: string
          token: string
          type: 'time_limited' | 'permanent' | 'password_protected'
          expires_at: string | null
          password_hash: string | null
          permissions: 'view' | 'edit' | 'export'
          access_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          type: 'time_limited' | 'permanent' | 'password_protected'
          expires_at?: string | null
          password_hash?: string | null
          permissions: 'view' | 'edit' | 'export'
          access_count?: number
          created_at?: string
        }
        Update: {
          type?: 'time_limited' | 'permanent' | 'password_protected'
          expires_at?: string | null
          password_hash?: string | null
          permissions?: 'view' | 'edit' | 'export'
          access_count?: number
        }
      }
    }
  }
}
