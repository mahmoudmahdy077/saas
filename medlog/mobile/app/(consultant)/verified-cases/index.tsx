import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../lib/stores/authStore'
import { useAuthStore } from '../../../lib/stores/authStore'

interface VerifiedCase {
  id: string
  title: string
  category: string
  resident_name: string
  verified_at: string
}

export default function VerifiedCasesScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [cases, setCases] = useState<VerifiedCase[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCases()
  }, [user])

  const loadCases = async () => {
    if (!user) return

    const { data } = await supabase
      .from('cases')
      .select('id, title, category, verified_at, profiles(full_name)')
      .eq('status', 'verified')
      .eq('verified_by', user.id)
      .order('verified_at', { ascending: false })

    const formatted = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      resident_name: c.profiles?.full_name || 'Unknown',
      verified_at: c.verified_at,
    }))

    setCases(formatted)
    setLoading(false)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCases()
    setRefreshing(false)
  }

  const renderCase = ({ item }: { item: VerifiedCase }) => (
    <TouchableOpacity
      style={styles.caseCard}
      onPress={() => router.push(`/(consultant)/case-review/${item.id}`)}
    >
      <View style={styles.caseHeader}>
        <View style={[styles.caseAvatar, { backgroundColor: '#10b981' + '15' }]}>
          <MaterialCommunityIcons name="check" size={20} color="#10b981" />
        </View>
        <View style={styles.caseInfo}>
          <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.caseResident}>{item.resident_name}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
      </View>
      <View style={styles.caseFooter}>
        <Text style={styles.caseCategory}>{item.category}</Text>
        <Text style={styles.caseDate}>
          Verified: {item.verified_at ? new Date(item.verified_at).toLocaleDateString() : 'N/A'}
        </Text>
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
            <Text style={styles.title}>Verified Cases</Text>
            <Text style={styles.subtitle}>{cases.length} cases verified</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="file-document-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Verified Cases</Text>
            <Text style={styles.emptyText}>Cases you verify will appear here</Text>
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
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
})
