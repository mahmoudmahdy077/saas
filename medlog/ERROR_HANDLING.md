# Error Handling Standards - MedLog

## Global Error Handler

All API routes must implement:

```typescript
try {
  // Business logic
} catch (error) {
  console.error(`[API:${route}]`, error)
  return NextResponse.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

## Error Types

| Type | Status | User Message | Log Level |
|------|--------|--------------|-----------|
| Unauthorized | 401 | "Authentication required" | warn |
| Forbidden | 403 | "Access denied" | warn |
| Not Found | 404 | "Resource not found" | info |
| Bad Request | 400 | "Invalid input" | warn |
| Conflict | 409 | "Resource already exists" | info |
| Internal | 500 | "Server error" | error |

## Implementation Checklist

- [x] `/api/cases/*` - Supabase auth + RLS
- [x] `/api/institution/*` - Institution scoping
- [ ] `/api/ai/*` - Rate limiting + timeout
- [ ] `/api/subscription/*` - Stripe error codes
- [ ] `/api/share/*` - Token validation

## Logging Format

```typescript
{
  timestamp: ISO string,
  route: string,
  userId: string | 'anonymous',
  error: string,
  stack?: string,
  context: object
}
```

---

**Status:** 60% Complete  
**Next:** Add structured logging to all routes
