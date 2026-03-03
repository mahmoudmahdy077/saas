import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function WebhooksScreen() {
  const webhooks = [
    { id: '1', url: 'https://api.example.com/webhooks/medlog', events: ['case.created', 'case.verified'], status: 'active' },
    { id: '2', url: 'https://slack.com/hooks/123', events: ['user.created'], status: 'active' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Webhooks</Text>
        <TouchableOpacity style={styles.addButton}><MaterialCommunityIcons name="plus" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        {webhooks.map((webhook) => (
          <TouchableOpacity key={webhook.id} style={styles.webhookCard}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="webhook" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.url} numberOfLines={1}>{webhook.url}</Text><Text style={styles.events}>{webhook.events.join(', ')}</Text></View>
            <View style={[styles.status, { backgroundColor: webhook.status === 'active' ? '#10b981' + '20' : '#f1f5f9' }]}><Text style={[styles.statusText, { color: webhook.status === 'active' ? '#10b981' : '#64748b' }]}>{webhook.status}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  addButton: { backgroundColor: '#4D66EB', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  section: { padding: 16 },
  webhookCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  url: { fontSize: 14, color: '#0D0D12', fontFamily: 'monospace' },
  events: { fontSize: 12, color: '#64748b', marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', textTransform: 'capitalize' },
})
