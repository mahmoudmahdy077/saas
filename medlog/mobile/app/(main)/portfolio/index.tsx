import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PortfolioScreen() {
  const router = useRouter()

  const stats = [
    { label: 'Total Cases', value: '156' },
    { label: 'Verified', value: '142' },
    { label: 'Categories', value: '8' },
  ]

  const procedures = [
    { name: 'Laparoscopic Cholecystectomy', count: 45 },
    { name: 'Appendectomy', count: 32 },
    { name: 'Hernia Repair', count: 28 },
    { name: 'Bowel Resection', count: 15 },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Portfolio</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#4D66EB" />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrSection}>
        <View style={styles.qrCard}>
          <View style={styles.qrPlaceholder}>
            <MaterialCommunityIcons name="qrcode" size={80} color="#cbd5e1" />
          </View>
          <Text style={styles.qrText}>Scan to view portfolio</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Procedure Summary</Text>
        {procedures.map((proc, index) => (
          <View key={index} style={styles.procCard}>
            <Text style={styles.procName}>{proc.name}</Text>
            <View style={styles.procCount}>
              <Text style={styles.procValue}>{proc.count}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Publications</Text>
        <TouchableOpacity style={styles.addCard}>
          <MaterialCommunityIcons name="plus" size={24} color="#4D66EB" />
          <Text style={styles.addText}>Add Publication</Text>
        </TouchableOpacity>
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4D66EB' + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shareText: {
    fontSize: 14,
    color: '#4D66EB',
    marginLeft: 6,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  qrSection: {
    padding: 16,
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4D66EB',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    marginBottom: 12,
  },
  procCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  procName: {
    fontSize: 15,
    color: '#0D0D12',
    flex: 1,
  },
  procCount: {
    backgroundColor: '#4D66EB' + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  procValue: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#4D66EB',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4D66EB',
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 15,
    color: '#4D66EB',
    marginLeft: 8,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
})
