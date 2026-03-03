import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PDMilestonesScreen() {
  const milestones = [
    { id: '1', name: 'Patient Care', category: 'Core', progress: 75 },
    { id: '2', name: 'Medical Knowledge', category: 'Core', progress: 82 },
    { id: '3', name: 'Practice-Based Learning', category: 'Core', progress: 68 },
    { id: '4', name: 'Communication', category: 'Core', progress: 90 },
    { id: '5', name: 'Professionalism', category: 'Core', progress: 85 },
    { id: '6', name: 'Systems-Based Practice', category: 'Core', progress: 72 },
  ]

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981'
    if (progress >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Program Milestones</Text>
        <Text style={styles.subtitle}>Track milestone completion across program</Text>
      </View>

      <View style={styles.overview}>
        <Text style={styles.overviewLabel}>Average Completion</Text>
        <Text style={styles.overviewValue}>78%</Text>
      </View>

      <View style={styles.section}>
        {milestones.map((milestone) => (
          <TouchableOpacity key={milestone.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <View>
                <Text style={styles.milestoneName}>{milestone.name}</Text>
                <Text style={styles.milestoneCategory}>{milestone.category}</Text>
              </View>
              <Text style={[styles.milestoneProgress, { color: getProgressColor(milestone.progress) }]}>
                {milestone.progress}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${milestone.progress}%`, backgroundColor: getProgressColor(milestone.progress) }
                ]} 
              />
            </View>
          </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  overview: {
    backgroundColor: '#4D66EB',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  overviewLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  overviewValue: {
    fontSize: 48,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#fff',
    marginTop: 8,
  },
  section: {
    padding: 16,
    paddingTop: 0,
  },
  milestoneCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  milestoneName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  milestoneCategory: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  milestoneProgress: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
})
