import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function APIKeysScreen() {
  const keys = [
    { id: '1', name: 'Production API', key: 'ml_prod_****...****8f2a', created: 'Jan 10, 2024', lastUsed: '2 hours ago' },
    { id: '2', name: 'Development API', key: 'ml_dev_****...****1b3c', created: 'Dec 5, 2023', lastUsed: '5 days ago' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Keys</Text>
        <TouchableOpacity style={styles.addButton}><MaterialCommunityIcons name="plus" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        {keys.map((key) => (
          <TouchableOpacity key={key.id} style={styles.keyCard}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="key" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.name}>{key.name}</Text><Text style={styles.key}>{key.key}</Text></View>
            <TouchableOpacity style={styles.deleteButton}><MaterialCommunityIcons name="delete-outline" size={20} color="#ef4444" /></TouchableOpacity>
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
  keyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  key: { fontSize: 12, color: '#64748b', marginTop: 2, fontFamily: 'monospace' },
  deleteButton: { padding: 8 },
})
