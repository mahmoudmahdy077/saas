import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function SystemSettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>System Settings</Text></View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <TouchableOpacity style={styles.settingItem}><MaterialCommunityIcons name="web" size={22} color="#4D66EB" /><Text style={styles.settingText}>Platform Name</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}><MaterialCommunityIcons name="earth" size={22} color="#4D66EB" /><Text style={styles.settingText}>Default Country</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <TouchableOpacity style={styles.settingItem}><MaterialCommunityIcons name="email" size={22} color="#4D66EB" /><Text style={styles.settingText}>SMTP Settings</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}><MaterialCommunityIcons name="email-outline" size={22} color="#4D66EB" /><Text style={styles.settingText}>Email Templates</Text><MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" /></TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  section: { backgroundColor: '#fff', marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#64748b', paddingVertical: 12 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  settingText: { flex: 1, fontSize: 15, color: '#0D0D12', marginLeft: 12 },
})
