# API Routes Fix Plan

**Generated:** 2026-03-27T10:58:56.644Z
**Total Routes:** 80

## Summary

| Priority | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| P0 (Critical) | 17 | 0 | 17 |
| P1 (High) | 25 | 1 | 24 |
| P2 (Medium) | 38 | 0 | 38 |

## P0 Routes (Fix First)


### /api/admin/payment/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/admin/users/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/2fa/setup/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/2fa/verify/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/[...nextauth]/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/login/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/logout/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/profile/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/register/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/auth/user/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/oauth/authorize/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/oauth/token/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/subscription/checkout/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/subscription/plans/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/subscription/portal/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/subscription/usage/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/subscription/webhook/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


## P1 Routes (Fix Second)


### /api/admin/institutions/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/analytics/predictive/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/analytics/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/[id]/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/bulk-import/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/cv-export/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/export/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/images/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cases/route.ts
- [ ] Input Validation: ✅
- [ ] Authentication: ✅
- [ ] Audit Logging: ✅
- [ ] Standard Response: ❌


### /api/cases/stats/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/analytics/comparison/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/analytics/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/api-keys/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/branding/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/dashboards/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/grades/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/integrations/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/report-schedules/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/reports/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/residents/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/specialties/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/sso/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/stats/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/templates/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/institution/webhooks/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


## P2 Routes (Fix Last)


### /api/admin/ai-providers/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/admin/notifications/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/admin/settings/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/assistant/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/gap-analysis/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/image-recognition/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/predictive/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/recommendations/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/summary/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/templates/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/ai/usage/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/audit-logs/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/billing/usage/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/codes/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/countries/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cron/notifications/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/cron/report-schedules/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/graphql/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/health/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/invites/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/invoices/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/milestones/transcript/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/notifications/preferences/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/notifications/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/portfolio/publications/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/portfolio/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/progress/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/references/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/reports/export/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/reports/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/scim/Users/[id]/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/scim/Users/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/share/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/streaks/freeze/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/streaks/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ✅
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/stripe/checkout/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/v1/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


### /api/video/upload/route.ts
- [ ] Input Validation: ❌
- [ ] Authentication: ❌
- [ ] Audit Logging: ❌
- [ ] Standard Response: ❌


## Quick Fix Template

```typescript
import { createApiRoute, api } from '@/lib/api-route'
import { createCaseSchema } from '@/lib/validation'

export const POST = createApiRoute({
  method: 'POST',
  auth: true,
  validateBody: createCaseSchema,
  auditAction: 'CASE_CREATE',
  auditResource: 'case',
  handler: async ({ body }, user) => {
    // Your logic here
    return api.success({ data: body }, 'Created', 201)
  }
})
```

## Automated Fix Commands

```bash
# Fix all P0 routes
npm run fix:routes:p0

# Fix all P1 routes
npm run fix:routes:p1

# Fix all routes
npm run fix:routes:all
```
