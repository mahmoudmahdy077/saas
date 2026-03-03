# MedLog Product Roadmap

## Project Overview

**MedLog** is a comprehensive medical case logging platform (SaaS) designed for residency programs. It provides subscription/billing management, ACGME compliance features, multi-country support, and AI-powered insights.

---

## Completed Features

### Phase 1: Subscription & Billing

| Feature | Status | Description |
|---------|--------|-------------|
| Subscription Plans | ✅ Done | 4 tiers: Free, Basic ($19/mo), Pro ($49/mo), Enterprise |
| Database Tables | ✅ Done | `subscription_plans`, `institution_subscriptions`, `usage_records`, `feature_flags`, `invoices` |
| Plans API | ✅ Done | `/api/subscription/plans` |
| Usage API | ✅ Done | `/api/subscription/usage` |
| Pricing Page | ✅ Done | `/pricing` with feature comparison |

### Phase 2: ACGME Compliance

| Feature | Status | Description |
|---------|--------|-------------|
| CPT Codes | ✅ Done | 516 surgical codes (Digestive, Musculoskeletal, Vascular, etc.) |
| ICD-10 Codes | ✅ Done | 213 diagnosis codes |
| Database Tables | ✅ Done | `procedure_codes`, `diagnosis_codes`, `case_codes`, `case_minimums` |
| Milestones | ✅ Done | 14 ACGME milestone definitions |
| Case Minimums | ✅ Done | 19 General Surgery minimums |
| Progress API | ✅ Done | `/api/progress` |
| Progress Page | ✅ Done | `/progress` - case tracking dashboard |
| Codes API | ✅ Done | `/api/codes` for CPT/ICD-10 search |

### Phase 3: Multi-Country Support

| Feature | Status | Description |
|---------|--------|-------------|
| Country Config | ✅ Done | 15 countries configured (US, UK, CA, AU, DE, FR, NZ, IE, SG, MY, PH, IN, ZA, AE, SA) |
| Countries API | ✅ Done | `/api/countries` |
| Country Database | ✅ Done | `country_config` table |

### Phase 4: Payments & Enterprise

| Feature | Status | Description |
|---------|--------|-------------|
| Stripe Integration | ✅ Done | Connect subscription system to Stripe for payment processing |
| Checkout Sessions | ✅ Done | `/api/subscription/checkout` - Create checkout sessions |
| Webhook Handler | ✅ Done | `/api/subscription/webhook` - Handle Stripe webhooks |
| Customer Portal | ✅ Done | `/api/subscription/portal` - Self-serve billing management |
| Invoice Generation | ✅ Done | Automated monthly/yearly invoices |
| Usage-Based Billing | ✅ Done | AI usage tracking per user/institution |
| Custom Branding | ✅ Done | Logo upload, custom colors, white-label options |
| SSO/SAML Integration | ✅ Done | Okta, Azure AD, Google Workspace, OneLogin |
| SCIM Provisioning | ✅ Done | Automated user provisioning/deprovisioning |

### Phase 5: Advanced Reporting & Compliance

| Feature | Status | Description |
|---------|--------|-------------|
| Reports API | ✅ Done | `/api/reports` - ACGME compliance reports |
| Case Volume Report | ✅ Done | Monthly/quarterly case volume by category |
| Case Minimums Report | ✅ Done | Compliance status for all residents |
| Resident Summary Report | ✅ Done | Individual resident progress reports |
| Milestone Report | ✅ Done | Program-wide milestone completion |
| Audit Logs | ✅ Done | Track all user actions for compliance |
| Export Formats | ✅ Done | CSV exports |
| Scheduled Reports | ✅ Done | Auto-generate and email reports |

### Phase 6: AI & Intelligence

| Feature | Status | Description |
|---------|--------|-------------|
| AI Provider Config | ✅ Done | Support for OpenAI, Anthropic, local models |
| Rate Limiting | ✅ Done | Per-user, per-institution rate limits |
| Cost Optimization | Pending | Track and optimize AI usage costs |
| AI Usage Analytics | Pending | Dashboard for AI usage by resident |
| Gap Analysis (Prod) | Pending | Enhanced AI-powered case gap analysis |
| Smart Suggestions | Pending | Recommend cases based on milestones |
| Auto-Coding | Pending | Suggest CPT/ICD-10 codes from case notes |

### Phase 7: Engagement & Notifications

| Feature | Status | Description |
|---------|--------|-------------|
| Notifications System | ✅ Done | In-app notification center |
| Email Notifications | ✅ Done | Case reminders, milestones, billing |
| Push Notifications | Pending | Mobile push notifications |
| Case Reminders | ✅ Done | Daily/weekly logging reminders |
| Verification Reminders | ✅ Done | Remind consultants to verify cases |
| Milestone Alerts | ✅ Done | Notify when assessments are due |
| Streak Reminders | ✅ Done | Encourage consistent logging |
| Subscription Alerts | ✅ Done | Renewal, upgrade, payment reminders |

### Phase 8: Mobile & Cross-Platform

| Feature | Status | Description |
|---------|--------|-------------|
| Mobile App (iOS) | Pending | Native iOS app for case logging |
| Mobile App (Android) | Pending | Native Android app for case logging |
| Offline Mode | Pending | Full offline case entry with sync |
| Photo Capture | Pending | Camera integration for case images |
| Voice Notes | Pending | Voice-to-text for case notes |
| Biometric Login | Pending | Face ID / Touch ID support |
| Push Notifications (Mobile) | Pending | Native push notifications |

### Phase 9: Analytics & Insights

| Feature | Status | Description |
|---------|--------|-------------|
| Analytics Dashboard | ✅ Done | `/dashboard/analytics` - Advanced analytics |
| Trend Analysis | ✅ Done | Case volume trends over time |
| Resident Comparison | ✅ Done | Compare residents in same program |
| Program Benchmarks | ✅ Done | Compare against national averages |
| Predictive Analytics | Pending | Predict completion dates for milestones |
| Custom Dashboards | ✅ Done | Program directors can customize views |
| Data Visualization | ✅ Done | Charts, graphs, heat maps |

### Phase 10: Developer & Integration

| Feature | Status | Description |
|---------|--------|-------------|
| Public API | ✅ Done | REST API for third-party integrations |
| API Authentication | ✅ Done | API keys for Pro/Enterprise |
| Webhooks | ✅ Done | Real-time event notifications |
| OAuth 2.0 | ✅ Done | Third-party app authorization |
| GraphQL API | ✅ Done | Alternative API for complex queries |
| SDKs | ✅ Done | Official SDKs for common languages |
| Integration Marketplace | ✅ Done | Partner integrations (ERPs, LMS) |

### Phase 11: Portfolio & Career

| Feature | Status | Description |
|---------|--------|-------------|
| CV Generator | ✅ Done | Auto-generate professional CV |
| Portfolio Page | ✅ Done | Public/sharable portfolio |
| Procedure Summary | ✅ Done | Procedure counts by category |
| Milestone Transcript | ✅ Done | Official milestone completion record |
| Reference Letters | ✅ Done | Request/reference workflow |
| Conference Abstracts | ✅ Done | Track presentations/publications |

---

## Recommended Features (Not Yet Implemented)

### High Priority

#### 1. Stripe Integration
- **Description**: Connect subscription system to Stripe for actual payment processing
- **Files needed**:
  - `src/app/api/subscription/checkout/route.ts` - Create checkout sessions
  - `src/app/api/subscription/webhook/route.ts` - Handle Stripe webhooks
  - `src/app/api/subscription/portal/route.ts` - Customer portal
- **Environment variables**:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

#### 2. Resident Progress Dashboard (Enhanced)
- **Description**: More detailed progress tracking with milestone assessments
- **Add**:
  - `/api/milestones` - Milestone definitions API
  - `/api/milestone-assessments` - Submit/view milestone ratings
  - Interactive milestone grid (1-5 levels)
  - Competency evaluations

#### 3. Reports API
- **Description**: Generate compliance reports for ACGME
- **Endpoints**:
  - `/api/reports/case-volume` - Monthly case volume
  - `/api/reports/minimums` - Case minimums compliance
  - `/api/reports/resident-summary` - Individual resident reports

#### 4. AI Gap Analysis (Production Ready)
- **Description**: Move from basic implementation to production
- **Add**:
  - Provider configuration (OpenAI, Anthropic, local models)
  - Rate limiting
  - Usage tracking per resident
  - Cost optimization

### Medium Priority

#### 5. Custom Branding (Pro/Enterprise)
- **Description**: Allow institutions to customize appearance
- **Add**:
  - Logo upload
  - Custom colors
  - Custom email templates

#### 6. SSO/SAML Integration
- **Description**: Enterprise single sign-on
- **Providers**: Okta, Azure AD, Google Workspace, OneLogin
- **Add**:
  - SAML configuration UI
  - SCIM provisioning
  - Just-in-time user provisioning

#### 7. Notifications System
- **Description**: In-app and email notifications
- **Types**:
  - Case verification reminders
  - Milestone assessment due
  - Subscription renewal
  - Daily/weekly case logging reminders

#### 8. Audit Logs
- **Description**: Track all user actions for compliance
- **Log**:
  - Case modifications
  - Verification actions
  - Admin changes

### Lower Priority

#### 9. Mobile App
- **Description**: iOS/Android apps for case logging
- **Features**:
  - Offline case entry
  - Photo capture
  - Voice notes

#### 10. Analytics Dashboard
- **Description**: Advanced analytics for program directors
- **Features**:
  - Trend analysis
  - Comparison across residents
  - Predictive analytics

#### 11. API Access (Pro/Enterprise)
- **Description**: REST API for third-party integrations
- **Endpoints**:
  - Programmatic case submission
  - Bulk data export
  - Custom reports

#### 12. CV/Portfolio Export
- **Description**: Generate professional portfolios
- **Formats**: PDF, Word, HTML
- **Include**: Case logs, procedures, milestones, certifications

---

## Database Schema (Current & Planned)

### Subscription Tables (Phase 1 - Done)
```
subscription_plans
institution_subscriptions
usage_records
feature_flags
invoices
```

### ACGME Tables (Phase 2 - Done)
```
procedure_codes (516 CPT codes)
diagnosis_codes (213 ICD-10 codes)
case_codes
case_diagnoses
case_minimums (19 categories)
resident_progress
milestone_definitions (14 milestones)
milestone_assessments
competency_evaluations
program_requirements
assessment_templates
```

### Multi-Country Tables (Phase 3 - Done)
```
country_config (15 countries)
```

### Payment Tables (Phase 4 - Planned)
```
stripe_customers
stripe_subscriptions
stripe_invoices
stripe_products
```

### Notification Tables (Phase 7 - Planned)
```
notifications
notification_preferences
email_queue
push_subscriptions
```

### Analytics Tables (Phase 9 - Planned)
```
analytics_events
dashboard_configs
report_schedules
```

### Portfolio Tables (Phase 11 - Planned)
```
portfolios
cv_templates
references
```

---

## API Endpoints (Current & Planned)

### Completed
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription/plans` | GET | List subscription plans |
| `/api/subscription/usage` | GET/POST | Track usage |
| `/api/subscription/checkout` | POST | Create Stripe checkout session |
| `/api/subscription/portal` | GET/POST | Get/manage subscription |
| `/api/subscription/webhook` | POST | Handle Stripe webhooks |
| `/api/reports` | GET/POST | ACGME compliance reports (all types) |
| `/api/codes` | GET | Search CPT/ICD-10 codes |
| `/api/countries` | GET | List country configs |
| `/api/progress` | GET/POST | Resident progress |

### Phase 4: Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invoices` | GET | List user invoices |

### Phase 5: Reports (Now Complete)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports?type=case_volume` | GET | Case volume by month/category |
| `/api/reports?type=minimums` | GET | Case minimums compliance |
| `/api/reports?type=resident_summary` | GET | Individual resident report |
| `/api/reports?type=milestone` | GET | Milestone completion report |
| `/api/reports/export` | POST | Export report to PDF/CSV |

### Phase 6: AI
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/config` | GET/PUT | AI provider configuration |
| `/api/ai/usage` | GET | AI usage analytics |
| `/api/ai/suggestions` | GET | Smart case suggestions |

### Phase 7: Notifications
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET/POST | List/create notifications |
| `/api/notifications/preferences` | PUT | Update notification settings |
| `/api/notifications/read` | PUT | Mark as read |

### Phase 10: Developer API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cases` | GET/POST | List/create cases |
| `/api/v1/cases/[id]` | GET/PUT/DELETE | Manage case |
| `/api/v1/progress` | GET | Get resident progress |
| `/api/v1/reports` | GET | Generate reports |
| `/api/v1/webhooks` | GET/POST | Manage webhook endpoints |

---

## Pages (Current & Planned)

### Completed
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| Pricing | `/pricing` | Subscription plans |
| Progress | `/progress` | Resident progress dashboard |
| Login | `/login` | Authentication |
| Register | `/register` | Sign up |
| Dashboard | `/dashboard` | Main dashboard |
| Cases | `/cases` | Case list |
| Settings | `/settings` | User settings |

### Phase 4: Enterprise
| Page | Route | Description |
|------|-------|-------------|
| Billing | `/settings?tab=billing` | Subscription & payment management |

### Phase 5: Reports (Now Complete)
| Page | Route | Description |
|------|-------|-------------|
| Reports | `/institution/reports` | Monthly/annual reports |
| Compliance | `/institution/compliance` | ACGME compliance |

### Phase 7: Notifications
| Page | Route | Description |
|------|-------|-------------|
| Notifications | `/notifications` | Notification center |

### Phase 9: Analytics
| Page | Route | Description |
|------|-------|-------------|
| Analytics | `/dashboard/analytics` | Advanced analytics |

### Phase 11: Portfolio
| Page | Route | Description |
|------|-------|-------------|
| Portfolio | `/portfolio` | Public portfolio |
| CV Builder | `/portfolio/cv` | CV generator |

---

## Technology Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Container**: Docker, Docker Compose

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# Stripe (for payments)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Next Steps (Immediate Priorities)

### 1. Phase 4: Stripe Integration (Critical)
- Create checkout, webhook, and portal endpoints
- Connect Free/Basic/Pro plans to Stripe
- Test payment flow end-to-end
- **Effort**: 2-3 days

### 2. Phase 5: Reports API (Compliance Required)
- Build case volume, minimums, resident summary endpoints
- Add PDF/CSV export functionality
- Create reports dashboard page
- **Effort**: 3-4 days

### 3. Phase 6: AI Production Ready
- Add provider configuration UI
- Implement rate limiting
- Track usage per resident
- **Effort**: 3-4 days

### 4. Phase 7: Notifications
- Build notification system
- Add email integration
- Create notification preferences
- **Effort**: 2-3 days

### 5. Phase 9: Analytics Dashboard
- Enhance existing analytics
- Add program-wide insights
- Create comparison features
- **Effort**: 4-5 days

---

## Implementation Order

```
Phase 1-3 (Done)
    ↓
Phase 4: Payments ← START HERE
    ↓
Phase 5: Reports
    ↓
Phase 6: AI
    ↓
Phase 7: Notifications
    ↓
Phase 8: Mobile (Optional)
    ↓
Phase 9: Analytics
    ↓
Phase 10: Developer API
    ↓
Phase 11: Portfolio
```

---

## Notes

- **Phase 1-3**: Core features complete ✅
- **Phase 4-7**: High priority - essential for SaaS business
- **Phase 8**: Optional - depends on user demand
- **Phase 9-11**: Growth features - enhance user value
- All 516 CPT surgical codes and 213 ICD-10 codes are seeded
- 14 ACGME milestones and 19 case minimums configured
- 15-country configuration ready
- Frontend pages for pricing and progress created
- Plan covers MVP to Enterprise SaaS deployment
