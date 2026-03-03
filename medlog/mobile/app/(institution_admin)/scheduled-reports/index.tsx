import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function ScheduledReportsScreen() {
  const reports = [
    { id: '1', name: 'Monthly Case Summary', frequency: 'Monthly', recipients: 3, active: true },
    { id: '2', name: 'Resident Progress', frequency: 'Weekly', recipients: 5, active: true },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled Reports</Text>
        <TouchableOpacity style={styles.addButton}><MaterialCommunityIcons name="plus" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        {reports.map((report) => (
          <TouchableOpacity key={report.id} style={styles.reportCard}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="calendar-clock" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.name}>{report.name}</Text><Text style={styles.meta}>{report.frequency} • {report.recipients} recipients</Text></View>
            <View style={[styles.status, { backgroundColor: report.active ? '#10b981' + '20' : '#f1f5f9' }]}><Text style={[styles.statusText, { color: report.active ? '#10b981' : '#64748b' }]}>{report.active ? 'Active' : 'Paused'}</Text></View>
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
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  meta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: 'PlusJakartaSans_500Medium' },
})
