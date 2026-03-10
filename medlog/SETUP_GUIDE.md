# 🚀 MedLog - Production Setup Guide

## ⚠️ Security Warning

**DO NOT commit `.env` files to Git!** The `.env` file should be in `.gitignore` and contain real secrets only on production servers.

---

## 🔐 Environment Variables Setup

### 1. Supabase Configuration

Create a project at [supabase.com](https://supabase.com)

```bash
# Get these from Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc... (anon/public key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (service role - KEEP SECRET!)
```

### 2. Generate Secure Secrets

```bash
# NextAuth Secret (32+ random characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Stripe Configuration

```bash
# Get from Stripe Dashboard → Developers → API Keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_BASIC=price_...
STRIPE_PRICE_ID_PRO=price_...
```

### 4. Production .env Template

```bash
# Database (Supabase handles this)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Authentication
NEXTAUTH_SECRET=<generate-secure-random-string>
NEXTAUTH_URL=https://medlog.app

# Payments
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_ID_BASIC=price_xxxxx
STRIPE_PRICE_ID_PRO=price_xxxxx

# Storage (Supabase Storage or S3)
STORAGE_BUCKET=medlog-cases
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# AI Features (Optional)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email (Resend, SendGrid, etc.)
EMAIL_FROM=noreply@medlog.app
RESEND_API_KEY=re_xxxxx

# Monitoring
SENTRY_DSN=https://xxxxx@oxxxxx.ingest.sentry.io/xxxxx

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://medlog.app
```

---

## 🛡️ Security Checklist

### Before Production

- [ ] All secrets rotated from defaults
- [ ] `.env` file in `.gitignore`
- [ ] Database RLS policies enabled
- [ ] API rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers set (already in middleware.ts)
- [ ] CORS configured for production domain
- [ ] Error messages don't leak sensitive info
- [ ] File upload limits set
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### Database Security

```sql
-- Enable RLS on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Create policies (example)
CREATE POLICY "Users can view own cases"
ON cases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
ON cases FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 📦 Installation

### Web App

```bash
cd medlog/web
npm install
npm run build
npm run start
```

### Mobile App

```bash
cd medlog/mobile
npm install
npx expo start
```

---

## 🐳 Docker Deployment

### Build & Run

```bash
cd medlog
docker-compose up -d
```

### Production Docker

```bash
# Build production image
docker build -t medlog-web:latest .

# Run with env file
docker run -d \
  -p 3000:3000 \
  --env-file .env.production \
  --name medlog \
  medlog-web:latest
```

---

## 📊 Monitoring Setup

### Health Check Endpoint

```bash
curl https://medlog.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "stripe": "connected",
  "version": "1.0.0"
}
```

### Uptime Monitoring

Set up monitoring at:
- [Uptime Kuma](https://uptime.kuma.pet/) (self-hosted)
- [UptimeRobot](https://uptimerobot.com/) (free tier)
- [Pingdom](https://www.pingdom.com/) (paid)

Monitor:
- Homepage (/)
- API health (/api/health)
- Login page (/login)
- Dashboard (/dashboard)

---

## 🔄 Deployment Workflow

### Staging

1. Push to `staging` branch
2. GitHub Actions runs tests
3. Auto-deploy to staging.medlog.app
4. Manual QA testing

### Production

1. Create PR from `staging` to `main`
2. Code review required
3. All tests must pass
4. Manual approval
5. Deploy to medlog.app
6. Monitor for 1 hour

---

## 🆘 Emergency Procedures

### Rollback

```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or use Docker
docker stop medlog
docker run medlog-web:previous-tag
```

### Database Backup

```bash
# Supabase automatic backups (check settings)
# Manual backup
pg_dump -h db.xxxxx.supabase.co -U postgres medlog > backup.sql
```

### Incident Response

1. Acknowledge alert
2. Assess impact
3. Rollback if needed
4. Fix issue in staging
5. Deploy fix
6. Post-mortem document

---

## 📞 Support

- **Technical Issues:** Check logs in `/logs`
- **Database Issues:** Supabase Dashboard
- **Payment Issues:** Stripe Dashboard
- **Domain/DNS:** Your domain provider

---

*Last Updated: 2026-03-09*
*Version: 1.0.0*
