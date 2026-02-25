import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

interface Profile {
  full_name: string
  email: string
  notification_settings: {
    reminder_enabled: boolean
    reminder_time: string
    vacation_mode: boolean
  }
}

export default function SettingsScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [notifications, setNotifications] = useState({
    enabled: true,
    vacationMode: false,
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setNotifications({
        enabled: data.notification_settings?.reminder_enabled ?? true,
        vacationMode: data.notification_settings?.vacation_mode ?? false,
      })
    }
  }

  const updateNotifications = async (key: string, value: boolean) => {
    const newSettings = { ...notifications, [key]: value }
    setNotifications(newSettings)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        notification_settings: {
          reminder_enabled: newSettings.enabled,
          reminder_time: '21:00',
          vacation_mode: newSettings.vacationMode,
        },
      })
      .eq('id', user.id)
  }

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut()
            router.replace('/(auth)/login')
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileItem}>
            <MaterialCommunityIcons name="account" size={24} color="#64748b" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Name</Text>
              <Text style={styles.profileValue}>{profile?.full_name || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.profileItem}>
            <MaterialCommunityIcons name="email" size={24} color="#64748b" />
            <View style={styles.profileInfo}>
              <Text style={styles.profileLabel}>Email</Text>
              <Text style={styles.profileValue}>{profile?.email || 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="bell" size={24} color="#64748b" />
              <View>
                <Text style={styles.settingLabel}>Daily Reminder</Text>
                <Text style={styles.settingDescription}>Get reminded to log cases</Text>
              </View>
            </View>
            <Switch
              value={notifications.enabled}
              onValueChange={(value) => updateNotifications('enabled', value)}
              trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons name="umbrella-beach" size={24} color="#64748b" />
              <View>
                <Text style={styles.settingLabel}>Vacation Mode</Text>
                <Text style={styles.settingDescription}>Pause notifications</Text>
              </View>
            </View>
            <Switch
              value={notifications.vacationMode}
              onValueChange={(value) => updateNotifications('vacationMode', value)}
              trackColor={{ false: '#e5e7eb', true: '#0ea5e9' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialCommunityIcons name="information" size={24} color="#64748b" />
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.versionText}>1.0.0</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  profileInfo: { flex: 1 },
  profileLabel: { fontSize: 12, color: '#9ca3af' },
  profileValue: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  settingInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  settingDescription: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  versionText: { color: '#9ca3af', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 56 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
})
