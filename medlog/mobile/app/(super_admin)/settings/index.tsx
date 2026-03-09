import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function SuperAdminSettingsScreen() {
  const [maintenance, setMaintenance] = useState(false)

  const SettingItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#4D66EB" />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>System Settings</Text></View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform</Text>
        <SettingItem icon="web" title="Global Settings" subtitle="General platform configuration" />
        <SettingItem icon="feature-double" title="Feature Flags" subtitle="Manage feature toggles" />
        <SettingItem icon="robot" title="AI Providers" subtitle="Configure AI backends" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <SettingItem icon="shield-lock" title="Security Settings" subtitle="Platform-wide security config" />
        <View style={styles.switchItem}>
          <MaterialCommunityIcons name="wrench" size={22} color="#f59e0b" />
          <View style={styles.switchContent}>
            <Text style={styles.switchTitle}>Maintenance Mode</Text>
            <Text style={styles.switchSubtitle}>Disable platform access</Text>
          </View>
          <Switch value={maintenance} onValueChange={setMaintenance} trackColor={{ true: '#4D66EB' }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring</Text>
        <SettingItem icon="chart-timeline" title="Analytics" subtitle="Platform analytics" />
        <SettingItem icon="bell" title="Notifications" subtitle="System notifications" />
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
  settingContent: { flex: 1, marginLeft: 12 },
  settingTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12' },
  settingSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  switchItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  switchContent: { flex: 1, marginLeft: 12 },
  switchTitle: { fontSize: 15, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12' },
  switchSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
})
