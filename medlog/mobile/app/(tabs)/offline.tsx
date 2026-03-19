import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function OfflineMode() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCases, setPendingCases] = useState<any[]>([])

  useEffect(() => {
    const checkConnection = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', checkConnection)
    window.addEventListener('offline', checkConnection)
    return () => {
      window.removeEventListener('online', checkConnection)
      window.removeEventListener('offline', checkConnection)
    }
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Offline Mode</Text>
        <Badge variant={isOnline ? 'success' : 'destructive'}>
          <Text style={styles.badgeText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </Badge>
      </View>

      <Card style={styles.statusCard}>
        <Ionicons name={isOnline ? 'cloud-done' : 'cloud-offline'} size={48} color={isOnline ? '#34C759' : '#FF3B30'} />
        <Text style={styles.statusText}>{isOnline ? 'Connected' : 'Working Offline'}</Text>
        <Text style={styles.subtext}>{pendingCases.length} cases pending sync</Text>
      </Card>

      {!isOnline && (
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.infoText}>You can continue logging cases offline. They will sync when you're back online.</Text>
        </Card>
      )}

      <Button style={styles.syncButton} disabled={isOnline || pendingCases.length === 0}>
        <Ionicons name="refresh" size={20} color="#FFF" />
        <Text style={styles.syncButtonText}>Sync Now</Text>
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  statusCard: { margin: 16, padding: 32, alignItems: 'center' },
  statusText: { fontSize: 18, fontWeight: 'bold', marginTop: 16 },
  subtext: { fontSize: 14, color: '#666', marginTop: 8 },
  infoCard: { margin: 16, padding: 16, flexDirection: 'row', alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 14 },
  syncButton: { margin: 16, flexDirection: 'row', justifyContent: 'center', paddingVertical: 16 },
  syncButtonText: { color: '#FFF', fontWeight: '600', marginLeft: 8 },
})
