import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

export default function InstitutionAdminDashboardScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ users: 0, residents: 0, cases: 0, institutions: 0 })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [profile])

  const loadStats = async () => {
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('institution_id', profile?.institution_id)
    const { count: residents } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'resident').eq('institution_id', profile?.institution_id)
    const { count: cases } = await supabase.from('cases').select('*', { count: 'exact', head: true })

    setStats({ users: users || 0, residents: residents || 0, cases: cases || 0, institutions: 1 })
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  const adminSections = [
    { title: 'Users', icon: 'account-group', route: '(institution_admin)/users', color: '#4D66EB' },
    { title: 'Billing', icon: 'credit-card', route: '(institution_admin)/billing', color: '#10b981' },
    { title: 'Templates', icon: 'file-document', route: '(institution_admin)/templates', color: '#f59e0b' },
    { title: 'Settings', icon: 'cog', route: '(institution_admin)/settings', color: '#64748b' },
  ]

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Institution Admin</Text>
        <Text style={styles.name}>{profile?.full_name || 'Admin'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account-group" size={28} color="#4D66EB" />
          <Text style={styles.statValue}>{stats.users}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="account" size={28} color="#10b981" />
          <Text style={styles.statValue}>{stats.residents}</Text>
          <Text style={styles.statLabel}>Residents</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="file-document" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.cases}</Text>
          <Text style={styles.statLabel}>Cases</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Administration</Text>
        {adminSections.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
              <MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
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
    fontSize: 12,
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
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#0D0D12',
    marginLeft: 12,
  },
})
