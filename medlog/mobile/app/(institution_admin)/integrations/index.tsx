import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function IntegrationsScreen() {
  const integrations = [
    { id: 'slack', name: 'Slack', description: 'Send notifications to Slack', connected: false },
    { id: 'zoom', name: 'Zoom', description: 'Video conferencing', connected: false },
    { id: 'stripe', name: 'Stripe', description: 'Payment processing', connected: true },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Integrations</Text><Text style={styles.subtitle}>Connect third-party services</Text></View>
      <View style={styles.section}>
        {integrations.map((item) => (
          <TouchableOpacity key={item.id} style={styles.integrationCard}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="connection" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.name}>{item.name}</Text><Text style={styles.desc}>{item.description}</Text></View>
            <View style={[styles.status, { backgroundColor: item.connected ? '#10b981' + '20' : '#f1f5f9' }]}><Text style={[styles.statusText, { color: item.connected ? '#10b981' : '#64748b' }]}>{item.connected ? 'Connected' : 'Connect'}</Text></View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { padding: 16 },
  integrationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  desc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  status: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium' },
})
