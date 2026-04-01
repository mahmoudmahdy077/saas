/**
 * E2E Tests with Playwright
 * Complete user flow testing
 */

import { test, expect } from '@playwright/test'

test.describe('MedLog SaaS E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Authentication Flow', () => {
    test('should show login page', async ({ page }) => {
      await expect(page).toHaveTitle(/MedLog/)
      await expect(page.locator('h1')).toContainText('MedLog')
    })

    test('should handle failed login', async ({ page }) => {
      await page.goto('/auth/signin')
      await page.fill('input[name="email"]', 'invalid@example.com')
      await page.fill('input[name="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')
      
      // Should show error
      await expect(page.locator('[data-testid="error"]')).toBeVisible()
    })
  })

  test.describe('Cases Management', () => {
    test('should load cases page', async ({ page }) => {
      await page.goto('/cases')
      await expect(page.locator('h1')).toContainText('Cases')
    })

    test('should create new case', async ({ page }) => {
      await page.goto('/cases/new')
      
      // Fill form
      await page.fill('input[name="title"]', 'Test Case')
      await page.fill('textarea[name="description"]', 'Test description with sufficient length for validation')
      await page.fill('input[name="patientAge"]', '35')
      await page.selectOption('select[name="patientGender"]', 'male')
      await page.fill('textarea[name="diagnosis"]', 'Test diagnosis information')
      await page.fill('textarea[name="treatment"]', 'Test treatment plan')
      await page.fill('textarea[name="outcome"]', 'Test outcome description')
      
      // Submit
      await page.click('button[type="submit"]')
      
      // Should redirect to cases list
      await expect(page).toHaveURL(/\/cases/)
    })

    test('should validate case form', async ({ page }) => {
      await page.goto('/cases/new')
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      await expect(page.locator('[data-testid="error"]')).toBeVisible()
    })
  })

  test.describe('Dashboard', () => {
    test('should load dashboard', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page.locator('h1')).toContainText('Dashboard')
    })

    test('should show statistics', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page.locator('[data-testid="stat-card"]')).toHaveCount({ min: 1 })
    })
  })

  test.describe('Analytics', () => {
    test('should load analytics page', async ({ page }) => {
      await page.goto('/analytics')
      await expect(page.locator('h1')).toContainText('Analytics')
    })

    test('should display charts', async ({ page }) => {
      await page.goto('/analytics')
      await expect(page.locator('[data-testid="chart"]')).toHaveCount({ min: 1 })
    })
  })

  test.describe('Health Check', () => {
    test('API health endpoint', async ({ request }) => {
      const response = await request.get('/api/health')
      expect(response.ok()).toBeTruthy()
      
      const data = await response.json()
      expect(data.status).toBe('healthy')
    })
  })

  test.describe('Error Handling', () => {
    test('should show 404 page', async ({ page }) => {
      await page.goto('/nonexistent-page')
      await expect(page.locator('h1')).toContainText('404')
    })

    test('should handle API errors gracefully', async ({ page, request }) => {
      const response = await request.get('/api/cases', {
        headers: { 'Authorization': 'Bearer invalid-token' }
      })
      
      expect(response.status()).toBe(401)
      const data = await response.json()
      expect(data.error.code).toBe('UNAUTHORIZED')
    })
  })

  test.describe('Performance', () => {
    test('should load homepage quickly', async ({ page }) => {
      const start = Date.now()
      await page.goto('/')
      const loadTime = Date.now() - start
      
      expect(loadTime).toBeLessThan(3000) // 3 seconds
    })

    test('should load cases page quickly', async ({ page }) => {
      const start = Date.now()
      await page.goto('/cases')
      const loadTime = Date.now() - start
      
      expect(loadTime).toBeLessThan(3000)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible()
    })

    test('should work on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/')
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading structure', async ({ page }) => {
      await page.goto('/')
      await expect(page.locator('h1')).toHaveCount(1)
    })

    test('should have alt text on images', async ({ page }) => {
      await page.goto('/')
      const images = page.locator('img')
      const count = await images.count()
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i)
        await expect(img).toHaveAttribute('alt', /.+/)
      }
    })
  })
})
