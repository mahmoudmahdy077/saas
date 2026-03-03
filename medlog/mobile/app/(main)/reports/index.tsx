import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PieChart, BarChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width - 32

export default function ReportsScreen() {
  const router = useRouter()

  const pieChartData = [
    { name: 'General', cases: 45, color: '#4D66EB', legendFontColor: '#7F7F7F' },
    { name: 'Vascular', cases: 25, color: '#10b981', legendFontColor: '#7F7F7F' },
    { name: 'Ortho', cases: 20, color: '#f59e0b', legendFontColor: '#7F7F7F' },
    { name: 'Other', cases: 10, color: '#ef4444', legendFontColor: '#7F7F7F' },
  ]

  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [12, 18, 15, 22, 28, 35] },
    ],
  }

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(77, 102, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  }

  const reports = [
    { id: 'volume', title: 'Case Volume Report', icon: 'chart-bar', desc: 'Monthly case counts by category' },
    { id: 'minimums', title: 'Case Minimums', icon: 'clipboard-check', desc: 'ACGME minimum requirements' },
    { id: 'milestone', title: 'Milestone Report', icon: 'flag-checkered', desc: 'Progress on all milestones' },
    { id: 'resident', title: 'Resident Summary', icon: 'account-group', desc: 'Individual resident overview' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <Text style={styles.subtitle}>Generate and view case reports</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Reports</Text>
        {reports.map((report) => (
          <TouchableOpacity key={report.id} style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <MaterialCommunityIcons name={report.icon as any} size={24} color="#4D66EB" />
            </View>
            <View style={styles.reportContent}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDesc}>{report.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Case Distribution</Text>
        <View style={styles.chartCard}>
          <PieChart
            data={pieChartData}
            width={screenWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="cases"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Monthly Cases</Text>
        <View style={styles.chartCard}>
          <BarChart
            data={barChartData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
    marginBottom: 12,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#4D66EB' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  reportDesc: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  chartSection: {
    padding: 16,
    paddingTop: 0,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chart: {
    borderRadius: 16,
  },
})
