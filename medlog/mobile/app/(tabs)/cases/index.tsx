import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Case {
  id: string
  date: string
  procedure_type: string
  category: string
  role: string
  verification_status: string
}

export default function CasesScreen() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (data) setCases(data)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchCases()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consultant_verified': return '#3b82f6'
      case 'pd_approved': return '#22c55e'
      default: return '#9ca3af'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'consultant_verified': return 'Verified'
      case 'pd_approved': return 'Approved'
      default: return 'Self'
    }
  }

  const renderItem = ({ item }: { item: Case }) => (
    <TouchableOpacity
      style={styles.caseItem}
      onPress={() => router.push(`/cases/${item.id}`)}
    >
      <View style={styles.caseInfo}>
        <Text style={styles.caseProcedure}>{item.procedure_type}</Text>
        <Text style={styles.caseCategory}>{item.category}</Text>
        <Text style={styles.caseDate}>
          {new Date(item.date).toLocaleDateString()} • {item.role}
        </Text>
      </View>
      <View style={styles.caseStatus}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.verification_status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.verification_status) }]}>
            {getStatusLabel(item.verification_status)}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={cases}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={cases.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No cases logged yet</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/add')}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Your First Case</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  list: { padding: 16 },
  caseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caseInfo: { flex: 1 },
  caseProcedure: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  caseCategory: { fontSize: 14, color: '#64748b', marginTop: 2 },
  caseDate: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  caseStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  emptyContainer: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { color: '#9ca3af', fontSize: 16, marginTop: 16 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
})
