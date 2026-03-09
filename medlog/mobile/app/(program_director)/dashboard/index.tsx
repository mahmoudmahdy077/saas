import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

export default function PDDashboardScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ residents: 0, pending: 0, verified: 0 })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [profile])

  const loadStats = async () => {
    const { data: residents } = await supabase
      .from('profiles')
      .select('id')
      .eq('institution_id', profile?.institution_id)
      .eq('role', 'resident')

    const { data: pending } = await supabase
      .from('cases')
      .select('id')
      .eq('status', 'pending')

    setStats({
      residents: residents?.length || 0,
      pending: pending?.length || 0,
      verified: 0,
    })
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const quickActions = [
    { title: 'Residents', icon: 'account-group', route: '(program_director)/residents', color: '#4D66EB' },
    { title: 'Reports', icon: 'chart-bar', route: '(program_director)/reports', color: '#10b981' },
    { title: 'Milestones', icon: 'flag-checkered', route: '(program_director)/milestones', color: '#f59e0b' },
  ]

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Program Director</Text>
        <Text style={styles.name}>{profile?.full_name || 'PD'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group" size={28} color="#4D66EB" />
          <Text style={styles.statValue}>{stats.residents}</Text>
          <Text style={styles.statLabel}>Residents</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="clock-outline" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <MaterialCommunityIcons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Program Overview</Text>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewText}>Monitor resident progress and case verification</Text>
          <TouchableOpacity 
            style={styles.overviewButton}
            onPress={() => router.push('/(program_director)/residents')}
          >
            <Text style={styles.overviewButtonText}>View All Residents</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#4D66EB" />
          </TouchableOpacity>
        </View>
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
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 0,
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
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#374151',
  },
  overviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  overviewText: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 16,
  },
  overviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overviewButtonText: {
    fontSize: 15,
    color: '#4D66EB',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
})
