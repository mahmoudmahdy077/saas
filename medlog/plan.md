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
| Stripe Integration | 🔄 In Progress | Connect subscription system to Stripe for payment processing |
| Checkout Sessions | Pending | `/api/subscription/checkout` - Create checkout sessions |
| Webhook Handler | Pending | `/api/subscription/webhook` - Handle Stripe webhooks |
| Customer Portal | Pending | `/api/subscription/portal` - Self-serve billing management |
| Invoice Generation | Pending | Automated monthly/yearly invoices |
| Usage-Based Billing | Pending | Track overages for AI analyses, storage, cases |
| Custom Branding | Pending | Logo upload, custom colors, white-label options |
| SSO/SAML Integration | Pending | Okta, Azure AD, Google Workspace, OneLogin |
| SCIM Provisioning | Pending | Automated user provisioning/deprovisioning |

### Phase 5: Advanced Reporting & Compliance

| Feature | Status | Description |
|---------|--------|-------------|
| Reports API | Pending | `/api/reports/*` - ACGME compliance reports |
| Case Volume Report | Pending | Monthly/quarterly case volume by category |
| Case Minimums Report | Pending | Compliance status for all residents |
| Resident Summary Report | Pending | Individual resident progress reports |
| Milestone Report | Pending | Program-wide milestone completion |
| Audit Logs | Pending | Track all user actions for compliance |
| Export Formats | Pending | PDF, CSV, Excel exports |
| Scheduled Reports | Pending | Auto-generate and email reports |

### Phase 6: AI & Intelligence

| Feature | Status | Description |
|---------|--------|-------------|
| AI Provider Config | Pending | Support for OpenAI, Anthropic, local models |
| Rate Limiting | Pending | Per-user, per-institution rate limits |
| Cost Optimization | Pending | Track and optimize AI usage costs |
| AI Usage Analytics | Pending | Dashboard for AI usage by resident |
| Gap Analysis (Prod) | Pending | Enhanced AI-powered case gap analysis |
| Smart Suggestions | Pending | Recommend cases based on milestones |
| Auto-Coding | Pending | Suggest CPT/ICD-10 codes from case notes |

### Phase 7: Engagement & Notifications

| Feature | Status | Description |
|---------|--------|-------------|
| Notifications System | Pending | In-app notification center |
| Email Notifications | Pending | Case reminders, milestones, billing |
| Push Notifications | Pending | Mobile push notifications |
| Case Reminders | Pending | Daily/weekly logging reminders |
| Verification Reminders | Pending | Remind consultants to verify cases |
| Milestone Alerts | Pending | Notify when assessments are due |
| Streak Reminders | Pending | Encourage consistent logging |
| Subscription Alerts | Pending | Renewal, upgrade, payment reminders |

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
| Analytics Dashboard | Pending | `/dashboard/analytics` - Advanced analytics |
| Trend Analysis | Pending | Case volume trends over time |
| Resident Comparison | Pending | Compare residents in same program |
| Program Benchmarks | Pending | Compare against national averages |
| Predictive Analytics | Pending | Predict completion dates for milestones |
| Custom Dashboards | Pending | Program directors can customize views |
| Data Visualization | Pending | Charts, graphs, heat maps |

### Phase 10: Developer & Integration

| Feature | Status | Description |
|---------|--------|-------------|
| Public API | Pending | REST API for third-party integrations |
| API Authentication | Pending | API keys for Pro/Enterprise |
| Webhooks | Pending | Real-time event notifications |
| OAuth 2.0 | Pending | Third-party app authorization |
| GraphQL API | Pending | Alternative API for complex queries |
| SDKs | Pending | Official SDKs for common languages |
| Integration Marketplace | Pending | Partner integrations (ERPs, LMS) |

### Phase 11: Portfolio & Career

| Feature | Status | Description |
|---------|--------|-------------|
| CV Generator | Pending | Auto-generate professional CV |
| Portfolio Page | Pending | Public/sharable portfolio |
| Procedure Summary | Pending | Procedure counts by category |
| Milestone Transcript | Pending | Official milestone completion record |
| Reference Letters | Pending | Request/reference workflow |
| Conference Abstracts | Pending | Track presentations/publications |

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
| `/api/codes` | GET | Search CPT/ICD-10 codes |
| `/api/countries` | GET | List country configs |
| `/api/progress` | GET/POST | Resident progress |

### Phase 4: Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscription/checkout` | POST | Create Stripe checkout session |
| `/api/subscription/portal` | GET | Create customer portal session |
| `/api/subscription/webhook` | POST | Handle Stripe webhooks |
| `/api/invoices` | GET | List user invoices |

### Phase 5: Reports
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/case-volume` | GET | Case volume by month/category |
| `/api/reports/minimums` | GET | Case minimums compliance |
| `/api/reports/resident-summary` | GET | Individual resident report |
| `/api/reports/milestones` | GET | Milestone completion report |
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
| Billing | `/settings/billing` | Subscription & payment management |
| Branding | `/settings/branding` | Custom branding settings |

### Phase 5: Reports
| Page | Route | Description |
|------|-------|-------------|
| Reports | `/reports` | Report dashboard |
| Case Volume | `/reports/case-volume` | Case volume analytics |
| Compliance | `/reports/compliance` | ACGME compliance |

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

## Next Steps (Immediate)

1. **Add Stripe integration** - Most critical for SaaS monetization
2. **Create Reports API** - Needed for program compliance
3. **Enhance Progress page** - Add milestone assessments
4. **Add Notifications** - Improve user engagement
5. **Create Audit Logs** - Required for ACGME compliance

---

## Notes

- All Phase 1 & Phase 2 core features are implemented
- 516 CPT surgical codes and 213 ICD-10 codes are seeded
- 14 ACGME milestones and 19 case minimums configured
- 15-country configuration ready
- Frontend pages for pricing and progress created
