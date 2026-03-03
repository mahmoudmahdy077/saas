import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../lib/stores/authStore'

interface Institution { id: string; name: string; country: string; status: string; users: number }

export default function InstitutionsScreen() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadInstitutions() }, [])

  const loadInstitutions = async () => {
    const { data } = await supabase.from('institutions').select('*').order('name')
    const withUsers = await Promise.all((data || []).map(async (inst) => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('institution_id', inst.id)
      return { ...inst, users: count || 0 }
    }))
    setInstitutions(withUsers)
    setLoading(false)
  }

  const onRefresh = async () => { setRefreshing(true); await loadInstitutions(); setRefreshing(false) }

  const filtered = institutions.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
        <TextInput style={styles.searchInput} placeholder="Search institutions..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.icon}><MaterialCommunityIcons name="domain" size={24} color="#4D66EB" /></View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.country} • {item.users} users</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.status === 'active' ? '#10b981' + '20' : '#ef4444' + '20' }]}>
              <Text style={[styles.badgeText, { color: item.status === 'active' ? '#10b981' : '#ef4444' }]}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Institutions</Text><Text style={styles.subtitle}>{institutions.length} total</Text></View>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, marginBottom: 0, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, fontSize: 15, color: '#0D0D12' },
  list: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  icon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  meta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', textTransform: 'capitalize' },
})
