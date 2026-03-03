import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function BrandingScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Branding</Text></View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Institution Logo</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <MaterialCommunityIcons name="cloud-upload" size={40} color="#4D66EB" />
          <Text style={styles.uploadText}>Upload Logo</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colors</Text>
        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: '#4D66EB' }]} /><Text style={styles.colorLabel}>Primary</Text>
          <View style={[styles.colorBox, { backgroundColor: '#10b981' }]} /><Text style={styles.colorLabel}>Accent</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  section: { backgroundColor: '#fff', marginTop: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  uploadBox: { alignItems: 'center', padding: 32, borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 12, borderStyle: 'dashed' },
  uploadText: { fontSize: 14, color: '#4D66EB', marginTop: 8 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  colorBox: { width: 48, height: 48, borderRadius: 12 },
  colorLabel: { fontSize: 14, color: '#64748b' },
})
