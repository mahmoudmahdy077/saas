import { create } from 'zustand'
import { supabase } from './authStore'

export interface Case {
  id: string
  user_id: string
  date: string
  procedure_type: string
  category: string
  subcategory: string | null
  role: 'primary' | 'assistant' | 'observer'
  diagnosis: string | null
  notes: string | null
  complications: string[]
  verification_status: 'self' | 'consultant_verified' | 'pd_approved' | 'rejected'
  images: any[]
  preop_images: any[]
  postop_images: any[]
  created_at: string
  updated_at: string
}

export interface CaseFilters {
  search: string
  category: string | null
  status: string | null
  role: string | null
  dateFrom: string | null
  dateTo: string | null
}

interface CasesState {
  cases: Case[]
  currentCase: Case | null
  loading: boolean
  filters: CaseFilters
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
  
  fetchCases: (reset?: boolean) => Promise<void>
  fetchCase: (id: string) => Promise<void>
  createCase: (caseData: Partial<Case>) => Promise<{ error: string | null }>
  updateCase: (id: string, updates: Partial<Case>) => Promise<{ error: string | null }>
  deleteCase: (id: string) => Promise<{ error: string | null }>
  setFilters: (filters: Partial<CaseFilters>) => void
  clearFilters: () => void
}

const defaultFilters: CaseFilters = {
  search: '',
  category: null,
  status: null,
  role: null,
  dateFrom: null,
  dateTo: null,
}

export const useCasesStore = create<CasesState>((set, get) => ({
  cases: [],
  currentCase: null,
  loading: false,
  filters: defaultFilters,
  pagination: {
    page: 0,
    limit: 20,
    total: 0,
    hasMore: true,
  },

  fetchCases: async (reset = false) => {
    const { filters, pagination } = get()
    const page = reset ? 0 : pagination.page
    
    set({ loading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false })
        return
      }

      let query = supabase
        .from('cases')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(page * pagination.limit, (page + 1) * pagination.limit - 1)

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.status) {
        query = query.eq('verification_status', filters.status)
      }
      if (filters.role) {
        query = query.eq('role', filters.role)
      }
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }
      if (filters.search) {
        query = query.or(`procedure_type.ilike.%${filters.search}%,diagnosis.ilike.%${filters.search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching cases:', error)
        set({ loading: false })
        return
      }

      const newCases = reset ? (data || []) : [...get().cases, ...(data || [])]
      const total = count || 0
      
      set({
        cases: newCases,
        pagination: {
          page,
          limit: pagination.limit,
          total,
          hasMore: newCases.length < total,
        },
        loading: false,
      })
    } catch (error) {
      console.error('Error fetching cases:', error)
      set({ loading: false })
    }
  },

  fetchCase: async (id: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching case:', error)
        set({ loading: false })
        return
      }

      set({ currentCase: data as Case, loading: false })
    } catch (error) {
      console.error('Error fetching case:', error)
      set({ loading: false })
    }
  },

  createCase: async (caseData: Partial<Case>) => {
    set({ loading: true })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false })
        return { error: 'Not authenticated' }
      }

      const { data, error } = await supabase
        .from('cases')
        .insert({
          ...caseData,
          user_id: user.id,
          verification_status: 'self',
        })
        .select()
        .single()

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set(state => ({
        cases: [data as Case, ...state.cases],
        loading: false,
      }))

      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  updateCase: async (id: string, updates: Partial<Case>) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set(state => ({
        cases: state.cases.map(c => c.id === id ? data as Case : c),
        currentCase: state.currentCase?.id === id ? data as Case : state.currentCase,
        loading: false,
      }))

      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  deleteCase: async (id: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id)

      if (error) {
        set({ loading: false })
        return { error: error.message }
      }

      set(state => ({
        cases: state.cases.filter(c => c.id !== id),
        currentCase: state.currentCase?.id === id ? null : state.currentCase,
        loading: false,
      }))

      return { error: null }
    } catch (error: any) {
      set({ loading: false })
      return { error: error.message }
    }
  },

  setFilters: (filters: Partial<CaseFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 0 },
    }))
    get().fetchCases(true)
  },

  clearFilters: () => {
    set({
      filters: defaultFilters,
      pagination: { ...get().pagination, page: 0 },
    })
    get().fetchCases(true)
  },
}))
