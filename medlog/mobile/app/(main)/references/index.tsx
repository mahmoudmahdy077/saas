import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function ReferencesScreen() {
  const requests = [
    { id: '1', name: 'Dr. Sarah Johnson', hospital: 'Johns Hopkins', status: 'pending', date: '2024-01-15' },
    { id: '2', name: 'Dr. Michael Chen', hospital: 'Mayo Clinic', status: 'completed', date: '2024-01-10' },
    { id: '3', name: 'Dr. Emily Williams', hospital: 'UCSF', status: 'pending', date: '2024-01-08' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reference Requests</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={styles.addButtonText}>New Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Requests</Text>
        {requests.filter(r => r.status === 'pending').map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestAvatar}>
                <MaterialCommunityIcons name="account" size={24} color="#4D66EB" />
              </View>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestHospital}>{request.hospital}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                  {request.status}
                </Text>
              </View>
            </View>
            <Text style={styles.requestDate}>Requested: {request.date}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        {requests.filter(r => r.status === 'completed').map((request) => (
          <View key={request.id} style={styles.historyCard}>
            <View style={styles.requestHeader}>
              <View style={styles.requestAvatar}>
                <MaterialCommunityIcons name="account" size={24} color="#64748b" />
              </View>
              <View style={styles.requestInfo}>
                <Text style={styles.requestName}>{request.name}</Text>
                <Text style={styles.requestHospital}>{request.hospital}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#10b981' + '20' }]}>
                <Text style={[styles.statusText, { color: '#10b981' }]}>Completed</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D66EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 6,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    opacity: 0.8,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4D66EB' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  requestHospital: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    textTransform: 'capitalize',
  },
  requestDate: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 12,
  },
})
