import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', title: 'New institution signup', message: 'General Hospital registered', time: '2 hours ago', read: false },
    { id: '2', title: 'Payment received', message: '$490 from Medical Center', time: '1 day ago', read: true },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Notifications</Text></View>
      <View style={styles.section}>
        {notifications.map((notif) => (
          <TouchableOpacity key={notif.id} style={[styles.notifCard, !notif.read && styles.unread]}>
            <View style={styles.iconBox}><MaterialCommunityIcons name="bell" size={24} color="#4D66EB" /></View>
            <View style={styles.info}><Text style={styles.titleText}>{notif.title}</Text><Text style={styles.message}>{notif.message}</Text><Text style={styles.time}>{notif.time}</Text></View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  section: { padding: 16 },
  notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  unread: { backgroundColor: '#4D66EB' + '05' },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  titleText: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  message: { fontSize: 13, color: '#64748b', marginTop: 2 },
  time: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4D66EB' },
})
