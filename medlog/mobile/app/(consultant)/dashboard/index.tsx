import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface PendingCase {
  id: string
  title: string
  category: string
  resident_name: string
  created_at: string
}

export default function ConsultantDashboardScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [pendingCases, setPendingCases] = useState<PendingCase[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPendingCases()
  }, [])

  const loadPendingCases = async () => {
    const { data } = await supabase
      .from('cases')
      .select('id, title, category, created_at, profiles(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(20)

    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      resident_name: c.profiles?.full_name || 'Unknown',
      created_at: c.created_at,
    }))

    setPendingCases(formatted)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPendingCases()
    setRefreshing(false)
  }

  const stats = [
    { label: 'Pending', value: pendingCases.length, icon: 'clock-outline', color: '#f59e0b' },
    { label: 'Verified Today', value: 12, icon: 'check-circle', color: '#10b981' },
    { label: 'This Week', value: 48, icon: 'calendar-week', color: '#4D66EB' },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome,</Text>
        <Text style={styles.name}>{profile?.full_name || 'Consultant'}</Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <MaterialCommunityIcons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Verifications</Text>
        </View>
        <FlatList
          data={pendingCases}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.caseCard}
              onPress={() => router.push(`/(consultant)/case-review/${item.id}`)}
            >
              <View style={styles.caseHeader}>
                <View style={styles.caseAvatar}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#4D66EB" />
                </View>
                <View style={styles.caseInfo}>
                  <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.caseResident}>{item.resident_name}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
              </View>
              <View style={styles.caseFooter}>
                <Text style={styles.caseCategory}>{item.category}</Text>
                <Text style={styles.caseDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#10b981" />
              <Text style={styles.emptyText}>All caught up!</Text>
            </View>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
  },
  name: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    flex: 1,
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4D66EB' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  caseTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  caseResident: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  caseCategory: {
    fontSize: 13,
    color: '#4D66EB',
  },
  caseDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#10b981',
    marginTop: 12,
  },
})
