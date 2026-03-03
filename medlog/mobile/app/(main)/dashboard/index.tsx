import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface Stats {
  totalCases: number
  verifiedCases: number
  pendingCases: number
  currentStreak: number
}

interface RecentCase {
  id: string
  title: string
  category: string
  status: string
  created_at: string
}

export default function DashboardScreen() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState<Stats>({ totalCases: 0, verifiedCases: 0, pendingCases: 0, currentStreak: 0 })
  const [recentCases, setRecentCases] = useState<RecentCase[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    if (!user) return

    const { data: cases } = await supabase
      .from('cases')
      .select('status')
      .eq('user_id', user.id)

    const totalCases = cases?.length || 0
    const verifiedCases = cases?.filter(c => c.status === 'verified').length || 0
    const pendingCases = cases?.filter(c => c.status === 'pending').length || 0

    setStats({
      totalCases,
      verifiedCases,
      pendingCases,
      currentStreak: profile?.current_streak || 0,
    })

    const { data: recent } = await supabase
      .from('cases')
      .select('id, title, category, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentCases(recent || [])
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{profile?.full_name || 'Resident'}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(main)/settings')}>
          <MaterialCommunityIcons name="account-circle" size={48} color="#4D66EB" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="file-document" size={28} color="#4D66EB" />
          <Text style={styles.statValue}>{stats.totalCases}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="check-circle" size={28} color="#10b981" />
          <Text style={styles.statValue}>{stats.verifiedCases}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.pendingCases}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="fire" size={28} color="#ef4444" />
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(main)/cases/new')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4D66EB' + '20' }]}>
              <MaterialCommunityIcons name="plus" size={24} color="#4D66EB" />
            </View>
            <Text style={styles.actionText}>Add Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(main)/cases')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b981' + '20' }]}>
              <MaterialCommunityIcons name="file-document" size={24} color="#10b981" />
            </View>
            <Text style={styles.actionText}>View Cases</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(main)/progress')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b' + '20' }]}>
              <MaterialCommunityIcons name="chart-line" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.actionText}>Progress</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Cases</Text>
          <TouchableOpacity onPress={() => router.push('/(main)/cases')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentCases.length > 0 ? (
          recentCases.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentCard}
              onPress={() => router.push(`/(main)/cases/${item.id}`)}
            >
              <View style={styles.recentInfo}>
                <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recentCategory}>{item.category}</Text>
              </View>
              <View style={[
                styles.recentStatus,
                { backgroundColor: item.status === 'verified' ? '#10b981' + '20' : '#f59e0b' + '20' }
              ]}>
                <Text style={[
                  styles.recentStatusText,
                  { color: item.status === 'verified' ? '#10b981' : '#f59e0b' }
                ]}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyText}>No cases yet. Start logging!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#374151',
  },
  recentSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#4D66EB',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  recentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  recentInfo: {
    flex: 1,
    marginRight: 12,
  },
  recentTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#0D0D12',
  },
  recentCategory: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  recentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentStatusText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    textTransform: 'capitalize',
  },
  emptyRecent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
})
