import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'

export default function InstitutionSettingsScreen() {
  const { profile } = useAuthStore()
  const [sso, setSso] = useState(false)

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#4D66EB" />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />}
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Institution Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <SettingItem icon="domain" title="Institution Details" subtitle={profile?.institution_id ? 'Update info' : 'Not set'} />
        <SettingItem icon="account-multiple" title="Default Roles" subtitle="Configure role permissions" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <SettingItem icon="shield-key" title="SSO / SAML" subtitle={sso ? 'Configured' : 'Not configured'} onPress={() => setSso(!sso)} showArrow={false} />
        <SettingItem icon="two-factor-authentication" title="2FA Requirements" subtitle="Manage 2FA settings" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integrations</Text>
        <SettingItem icon="webhook" title="Webhooks" subtitle="Configure webhooks" />
        <SettingItem icon="key" title="API Keys" subtitle="Manage API access" />
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
})
