import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'

export default function ConsultantSettingsScreen() {
  const router = useRouter()
  const { user, profile, signOut } = useAuthStore()
  const [notifications, setNotifications] = useState(true)

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: signOut }])

  const SettingItem = ({ icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={22} color="#4D66EB" />
      <View style={styles.settingContent}><Text style={styles.settingTitle}>{title}</Text>{subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}</View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Settings</Text></View>
      <View style={styles.profileSection}>
        <View style={styles.avatar}><MaterialCommunityIcons name="account" size={32} color="#4D66EB" /></View>
        <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
        <Text style={styles.profileRole}>Consultant</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem icon="account-edit" title="Edit Profile" onPress={() => {}} />
        <SettingItem icon="bell" title="Notifications" subtitle={notifications ? 'Enabled' : 'Disabled'} onPress={() => setNotifications(!notifications)} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <SettingItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
        <SettingItem icon="information-outline" title="About" subtitle="Version 1.0.0" onPress={() => {}} />
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}><MaterialCommunityIcons name="logout" size={22} color="#ef4444" /><Text style={styles.logoutText}>Sign Out</Text></TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  profileSection: { alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4D66EB' + '20', justifyContent: 'center', alignItems: 'center' },
  profileName: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginTop: 12 },
  profileRole: { fontSize: 14, color: '#4D66EB', marginTop: 2 },
  section: { backgroundColor: '#fff', marginTop: 16, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 13, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#64748b', paddingVertical: 12 },
  settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  settingContent: { flex: 1, marginLeft: 12 },
  settingTitle: { fontSize: 15, color: '#0D0D12' },
  settingSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 16, marginTop: 16, marginBottom: 32 },
  logoutText: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#ef4444', marginLeft: 8 },
})
