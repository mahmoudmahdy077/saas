import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../lib/stores/authStore'

export default function SuperAdminDashboardScreen() {
  const router = useRouter()
  const [stats, setStats] = useState({ institutions: 0, users: 0, cases: 0, admins: 0 })
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    const { count: institutions } = await supabase.from('institutions').select('*', { count: 'exact', head: true })
    const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: cases } = await supabase.from('cases').select('*', { count: 'exact', head: true })
    const { count: admins } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['institution_admin', 'super_admin'])
    setStats({ institutions: institutions || 0, users: users || 0, cases: cases || 0, admins: admins || 0 })
  }

  const onRefresh = async () => { setRefreshing(true); await loadStats(); setRefreshing(false) }

  const sections = [
    { title: 'Institutions', icon: 'domain', route: '(super_admin)/institutions', color: '#4D66EB', value: stats.institutions },
    { title: 'Audit Logs', icon: 'history', route: '(super_admin)/audit-logs', color: '#10b981', value: null },
    { title: 'Plans & Billing', icon: 'currency-usd', route: '(super_admin)/plans', color: '#f59e0b', value: null },
    { title: 'System Settings', icon: 'cog', route: '(super_admin)/settings', color: '#64748b', value: null },
  ]

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Super Admin</Text>
        <Text style={styles.name}>Platform Overview</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}><MaterialCommunityIcons name="domain" size={28} color="#4D66EB" /><Text style={styles.statValue}>{stats.institutions}</Text><Text style={styles.statLabel}>Institutions</Text></View>
        <View style={styles.statCard}><MaterialCommunityIcons name="account-group" size={28} color="#10b981" /><Text style={styles.statValue}>{stats.users}</Text><Text style={styles.statLabel}>Users</Text></View>
        <View style={styles.statCard}><MaterialCommunityIcons name="file-document" size={28} color="#f59e0b" /><Text style={styles.statValue}>{stats.cases}</Text><Text style={styles.statLabel}>Cases</Text></View>
        <View style={styles.statCard}><MaterialCommunityIcons name="shield-account" size={28} color="#ef4444" /><Text style={styles.statValue}>{stats.admins}</Text><Text style={styles.statLabel}>Admins</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Administration</Text>
        {sections.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuCard} onPress={() => router.push(item.route as any)}>
            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}><MaterialCommunityIcons name={item.icon as any} size={24} color={item.color} /></View>
            <Text style={styles.menuText}>{item.title}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  greeting: { fontSize: 14, color: '#64748b' },
  name: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 12 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 28, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  menuIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, fontSize: 16, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12', marginLeft: 12 },
})
