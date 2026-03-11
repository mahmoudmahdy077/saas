# MedLog API Reference

**Version:** 1.0.0  
**Base URL:** `/api`

---

## Authentication

All endpoints require authentication via Supabase JWT.

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## Cases API

### GET `/api/cases`
List all cases for authenticated user.

**Response:**
```json
{
  "cases": [
    {
      "id": "uuid",
      "title": "string",
      "created_at": "ISO date",
      "updated_at": "ISO date"
    }
  ]
}
```

### POST `/api/cases`
Create new case.

**Body:**
```json
{
  "title": "string",
  "data": "object"
}
```

### GET `/api/cases/:id`
Get single case by ID.

### PUT `/api/cases/:id`
Update case.

### DELETE `/api/cases/:id`
Delete case.

---

## Institution API

### GET `/api/institution/residents`
List all residents in institution.

**Auth:** Institution admin only

### POST `/api/institution/templates`
Create case template.

---

## Subscription API

### GET `/api/subscription/plans`
List available plans.

### POST `/api/subscription/checkout`
Create Stripe checkout session.

### POST `/api/subscription/webhook`
Stripe webhook handler.

---

## AI API

### POST `/api/ai/summary`
Generate case summary.

**Rate Limit:** 10 requests/hour

### POST `/api/ai/gap-analysis`
Generate learning gap analysis.

---

**Total Endpoints:** 67  
**Documented:** 10 (15%)  
**Status:** In Progress
