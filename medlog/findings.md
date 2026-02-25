# MedLog - Research Findings

## Market Research
- **ACGME Case Logs**: US official system - clunky, required for US residencies
- **Logitbox**: UK NHS-focused, comprehensive but not AI-powered
- **VitreOS**: Free, retina-focused platform
- **iSBERGDATA**: Canadian solution (EXPERTIS/PRAKTIK)

## Differentiation
- AI-powered analysis and gap analysis
- CV-ready exports
- Duolingo-style engagement notifications
- Institution management with specialty templates

## Technical Research

### Stack Decision
- **Web**: Next.js + Tailwind CSS
- **Mobile**: React Native / Expo
- **Database**: Supabase (self-hosted)
- **AI**: Ollama (self-hosted) + OpenAI API fallback
- **Storage**: MinIO (S3-compatible)
- **Reverse Proxy**: Traefik

### Docker Components
- nextjs-web
- supabase (postgres + kong + storage)
- minio
- ollama (later phase)
- traefik

## Constraints
- Medical data sensitivity - HIPAA/GDPR compliance needed
- Offline-first for mobile (hospital connectivity issues)
- Need customizable templates per specialty
