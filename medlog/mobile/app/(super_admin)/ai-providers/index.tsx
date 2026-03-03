import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function AIProvidersScreen() {
  const providers = [
    { id: 'openai', name: 'OpenAI', status: 'active', models: 'GPT-4, GPT-3.5' },
    { id: 'anthropic', name: 'Anthropic', status: 'active', models: 'Claude 3 Opus' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Providers</Text>
        <TouchableOpacity style={styles.addButton}><MaterialCommunityIcons name="plus" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        {providers.map((provider) => (
          <TouchableOpacity key={provider.id} style={styles.providerCard}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="robot" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.name}>{provider.name}</Text><Text style={styles.models}>{provider.models}</Text></View>
            <View style={[styles.status, { backgroundColor: provider.status === 'active' ? '#10b981' + '20' : '#f1f5f9' }]}><Text style={[styles.statusText, { color: provider.status === 'active' ? '#10b981' : '#64748b' }]}>{provider.status}</Text></View>
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
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  models: { fontSize: 13, color: '#64748b', marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium', textTransform: 'capitalize' },
})
