import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { BarChart } from 'react-native-chart-kit'

const screenWidth = Dimensions.get('window').width - 32

export default function PDReportsScreen() {
  const barData = {
    labels: ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown', 'Dr. Davis'],
    datasets: [{ data: [45, 38, 52, 41, 35] }],
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
    { id: 'volume', title: 'Case Volume Report', desc: 'Monthly case counts by resident', icon: 'chart-bar' },
    { id: 'minimums', title: 'Case Minimums', desc: 'ACGME minimum compliance', icon: 'clipboard-check' },
    { id: 'milestone', title: 'Milestone Report', desc: 'Program milestone progress', icon: 'flag-checkered' },
    { id: 'summary', title: 'Resident Summary', desc: 'Individual resident overviews', icon: 'account-group' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Program Reports</Text>
        <Text style={styles.subtitle}>Generate and view program reports</Text>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Cases by Resident</Text>
        <View style={styles.chartCard}>
          <BarChart
            data={barData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Reports</Text>
        {reports.map((report) => (
          <TouchableOpacity key={report.id} style={styles.reportCard}>
            <View style={styles.reportIcon}>
              <MaterialCommunityIcons name={report.icon as any} size={24} color="#4D66EB" />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDesc}>{report.desc}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
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
    padding: 16,
  },
  chart: {
    borderRadius: 16,
  },
  section: {
    padding: 16,
    paddingTop: 0,
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
  },
  reportInfo: {
    flex: 1,
    marginLeft: 12,
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
})
