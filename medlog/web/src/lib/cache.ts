/**
 * MedLog Caching Utilities
 * SWR-based caching strategy with stale-while-revalidate
 */

import useSWR, { mutate, SWRConfiguration } from 'swr'

// Default fetcher for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`)
  }
  return response.json()
}

// Cache configuration
export const cacheConfig = {
  // Revalidate on focus
  revalidateOnFocus: true,
  
  // Revalidate on reconnect
  revalidateOnReconnect: true,
  
  // Don't revalidate on mount by default
  revalidateOnMount: false,
  
  // Keep stale data for 60 seconds
  dedupingInterval: 60000,
  
  // Refresh interval (disabled by default)
  refreshInterval: 0,
  
  // Keep data for 5 minutes before considering stale
  revalidateIfStale: true,
}

// Generic hook for fetching data with caching
export function useCachedData<T = any>(
  key: string | null,
  config?: SWRConfiguration
) {
  return useSWR<T>(
    key,
    fetcher,
    {
      ...cacheConfig,
      ...config,
    }
  )
}

// Specific hooks for common data types
export function useCases(filters?: {
  category?: string
  status?: string
  limit?: number
}) {
  const key = filters
    ? `/api/cases?${new URLSearchParams(filters as any).toString()}`
    : '/api/cases'
  
  return useCachedData(key, {
    revalidateOnMount: true,
  })
}

export function useUserStats() {
  return useCachedData('/api/user/stats', {
    revalidateOnMount: true,
    refreshInterval: 60000, // Refresh every minute
  })
}

export function useUserProfile() {
  return useCachedData('/api/user/profile', {
    revalidateOnMount: true,
  })
}

export function useInstitutionAnalytics() {
  return useCachedData('/api/institution/analytics', {
    revalidateOnMount: true,
    refreshInterval: 300000, // Refresh every 5 minutes
  })
}

// Manual cache invalidation
export async function invalidateCache(key: string) {
  await mutate(key)
}

export async function invalidateCases() {
  await mutate('/api/cases')
}

export async function invalidateUserStats() {
  await mutate('/api/user/stats')
}

// Cache update without revalidation
export function updateCache<T>(key: string, data: T) {
  mutate(key, data, false)
}

// Optimistic update pattern
export async function optimisticUpdate<T>(
  key: string,
  updateFn: (data: T) => T,
  mutationFn: () => Promise<void>
) {
  // Get current data
  const currentData = await mutate(key)
  
  try {
    // Optimistically update
    if (currentData) {
      mutate(key, updateFn(currentData), false)
    }
    
    // Perform mutation
    await mutationFn()
    
    // Revalidate to ensure consistency
    await mutate(key)
  } catch (error) {
    // Rollback on error
    if (currentData) {
      mutate(key, currentData, false)
    }
    throw error
  }
}

// LocalStorage cache for non-critical data
export const localStorageCache = {
  set: (key: string, value: any, ttl: number = 3600000) => {
    const item = {
      value,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(`cache:${key}`, JSON.stringify(item))
  },
  
  get: (key: string) => {
    const itemStr = localStorage.getItem(`cache:${key}`)
    if (!itemStr) return null
    
    const item = JSON.parse(itemStr)
    const now = Date.now()
    
    // Check if expired
    if (now - item.timestamp > item.ttl) {
      localStorage.removeItem(`cache:${key}`)
      return null
    }
    
    return item.value
  },
  
  remove: (key: string) => {
    localStorage.removeItem(`cache:${key}`)
  },
  
  clear: () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cache:'))
    keys.forEach(k => localStorage.removeItem(k))
  },
}

export default useCachedData
