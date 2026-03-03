import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LineChart } from 'react-native-chart-kit'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

interface Milestone {
  id: string
  name: string
  category: string
  progress: number
}

export default function ProgressScreen() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  const screenWidth = Dimensions.get('window').width - 32

  useEffect(() => {
    loadProgress()
  }, [user])

  const loadProgress = async () => {
    if (!user) return

    setLoading(true)

    const { data: cases } = await supabase
      .from('cases')
      .select('category, created_at')
      .eq('user_id', user.id)

    const { data: milestoneData } = await supabase
      .from('milestones')
      .select('*')

    if (milestoneData) {
      const progressData = milestoneData.map(m => ({
        ...m,
        progress: Math.floor(Math.random() * 100),
      }))
      setMilestones(progressData)
    }

    setLoading(false)
  }

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(77, 102, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4D66EB',
    },
  }

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [5, 12, 8, 20, 15, 25],
        strokeWidth: 2,
      },
    ],
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981'
    if (progress >= 50) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your case logging milestones</Text>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Case Volume (Last 6 Months)</Text>
        <View style={styles.chartCard}>
          <LineChart
            data={lineChartData}
            width={screenWidth - 32}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
          <MaterialCommunityIcons name="fire" size={20} color="#ef4444" style={styles.statIcon} />
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{profile?.longest_streak || 0}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
          <MaterialCommunityIcons name="trophy" size={20} color="#f59e0b" style={styles.statIcon} />
        </View>
      </View>

      <View style={styles.milestonesSection}>
        <Text style={styles.sectionTitle}>ACGME Milestones</Text>
        {milestones.map((milestone) => (
          <TouchableOpacity key={milestone.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneName}>{milestone.name}</Text>
              <Text style={styles.milestoneCategory}>{milestone.category}</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${milestone.progress}%`, backgroundColor: getProgressColor(milestone.progress) }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{milestone.progress}%</Text>
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
  chartSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
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
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statIcon: {
    marginTop: 8,
  },
  milestonesSection: {
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
    marginBottom: 12,
  },
  milestoneName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    flex: 1,
  },
  milestoneCategory: {
    fontSize: 12,
    color: '#64748b',
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
  progressText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'right',
  },
})
