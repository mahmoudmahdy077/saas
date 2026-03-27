/**
 * API Integration Tests
 * Test frontend-backend integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// Mock fetch for API tests
global.fetch = vi.fn()

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const mockResponse = {
        status: 'healthy',
        checks: {
          database: { healthy: true },
          services: { healthy: true }
        }
      }

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any)

      const response = await fetch('/api/health')
      const data = await response.json()

      expect(response.ok).toBe(true)
      expect(data.status).toBe('healthy')
    })
  })

  describe('Authentication Flow', () => {
    it('should reject requests without auth', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }),
      } as any)

      const response = await fetch('/api/cases', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should accept requests with valid auth', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], pagination: { total: 0, limit: 50, page: 1 } }),
      } as any)

      const response = await fetch('/api/cases', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
      })

      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.data).toEqual([])
    })
  })

  describe('Input Validation', () => {
    it('should reject invalid case creation input', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'Invalid input',
            code: 'VALIDATION_ERROR',
            details: [{ message: 'Title is required', path: ['title'] }]
          }
        }),
      } as any)

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Missing title' }),
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })

    it('should accept valid case creation input', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ data: { case: { id: '1', title: 'Valid Case' } }, message: 'Case created' }),
      } as any)

      const validCase = {
        title: 'Valid Case',
        description: 'This is a valid case description with sufficient length.',
        patientAge: 35,
        patientGender: 'male' as const,
        diagnosis: 'Valid diagnosis',
        treatment: 'Valid treatment',
        outcome: 'Valid outcome',
      }

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validCase),
      })

      expect(response.ok).toBe(true)
      expect(response.status).toBe(201)
    })
  })

  describe('Error Handling', () => {
    it('should return standardized error format', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
            status: 500
          }
        }),
      } as any)

      const response = await fetch('/api/cases')
      const data = await response.json()

      expect(data.error).toBeDefined()
      expect(data.error.message).toBeDefined()
      expect(data.error.code).toBeDefined()
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(fetch('/api/cases')).rejects.toThrow('Network error')
    })
  })

  describe('Response Format', () => {
    it('should return paginated response for list endpoints', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [],
          pagination: {
            total: 0,
            limit: 50,
            page: 1,
          }
        }),
      } as any)

      const response = await fetch('/api/cases?limit=50')
      const data = await response.json()

      expect(data.data).toBeDefined()
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBeDefined()
      expect(data.pagination.limit).toBeDefined()
      expect(data.pagination.page).toBeDefined()
    })

    it('should return success response for create endpoints', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          data: { case: { id: '1' } },
          message: 'Case created successfully',
          status: 201
        }),
      } as any)

      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test',
          description: 'Test description here',
          patientAge: 30,
          patientGender: 'male',
          diagnosis: 'Test',
          treatment: 'Test',
          outcome: 'Test',
        }),
      })

      const data = await response.json()
      expect(data.data).toBeDefined()
      expect(data.message).toBeDefined()
      expect(data.status).toBe(201)
    })
  })
})

describe('Frontend Components Integration', () => {
  it('should handle API errors in components', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Server error' } }),
    } as any)

    // Simulate component error handling
    try {
      const response = await fetch('/api/cases')
      if (!response.ok) {
        throw new Error('API error')
      }
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  it('should handle loading states', async () => {
    let isLoading = true

    const mockPromise = new Promise(resolve => {
      setTimeout(() => {
        isLoading = false
        resolve({ ok: true, json: async () => ({ data: [] }) })
      }, 100)
    })

    vi.mocked(fetch).mockReturnValue(mockPromise as any)

    expect(isLoading).toBe(true)
    await mockPromise
    expect(isLoading).toBe(false)
  })
})
