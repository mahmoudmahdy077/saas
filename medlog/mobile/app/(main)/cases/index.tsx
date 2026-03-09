import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface Case {
  id: string
  title: string
  category: string
  status: string
  created_at: string
  cpt_code?: string
  icd_code?: string
}

export default function CasesScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCases()
  }, [user])

  const loadCases = async () => {
    if (!user) return
    
    setLoading(true)
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    setCases(data || [])
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
  }

  const renderCase = ({ item }: { item: Case }) => (
    <TouchableOpacity 
      style={styles.caseCard}
      onPress={() => router.push(`/(main)/cases/${item.id}`)}
    >
      <View style={styles.caseHeader}>
        <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      <View style={styles.caseDetails}>
        <Text style={styles.caseCategory}>{item.category}</Text>
        {item.cpt_code && <Text style={styles.caseCode}>CPT: {item.cpt_code}</Text>}
      </View>
      <Text style={styles.caseDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cases</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(main)/cases/new')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cases}
        renderItem={renderCase}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No cases yet</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/(main)/cases/new')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Case</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  addButton: {
    backgroundColor: '#4D66EB',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    textTransform: 'capitalize',
  },
  caseDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  caseCategory: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  caseCode: {
    fontSize: 14,
    color: '#4D66EB',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  caseDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: '#4D66EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
