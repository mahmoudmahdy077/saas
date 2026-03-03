import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEYS = {
  OFFLINE_CASES: 'offline_cases',
  LAST_SYNC: 'last_sync',
  PENDING_SYNC: 'pending_sync',
}

export interface OfflineCase {
  id?: string
  title: string
  date: string
  category: string
  diagnosis: string
  description: string
  role: string
  procedure_type: string
  created_at: string
  synced?: boolean
}

export const OfflineStorage = {
  async saveCase(caseData: OfflineCase): Promise<void> {
    try {
      const existing = await this.getCases()
      const newCase = { ...caseData, id: `temp_${Date.now()}`, synced: false }
      existing.push(newCase)
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_CASES, JSON.stringify(existing))
      
      const pending = await this.getPendingSync()
      pending.push(newCase.id)
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending))
    } catch (error) {
      console.error('Error saving case offline:', error)
    }
  },

  async getCases(): Promise<OfflineCase[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_CASES)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error getting offline cases:', error)
      return []
    }
  },

  async getPendingSync(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error getting pending sync:', error)
      return []
    }
  },

  async markSynced(caseId: string): Promise<void> {
    try {
      const cases = await this.getCases()
      const updated = cases.map(c => 
        c.id === caseId ? { ...c, synced: true } : c
      )
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_CASES, JSON.stringify(updated))
      
      const pending = await this.getPendingSync()
      const filtered = pending.filter(id => id !== caseId)
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error marking case as synced:', error)
    }
  },

  async getUnsyncedCases(): Promise<OfflineCase[]> {
    const cases = await this.getCases()
    return cases.filter(c => !c.synced)
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.OFFLINE_CASES,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.PENDING_SYNC,
      ])
    } catch (error) {
      console.error('Error clearing offline storage:', error)
    }
  },

  async setLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    } catch (error) {
      console.error('Error setting last sync:', error)
    }
  },

  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)
    } catch (error) {
      console.error('Error getting last sync:', error)
      return null
    }
  },
}
