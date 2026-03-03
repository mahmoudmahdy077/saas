import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function FeatureFlagsScreen() {
  const flags = [
    { id: 'ai_analysis', name: 'AI Case Analysis', description: 'Enable AI-powered case analysis', enabled: true },
    { id: 'ss0', name: 'SSO', description: 'Single sign-on for institutions', enabled: true },
    { id: 'advanced_reports', name: 'Advanced Reports', description: 'Custom report builder', enabled: false },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Feature Flags</Text><Text style={styles.subtitle}>Toggle platform features</Text></View>
      <View style={styles.section}>
        {flags.map((flag) => (
          <View key={flag.id} style={styles.flagCard}>
            <View style={styles.info}><Text style={styles.name}>{flag.name}</Text><Text style={styles.desc}>{flag.description}</Text></View>
            <TouchableOpacity style={[styles.toggle, flag.enabled && styles.toggleEnabled]}><View style={[styles.toggleKnob, flag.enabled && styles.toggleKnobEnabled]} /></TouchableOpacity>
          </View>
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
  flagCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  desc: { fontSize: 13, color: '#64748b', marginTop: 2 },
  toggle: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#e5e7eb', padding: 2 },
  toggleEnabled: { backgroundColor: '#4D66EB' },
  toggleKnob: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff' },
  toggleKnobEnabled: { marginLeft: 20 },
})
