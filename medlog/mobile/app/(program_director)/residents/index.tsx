import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface Resident {
  id: string
  full_name: string
  email: string
  training_year: number
  specialty: string
  total_cases: number
  verified_cases: number
}

export default function ResidentsScreen() {
  const router = useRouter()
  const { profile } = useAuthStore()
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadResidents()
  }, [profile])

  const loadResidents = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, training_year, specialties(name)')
      .eq('institution_id', profile?.institution_id)
      .eq('role', 'resident')

    const withCases = await Promise.all((profiles || []).map(async (p) => {
      const { count: total } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id)

      const { count: verified } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', p.id)
        .eq('status', 'verified')

      return {
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        training_year: p.training_year,
        specialty: p.specialties?.name || 'General',
        total_cases: total || 0,
        verified_cases: verified || 0,
      }
    }))

    setResidents(withCases)
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadResidents()
    setRefreshing(false)
  }

  const filtered = residents.filter(r => 
    r.full_name.toLowerCase().includes(search.toLowerCase())
  )

  const renderResident = ({ item }: { item: Resident }) => (
    <TouchableOpacity
      style={styles.residentCard}
      onPress={() => router.push(`/(program_director)/resident-detail/${item.id}`)}
    >
      <View style={styles.residentAvatar}>
        <Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text>
      </View>
      <View style={styles.residentInfo}>
        <Text style={styles.residentName}>{item.full_name}</Text>
        <Text style={styles.residentMeta}>Year {item.training_year} • {item.specialty}</Text>
        <View style={styles.caseStats}>
          <Text style={styles.caseStat}>{item.total_cases} cases</Text>
          <Text style={styles.caseStatSeparator}>•</Text>
          <Text style={[styles.caseStat, { color: '#10b981' }]}>{item.verified_cases} verified</Text>
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search residents..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#94a3b8"
        />
      </View>
      <FlatList
        data={filtered}
        renderItem={renderResident}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Residents</Text>
            <Text style={styles.subtitle}>{residents.length} residents in program</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="account-group-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No residents found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 15,
    color: '#0D0D12',
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  residentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4D66EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  residentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  residentName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  residentMeta: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  caseStats: {
    flexDirection: 'row',
    marginTop: 6,
  },
  caseStat: {
    fontSize: 12,
    color: '#94a3b8',
  },
  caseStatSeparator: {
    fontSize: 12,
    color: '#94a3b8',
    marginHorizontal: 6,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
  },
})
