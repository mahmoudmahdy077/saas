import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface User {
  id: string
  full_name: string
  email: string
  role: string
  status: string
}

export default function UsersScreen() {
  const { profile } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { loadUsers() }, [profile])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('institution_id', profile?.institution_id)
      .order('full_name')

    setUsers(data || [])
    setLoading(false)
  }

  const onRefresh = async () => { setRefreshing(true); await loadUsers(); setRefreshing(false) }

  const filtered = users.filter(u => u.full_name.toLowerCase().includes(search.toLowerCase()))

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'program_director': return '#4D66EB'
      case 'institution_admin': return '#10b981'
      case 'consultant': return '#f59e0b'
      default: return '#64748b'
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
        <TextInput style={styles.searchInput} placeholder="Search users..." value={search} onChangeText={setSearch} placeholderTextColor="#94a3b8" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text></View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.full_name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>{item.role.replace('_', ' ')}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Users</Text><Text style={styles.subtitle}>{users.length} users</Text></View>}
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
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4D66EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, color: '#fff', fontFamily: 'PlusJakartaSans_600SemiBold' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  userEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', textTransform: 'capitalize' },
})
