import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../lib/stores/authStore'

export default function SettingsScreen() {
  const router = useRouter()
  const { user, profile, signOut } = useAuthStore()
  const [notifications, setNotifications] = useState(true)
  const [reminders, setReminders] = useState(true)

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    )
  }

  const SettingItem = ({ icon, title, subtitle, onPress, showArrow = true }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <MaterialCommunityIcons name={icon} size={22} color="#4D66EB" />
      </View>
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
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={40} color="#4D66EB" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.profileRole}>{profile?.role || 'Resident'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem 
          icon="account-edit" 
          title="Edit Profile" 
          onPress={() => router.push('/(main)/settings/profile' as any)}
        />
        <SettingItem 
          icon="lock-reset" 
          title="Change Password" 
          onPress={() => router.push('/(main)/settings/password' as any)}
        />
        <SettingItem 
          icon="bell" 
          title="Notifications"
          subtitle={notifications ? 'Enabled' : 'Disabled'}
          onPress={() => setNotifications(!notifications)}
          showArrow={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingItem 
          icon="clock-outline" 
          title="Daily Reminder" 
          subtitle={reminders ? `at ${profile?.notification_settings?.reminder_time || '21:00'}` : 'Off'}
          onPress={() => setReminders(!reminders)}
          showArrow={false}
        />
        <SettingItem 
          icon="airplane" 
          title="Vacation Mode" 
          subtitle={profile?.notification_settings?.vacation_mode ? 'Active' : 'Inactive'}
          onPress={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <SettingItem 
          icon="help-circle-outline" 
          title="Help & Support" 
          onPress={() => {}}
        />
        <SettingItem 
          icon="file-document-outline" 
          title="Terms of Service" 
          onPress={() => {}}
        />
        <SettingItem 
          icon="shield-check-outline" 
          title="Privacy Policy" 
          onPress={() => {}}
        />
        <SettingItem 
          icon="information-outline" 
          title="About" 
          subtitle="Version 1.0.0"
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={22} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 1,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4D66EB' + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  profileRole: {
    fontSize: 14,
    color: '#4D66EB',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4D66EB' + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#0D0D12',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#ef4444',
    marginLeft: 8,
  },
})
