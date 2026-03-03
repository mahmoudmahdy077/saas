import { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../../lib/stores/authStore'

interface Log { id: string; action: string; user: string; target: string; timestamp: string }

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<Log[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
    const formatted = (data || []).map((l: any) => ({
      id: l.id,
      action: l.action || 'Unknown',
      user: l.user_email || 'System',
      target: l.target_type || 'N/A',
      timestamp: l.created_at,
    }))
    setLogs(formatted)
  }

  const onRefresh = async () => { setRefreshing(true); await loadLogs(); setRefreshing(false) }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return '#10b981'
    if (action.includes('update')) return '#f59e0b'
    if (action.includes('delete')) return '#ef4444'
    return '#64748b'
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <View style={[styles.icon, { backgroundColor: getActionColor(item.action) + '15' }]}>
              <MaterialCommunityIcons name="history" size={20} color={getActionColor(item.action)} />
            </View>
            <View style={styles.logInfo}>
              <Text style={styles.logAction}>{item.action}</Text>
              <Text style={styles.logMeta}>{item.user} • {item.target}</Text>
            </View>
            <Text style={styles.logTime}>{new Date(item.timestamp).toLocaleDateString()}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Audit Logs</Text><Text style={styles.subtitle}>{logs.length} recent activities</Text></View>}
        ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="history" size={48} color="#cbd5e1" /><Text style={styles.emptyText}>No audit logs</Text></View>}
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
  logCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  icon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logInfo: { flex: 1, marginLeft: 12 },
  logAction: { fontSize: 14, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12' },
  logMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logTime: { fontSize: 11, color: '#94a3b8' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14, color: '#64748b', marginTop: 8 },
})
