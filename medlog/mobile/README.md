# MedLog Mobile App

A comprehensive medical case logging mobile application built with Expo and React Native.

## Features

### Authentication
- Email/password login
- Biometric authentication (Face ID / Fingerprint)
- Password reset flow
- Secure session management

### User Roles & Navigation

The app uses role-based navigation with 5 different entry points:

| Role | Navigation | Features |
|------|------------|----------|
| Resident | (main) | Dashboard, Cases, Progress, Reports, Portfolio, References |
| Consultant | (consultant) | Dashboard, Verify Cases, Case Review |
| Program Director | (program_director) | Residents, Reports, Milestones |
| Institution Admin | (institution_admin) | Users, Billing, Templates, Settings |
| Super Admin | (super_admin) | Institutions, Audit Logs, Plans, System |

### Core Features

#### Case Management
- Create new cases with CPT/ICD-10 codes
- View case list with status indicators
- Case detail view with verification workflow
- Search and filter cases

#### Progress Tracking
- Milestone progress visualization
- Case volume charts (Line, Bar, Pie)
- Streak tracking

#### Reports
- Case distribution charts
- Monthly case trends
- Export capabilities

#### Portfolio
- Procedure summary
- QR code sharing
- Publication tracking

#### Admin Panels
- Resident management
- User invitation
- Billing management
- SSO/SAML configuration
- API keys & webhooks
- Audit logs

## Tech Stack

- **Framework**: Expo SDK 50
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Database**: Supabase
- **Charts**: react-native-chart-kit
- **Authentication**: expo-local-authentication
- **Secure Storage**: expo-secure-store

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

```bash
cd mobile
npm install
```

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Running

```bash
# Development
npm start

# Android
npm run android

# iOS
npm run ios
```

## Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (main)/            # Resident screens
│   ├── (consultant)/      # Consultant screens
│   ├── (program_director)/ # PD screens
│   ├── (institution_admin)/ # Admin screens
│   └── (super_admin)/     # Super admin screens
├── lib/
│   ├── stores/            # Zustand stores
│   │   ├── authStore.ts   # Authentication state
│   │   ├── appStore.ts    # App state
│   │   └── casesStore.ts  # Cases state
│   └── utils/
│       └── biometric.ts   # Biometric utilities
├── components/            # Reusable components
└── assets/                # Images, fonts, etc.
```

## Role Permissions

| Feature | Resident | Consultant | PD | Admin | Super Admin |
|---------|----------|------------|-----|-------|-------------|
| Add Cases | ✅ | ❌ | ❌ | ❌ | ❌ |
| Verify Cases | ❌ | ✅ | ✅ | ✅ | ✅ |
| View All Residents | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ✅ |

## Database Schema

Key tables:
- `profiles` - User profiles with roles
- `cases` - Medical case records
- `institutions` - Institution data
- `specialties` - Medical specialties
- `milestones` - ACGME milestones
- `audit_logs` - Action tracking

## Security

- RLS (Row Level Security) policies on all tables
- Secure token storage with expo-secure-store
- Biometric authentication support
- Rate limiting on API endpoints

## License

Proprietary - MedLog
