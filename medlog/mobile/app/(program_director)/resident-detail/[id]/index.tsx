import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../../lib/stores/authStore'

interface Resident {
  id: string
  full_name: string
  email: string
  training_year: number
  specialty: string
}

export default function ResidentDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [resident, setResident] = useState<Resident | null>(null)
  const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadResident()
  }, [id])

  const loadResident = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, specialties(name)')
      .eq('id', id)
      .single()

    if (profile) {
      setResident({
        ...profile,
        specialty: profile.specialties?.name || 'General',
      })
    }

    const { count: total } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', id)
    const { count: verified } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'verified')
    const { count: pending } = await supabase.from('cases').select('*', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'pending')

    setStats({ total: total || 0, verified: verified || 0, pending: pending || 0 })
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4D66EB" />
      </View>
    )
  }

  if (!resident) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Resident not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0D0D12" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{resident.full_name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{resident.full_name}</Text>
        <Text style={styles.meta}>Year {resident.training_year} • {resident.specialty}</Text>
        <Text style={styles.email}>{resident.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.verified}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => router.push(`/(program_director)/resident-cases/${id}`)}
        >
          <MaterialCommunityIcons name="file-document" size={22} color="#4D66EB" />
          <Text style={styles.menuText}>View All Cases</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="chart-line" size={22} color="#4D66EB" />
          <Text style={styles.menuText}>Progress Report</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    marginTop: 1,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4D66EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  name: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  meta: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
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
    fontSize: 28,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#0D0D12',
    marginLeft: 12,
  },
})
