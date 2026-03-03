import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function BillingScreen() {
  const subscription = { plan: 'Pro', status: 'Active', renewal: '2024-02-15', amount: '$49/mo' }

  const invoices = [
    { id: '1', date: '2024-01-15', amount: '$49.00', status: 'Paid' },
    { id: '2', date: '2023-12-15', amount: '$49.00', status: 'Paid' },
    { id: '3', date: '2023-11-15', amount: '$49.00', status: 'Paid' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Billing</Text>
        <Text style={styles.subtitle}>Manage your subscription</Text>
      </View>

      <View style={styles.subscriptionCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{subscription.plan} Plan</Text>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{subscription.status}</Text></View>
        </View>
        <Text style={styles.planAmount}>{subscription.amount}</Text>
        <Text style={styles.renewalText}>Renews on {subscription.renewal}</Text>
        <TouchableOpacity style={styles.manageButton}><Text style={styles.manageButtonText}>Manage Subscription</Text></TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        {invoices.map((invoice) => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <View><Text style={styles.invoiceDate}>{invoice.date}</Text></View>
            <View style={styles.invoiceRight}>
              <Text style={styles.invoiceAmount}>{invoice.amount}</Text>
              <Text style={styles.invoiceStatus}>{invoice.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  subscriptionCard: { backgroundColor: '#4D66EB', margin: 16, borderRadius: 20, padding: 24 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#fff' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, color: '#fff' },
  planAmount: { fontSize: 36, fontFamily: 'PlusJakartaSans_700Bold', color: '#fff', marginTop: 16 },
  renewalText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  manageButton: { backgroundColor: '#fff', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  manageButtonText: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#4D66EB' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  invoiceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  invoiceDate: { fontSize: 14, color: '#64748b' },
  invoiceRight: { alignItems: 'flex-end' },
  invoiceAmount: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  invoiceStatus: { fontSize: 12, color: '#10b981', marginTop: 2 },
})
