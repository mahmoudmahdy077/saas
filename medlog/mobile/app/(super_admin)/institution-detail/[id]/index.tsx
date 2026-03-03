import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../../lib/stores/authStore'

export default function InstitutionDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [institution, setInstitution] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (id) loadInstitution() }, [id])

  const loadInstitution = async () => {
    const { data } = await supabase.from('institutions').select('*').eq('id', id).single()
    setInstitution(data)
    setLoading(false)
  }

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color="#4D66EB" /></View>
  if (!institution) return <View style={styles.error}><Text>Institution not found</Text></View>

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialCommunityIcons name="arrow-left" size={24} color="#0D0D12" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Institution Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.profileSection}>
        <View style={styles.avatar}><MaterialCommunityIcons name="domain" size={40} color="#4D66EB" /></View>
        <Text style={styles.name}>{institution.name}</Text>
        <Text style={styles.country}>{institution.country}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}><Text style={styles.statValue}>--</Text><Text style={styles.statLabel}>Users</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>--</Text><Text style={styles.statLabel}>Cases</Text></View>
        <View style={styles.statCard}><Text style={styles.statValue}>{institution.status}</Text><Text style={styles.statLabel}>Status</Text></View>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Edit Institution</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Manage Users</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}><Text style={[styles.menuText, { color: '#ef4444' }]}>Deactivate</Text></TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  profileSection: { backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  country: { fontSize: 14, color: '#64748b', marginTop: 4 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  section: { padding: 16 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuText: { fontSize: 15, color: '#0D0D12' },
})
