import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function ComplianceScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Compliance Dashboard</Text><Text style={styles.subtitle}>Platform compliance status</Text></View>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}><MaterialCommunityIcons name="shield-check" size={28} color="#10b981" /><Text style={styles.statValue}>100%</Text><Text style={styles.statLabel}>HIPAA</Text></View>
        <View style={styles.statCard}><MaterialCommunityIcons name="lock" size={28} color="#4D66EB" /><Text style={styles.statValue}>100%</Text><Text style={styles.statLabel}>SOC 2</Text></View>
        <View style={styles.statCard}><MaterialCommunityIcons name="eye" size={28} color="#f59e0b" /><Text style={styles.statValue}>98%</Text><Text style={styles.statLabel}>Audit Ready</Text></View>
      </View>
      <View style={styles.section}><Text style={styles.sectionTitle}>Recent Audits</Text>
        <View style={styles.auditCard}><Text style={styles.auditTitle}>Security Assessment</Text><Text style={styles.auditDate}>Jan 15, 2024</Text><View style={styles.auditBadge}><Text style={styles.auditBadgeText}>Passed</Text></View></View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  statsGrid: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  auditCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  auditTitle: { flex: 1, fontSize: 15, color: '#0D0D12' },
  auditDate: { fontSize: 13, color: '#64748b', marginRight: 12 },
  auditBadge: { backgroundColor: '#10b981' + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  auditBadgeText: { fontSize: 12, color: '#10b981', fontFamily: 'PlusJakartaSans_500Medium' },
})
