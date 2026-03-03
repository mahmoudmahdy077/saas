import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../../lib/stores/authStore'

interface Case { id: string; title: string; category: string; status: string; created_at: string }

export default function ResidentCasesScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { if (id) loadCases() }, [id])

  const loadCases = async () => {
    const { data } = await supabase.from('cases').select('*').eq('user_id', id).order('created_at', { ascending: false })
    setCases(data || [])
    setLoading(false)
  }

  const onRefresh = async () => { setRefreshing(true); await loadCases(); setRefreshing(false) }

  const getStatusColor = (status: string) => status === 'verified' ? '#10b981' : status === 'pending' ? '#f59e0b' : '#ef4444'

  return (
    <View style={styles.container}>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.caseCard} onPress={() => router.push(`/(main)/cases/${item.id}`)}>
            <View style={styles.caseInfo}>
              <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.caseCategory}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Cases</Text><Text style={styles.subtitle}>{cases.length} total cases</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No cases logged yet</Text></View>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  caseCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  caseInfo: { flex: 1 },
  caseTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12' },
  caseCategory: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', textTransform: 'capitalize' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14, color: '#64748b' },
})
