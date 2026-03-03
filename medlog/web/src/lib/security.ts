import { NextRequest, NextResponse } from 'next/server'

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }
  
  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt }
  }
  
  record.count++
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt }
}

export function applyRateLimit(
  request: NextRequest,
  limit: number = 100,
  windowMs: number = 60000
): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const key = `${ip}:${request.nextUrl.pathname}`
  
  const result = rateLimit(key, limit, windowMs)
  
  if (!result.success) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', '0')
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString())
    return response
  }
  
  return null
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item))
  }
  
  if (input && typeof input === 'object') {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

export function validateNumericRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max
}

export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return ''
  return input.replace(/'/g, "''").replace(/;/g, '')
}

export function escapeHTML(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  return str.replace(/[&<>"'/]/g, char => htmlEscapes[char] || char)
}

export function stripXSS(input: string): string {
  return input
    .replace(/<\s*script[^>]*>(.*?)<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*iframe[^>]*>(.*?)<\s*\/\s*iframe\s*>/gi, '')
    .replace(/<\s*object[^>]*>(.*?)<\s*\/\s*object\s*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:/gi, '')
}

export function validateAPIKey(apiKey: string): boolean {
  if (!apiKey || apiKey.length < 32) return false
  const validKeyRegex = /^[a-zA-Z0-9_-]{32,}$/
  return validKeyRegex.test(apiKey)
}

export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, byte => chars[byte % chars.length]).join('')
}

export function hashPassword(password: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(password).digest('hex')
}

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
}

export function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value)
  }
  return response
}
