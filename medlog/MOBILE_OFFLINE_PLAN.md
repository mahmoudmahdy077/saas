# MedLog Mobile - Offline Mode Implementation Plan

**Priority:** P0 (Enterprise Requirement)  
**Timeline:** 2-3 weeks  
**Status:** Ready to Implement

---

## 🎯 Goals

1. **Full Offline Capability** - Log cases without internet
2. **Auto-Sync** - Sync when connection restored
3. **Conflict Resolution** - Handle sync conflicts gracefully
4. **Local Storage** - Store cases, user data, templates locally

---

## 📦 Tech Stack

### Database: WatermelonDB
```bash
npm install @nozbe/watermelondb @nozbe/with-observables
```

**Why WatermelonDB:**
- Built for React Native
- Lazy loading (fast performance)
- Offline-first architecture
- Automatic sync support
- 10x faster than SQLite

### Sync Engine: Custom
- REST API sync with queue
- Background sync (expo-background-fetch)
- Conflict resolution strategies

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    MedLog Mobile                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   UI Layer   │◄───────►│  Components  │             │
│  │  (React Native)│       │   (Screens)  │             │
│  └──────────────┘         └──────────────┘             │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌──────────────┐         ┌──────────────┐             │
│  │  WatermelonDB│◄───────►│  Sync Engine │             │
│  │  (Local DB)  │         │  (Queue + API)│            │
│  └──────────────┘         └──────────────┘             │
│           │                        │                    │
│           ▼                        ▼                    │
│  ┌──────────────┐         ┌──────────────┐             │
│  │   SQLite     │         │  Background  │             │
│  │  (Storage)   │         │    Sync      │             │
│  └──────────────┘         └──────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
           │                        │
           ▼                        ▼
      Offline Mode           Online Mode
      (Local Only)          (Sync Enabled)
```

---

## 📊 Database Schema

### Models

#### Case (cases table)
```typescript
class Case extends Model {
  static table = 'cases'
  
  @field('case_number') caseNumber!: string
  @field('date') date!: string
  @field('procedure_type') procedureType!: string
  @field('category') category!: string
  @field('subcategory') subcategory!: string
  @field('role') role!: string
  @field('diagnosis') diagnosis!: string
  @field('complications') complications!: string
  @field('notes') notes!: string
  @field('patient_demographics') patientDemographics!: string // JSON
  @field('custom_fields') customFields!: string // JSON
  @field('verification_status') verificationStatus!: string
  @field('synced') synced!: boolean
  @field('created_at') createdAt!: Date
  @field('updated_at') updatedAt!: Date
}
```

#### User (users table)
```typescript
class User extends Model {
  static table = 'users'
  
  @field('user_id') userId!: string
  @field('email') email!: string
  @field('name') name!: string
  @field('institution_id') institutionId!: string
  @field('role') role!: string
  @field('specialty') specialty!: string
  @field('year') year!: number
  @field('avatar_url') avatarUrl!: string
  @field('last_sync') lastSync!: Date
}
```

#### SyncQueue (sync_queue table)
```typescript
class SyncQueue extends Model {
  static table = 'sync_queue'
  
  @field('operation') operation!: 'create' | 'update' | 'delete'
  @field('model_type') modelType!: 'case' | 'user' | 'profile'
  @field('model_id') modelId!: string
  @field('payload') payload!: string // JSON
  @field('priority') priority!: number
  @field('retry_count') retryCount!: number
  @field('created_at') createdAt!: Date
}
```

---

## 🔄 Sync Strategy

### 1. Optimistic UI Updates
```typescript
// User creates case offline
async function createCase(caseData) {
  // 1. Save to local DB immediately
  const localCase = await database.write(async () => {
    return casesCollection.create(case => {
      case.caseNumber = generateId()
      case.date = caseData.date
      // ... set all fields
      case.synced = false
    })
  })

  // 2. Add to sync queue
  await syncQueue.add({
    operation: 'create',
    modelType: 'case',
    modelId: localCase.id,
    payload: caseData,
    priority: 1
  })

  // 3. Update UI immediately (optimistic)
  return localCase
}
```

### 2. Background Sync
```typescript
// Sync when connection restored
async function syncPendingChanges() {
  const pending = await syncQueue.getAllPending()
  
  for (const item of pending) {
    try {
      await api[item.operation](item.modelType, item.payload)
      
      // Mark as synced
      await database.write(async () => {
        const record = await getModel(item.modelType, item.modelId)
        record.synced = true
      })
      
      // Remove from queue
      await syncQueue.remove(item.id)
    } catch (error) {
      // Retry logic
      if (item.retryCount < 3) {
        item.retryCount++
        await syncQueue.update(item)
      } else {
        // Notify user of sync failure
        notifySyncFailure(item)
      }
    }
  }
}
```

### 3. Conflict Resolution
```typescript
// Last-write-wins with user notification
async function handleConflict(localCase, remoteCase) {
  if (localCase.updatedAt > remoteCase.updatedAt) {
    // Local is newer, keep local
    return localCase
  } else {
    // Remote is newer, ask user
    const choice = await showConflictDialog(localCase, remoteCase)
    return choice === 'local' ? localCase : remoteCase
  }
}
```

---

## 📱 UI Components

### Offline Indicator
```tsx
<OfflineIndicator />
// Shows when offline
// Shows sync status when reconnecting
```

### Sync Status Modal
```tsx
<SyncStatusModal 
  pending={pendingCount}
  syncing={isSyncing}
  lastSync={lastSyncTime}
/>
```

### Case List (with sync status)
```tsx
<CaseList>
  <CaseCard 
    case={case}
    syncBadge={case.synced ? null : <PendingSyncBadge />}
  />
</CaseList>
```

---

## 🚀 Implementation Steps

### Week 1: Foundation
- [ ] Install WatermelonDB
- [ ] Set up database schema
- [ ] Create models (Case, User, SyncQueue)
- [ ] Basic CRUD operations
- [ ] Offline indicator component

### Week 2: Sync Engine
- [ ] Sync queue implementation
- [ ] API sync functions
- [ ] Background sync (expo-background-fetch)
- [ ] Conflict resolution
- [ ] Error handling & retry logic

### Week 3: Polish
- [ ] Sync status UI
- [ ] Offline mode UX improvements
- [ ] Performance optimization
- [ ] Testing (offline scenarios)
- [ ] Documentation

---

## 📊 Performance Targets

| Metric | Target |
|--------|--------|
| App Launch | <2 seconds |
| Case Load (100 cases) | <500ms |
| Sync (100 pending) | <10 seconds |
| Storage (1000 cases) | <50MB |
| Battery Impact | <5% per day |

---

## 🧪 Testing Scenarios

1. **Offline Case Creation**
   - Go offline
   - Create 10 cases
   - Verify saved locally
   - Go online
   - Verify sync to server

2. **Conflict Resolution**
   - Create case offline
   - Edit same case on web
   - Sync
   - Verify conflict dialog appears

3. **Background Sync**
   - Create cases offline
   - Close app
   - Open app (should auto-sync)
   - Verify all cases synced

4. **Large Dataset**
   - Load 1000 cases
   - Scroll performance
   - Search performance
   - Memory usage

---

## 💡 Enterprise Features

### Multi-Device Sync
- Same user on phone + tablet
- Changes sync across devices
- Conflict resolution across devices

### Institutional Sync
- Pre-download case templates
- Pre-download procedure lists
- Cache institution-specific data

### Compliance Mode
- Audit trail for offline edits
- Timestamp verification
- Signature capture (offline)

---

**Status:** Plan Approved  
**Next:** Start Week 1 Implementation
