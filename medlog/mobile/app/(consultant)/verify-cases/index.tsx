import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../lib/stores/authStore'

interface PendingCase {
  id: string
  title: string
  category: string
  resident_name: string
  created_at: string
}

export default function VerifyCasesScreen() {
  const router = useRouter()
  const [cases, setCases] = useState<PendingCase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    const { data } = await supabase
      .from('cases')
      .select('id, title, category, created_at, profiles(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      resident_name: c.profiles?.full_name || 'Unknown',
      created_at: c.created_at,
    }))

    setCases(formatted)
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const renderCase = ({ item }: { item: PendingCase }) => (
    <TouchableOpacity
      style={styles.caseCard}
      onPress={() => router.push(`/(consultant)/case-review/${item.id}`)}
    >
      <View style={styles.caseHeader}>
        <View style={styles.caseAvatar}>
          <MaterialCommunityIcons name="file-document" size={20} color="#4D66EB" />
        </View>
        <View style={styles.caseInfo}>
          <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.caseResident}>{item.resident_name}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
      <View style={styles.caseFooter}>
        <Text style={styles.caseCategory}>{item.category}</Text>
        <Text style={styles.caseDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={cases}
        renderItem={renderCase}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Verify Cases</Text>
            <Text style={styles.subtitle}>{cases.length} cases pending verification</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="check-all" size={64} color="#10b981" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No cases pending verification</Text>
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
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caseAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4D66EB' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  caseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  caseTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  caseResident: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#f59e0b' + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  caseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  caseCategory: {
    fontSize: 13,
    color: '#4D66EB',
  },
  caseDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#10b981',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
})
