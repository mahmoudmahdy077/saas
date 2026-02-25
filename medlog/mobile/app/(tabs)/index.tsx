import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Stats {
  totalCases: number
  thisMonth: number
  verified: number
  pending: number
}

interface RecentCase {
  id: string
  procedure_type: string
  category: string
  date: string
  verification_status: string
}

export default function DashboardScreen() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({ totalCases: 0, thisMonth: 0, verified: 0, pending: 0 })
  const [recentCases, setRecentCases] = useState<RecentCase[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, casesRes] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/cases-stats`, {
          headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
        }),
        fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/cases?select=*&order=date.desc&limit=5`, {
          headers: { Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` }
        }),
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (casesRes.ok) setRecentCases(await casesRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const statCards = [
    { name: 'Total Cases', value: stats.totalCases, icon: 'file-document', color: '#3b82f6' },
    { name: 'This Month', value: stats.thisMonth, icon: 'calendar-month', color: '#22c55e' },
    { name: 'Verified', value: stats.verified, icon: 'check-circle', color: '#14b8a6' },
    { name: 'Pending', value: stats.pending, icon: 'clock-outline', color: '#f59e0b' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consultant_verified': return '#3b82f6'
      case 'pd_approved': return '#22c55e'
      default: return '#9ca3af'
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/add')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            <Text style={styles.actionText}>Add Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => router.push('/(tabs)/cases')}
          >
            <MaterialCommunityIcons name="file-export" size={24} color="#4D66EB" />
            <Text style={[styles.actionText, styles.actionTextSecondary]}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <View key={stat.name} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statName}>{stat.name}</Text>
            </View>
          ))}
        </View>

        {/* Recent Cases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Cases</Text>
          {recentCases.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No cases yet</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
                <Text style={styles.emptyLink}>Add your first case</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentCases.map((caseItem) => (
              <TouchableOpacity
                key={caseItem.id}
                style={styles.caseItem}
                onPress={() => router.push(`/cases/${caseItem.id}`)}
              >
                <View style={styles.caseInfo}>
                  <Text style={styles.caseProcedure}>{caseItem.procedure_type}</Text>
                  <Text style={styles.caseDate}>
                    {new Date(caseItem.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(caseItem.verification_status) }]} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4D66EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4D66EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#4D66EB',
    shadowOpacity: 0.05,
    shadowColor: '#000',
  },
  actionText: { color: '#fff', fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 16 },
  actionTextSecondary: { color: '#4D66EB' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  statName: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', color: '#64748b', marginTop: 4 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#9ca3af', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 8 },
  emptyLink: { color: '#4D66EB', fontFamily: 'PlusJakartaSans_600SemiBold', marginTop: 8 },
  caseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  caseInfo: { flex: 1 },
  caseProcedure: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  caseDate: { fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', color: '#9ca3af', marginTop: 4 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
})
