import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PlansScreen() {
  const plans = [
    { id: 'free', name: 'Free', price: '$0', period: 'forever', features: ['5 users', '100 cases', 'Basic support'], color: '#64748b' },
    { id: 'basic', name: 'Basic', price: '$19', period: '/month', features: ['25 users', '1,000 cases', 'Email support'], color: '#4D66EB' },
    { id: 'pro', name: 'Pro', price: '$49', period: '/month', features: ['100 users', 'Unlimited cases', 'Priority support', 'SSO'], color: '#10b981' },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited users', 'Unlimited cases', '24/7 support', 'Custom integrations'], color: '#f59e0b' },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Plans</Text>
        <Text style={styles.subtitle}>Manage pricing tiers</Text>
      </View>

      <View style={styles.section}>
        {plans.map((plan) => (
          <TouchableOpacity key={plan.id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={[styles.planBadge, { backgroundColor: plan.color + '20' }]}>
                <Text style={[styles.planName, { color: plan.color }]}>{plan.name}</Text>
              </View>
              <TouchableOpacity style={styles.editButton}><MaterialCommunityIcons name="pencil" size={16} color="#64748b" /></TouchableOpacity>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.period}>{plan.period}</Text>
            </View>
            <View style={styles.features}>
              {plan.features.map((feature, i) => (
                <View key={i} style={styles.feature}><MaterialCommunityIcons name="check" size={14} color="#10b981" /><Text style={styles.featureText}>{feature}</Text></View>
              ))}
            </View>
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
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  section: { padding: 16 },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  planName: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold' },
  editButton: { padding: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 12 },
  price: { fontSize: 32, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  period: { fontSize: 14, color: '#64748b', marginLeft: 4 },
  features: { marginTop: 16 },
  feature: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureText: { fontSize: 13, color: '#64748b', marginLeft: 8 },
})
