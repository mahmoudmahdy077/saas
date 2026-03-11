# API Routes Documentation

## Structure

```
src/app/api/
├── cases/           # Case management
├── institution/     # Institution features
├── subscription/    # Stripe payments
├── ai/              # AI features
├── auth/            # Authentication
├── share/           # Sharing system
└── ...              # Other endpoints
```

## Common Patterns

### Authentication
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) { /* ... */ }
    }
  }
)

const { data: { user } } = await supabase.auth.getUser()
```

### Error Handling
```typescript
try {
  // Logic
} catch (error) {
  console.error('[API:route]', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Rate Limiting
```typescript
const rateLimitStore = new Map()

function rateLimit(key: string, limit = 30, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= limit) return false
  record.count++
  return true
}
```

---

**Routes:** 67 total  
**Status:** All Next.js 16 compatible
