# MedLog - Project Constitution

## Data Schemas

### User
```json
{
  "id": "uuid",
  "email": "string",
  "full_name": "string",
  "role": "resident | consultant | program_director | institution_admin",
  "specialty_id": "uuid | null",
  "institution_id": "uuid | null",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "notification_settings": {
    "reminder_enabled": "boolean",
    "reminder_time": "string (HH:MM)",
    "vacation_mode": "boolean"
  }
}
```

### Institution
```json
{
  "id": "uuid",
  "name": "string",
  "created_at": "timestamp",
  "admin_id": "uuid"
}
```

### Specialty Department
```json
{
  "id": "uuid",
  "institution_id": "uuid",
  "name": "string",
  "description": "string",
  "created_at": "timestamp"
}
```

### Case (Universal Template)
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "specialty_id": "uuid",
  "template_id": "uuid",
  "date": "date",
  "procedure_type": "string",
  "category": "string",
  "subcategory": "string",
  "role": "primary | assistant | observer",
  "patient_demographics": {
    "age": "number",
    "gender": "string"
  },
  "diagnosis": "string",
  "complications": "string[]",
  "notes": "text",
  "custom_fields": "json",
  "ai_summary": "text",
  "verification_status": "self | consultant_verified | pd_approved",
  "verified_by": "uuid | null",
  "verified_at": "timestamp | null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Case Template
```json
{
  "id": "uuid",
  "name": "string",
  "type": "universal | specialty | institution",
  "owner_id": "uuid",
  "fields": [
    {
      "name": "string",
      "label": "string",
      "type": "text | number | date | select | multiselect",
      "required": "boolean",
      "options": "string[]"
    }
  ],
  "created_at": "timestamp"
}
```

### Share Link
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "token": "string",
  "type": "time_limited | permanent | password_protected",
  "expires_at": "timestamp | null",
  "password_hash": "string | null",
  "permissions": "view | edit | export",
  "access_count": "number",
  "created_at": "timestamp"
}
```

### Report (Monthly/Annual)
```json
{
  "id": "uuid",
  "resident_id": "uuid",
  "program_director_id": "uuid",
  "type": "monthly | annual",
  "period": "string (YYYY-MM)",
  "case_count": "number",
  "ai_insights": "text",
  "grades": "json",
  "pd_notes": "text",
  "created_at": "timestamp"
}
```

---

## Behavioral Rules

### Authentication
- Email/password registration with email verification
- Google OAuth optional
- Role assigned after signup (default: resident)
- Specialty selection required for residents

### Case Verification Flow
1. Resident logs case (status: self)
2. Resident requests verification from Consultant
3. Consultant reviews and verifies (status: consultant_verified)
4. PD can further approve (status: pd_approved)

### Notification Rules
- Daily reminder at user-configured time (default: 21:00)
- "Fire" notification 2 hours before reminder
- Skip weekends if configured
- Vacation mode pauses notifications

### Share Link Rules
- Time-limited: 1-30 days expiry
- Password: bcrypt hashed
- Permissions: view only, edit, export
- Track all access attempts

### Template Rules
- Universal template: System-created, cannot be deleted
- Specialty template: Created by PD, scoped to specialty
- Institution template: Created by Institution Admin

---

## Architectural Invariants

1. **Data Isolation**: Users can only see their own cases unless verified/assigned
2. **Verification Chain**: Cannot skip verification levels
3. **Template Inheritance**: Cases use template active at time of creation
4. **Audit Trail**: All case modifications tracked with timestamps
5. **Export Integrity**: CSV exports include verification status

---

## API Endpoints (Phase 1)

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/user

### Cases
- GET /api/cases (list with filters)
- POST /api/cases (create)
- GET /api/cases/:id
- PUT /api/cases/:id
- DELETE /api/cases/:id

### Export
- GET /api/cases/export (CSV)

### AI
- POST /api/ai/summarize (basic summary)
