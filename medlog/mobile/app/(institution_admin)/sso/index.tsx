import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function SSOScreen() {
  const providers = [
    { id: 'okta', name: 'Okta', icon: 'shield-key', connected: false },
    { id: 'azure', name: 'Azure AD', icon: 'microsoft', connected: false },
    { id: 'google', name: 'Google Workspace', icon: 'google', connected: false },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>SSO / SAML</Text><Text style={styles.subtitle}>Configure single sign-on</Text></View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity Providers</Text>
        {providers.map((provider) => (
          <TouchableOpacity key={provider.id} style={styles.providerCard}>
            <MaterialCommunityIcons name={provider.icon as any} size={28} color="#4D66EB" />
            <Text style={styles.providerName}>{provider.name}</Text>
            <TouchableOpacity style={[styles.connectButton, provider.connected && styles.connectedButton]}>
              <Text style={[styles.connectText, provider.connected && styles.connectedText]}>{provider.connected ? 'Connected' : 'Connect'}</Text>
            </TouchableOpacity>
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
  sectionTitle: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12', marginBottom: 12 },
  providerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  providerName: { flex: 1, fontSize: 16, fontFamily: 'PlusJakartaSans_500Medium', color: '#0D0D12', marginLeft: 12 },
  connectButton: { backgroundColor: '#4D66EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  connectedButton: { backgroundColor: '#10b981' },
  connectText: { fontSize: 14, color: '#fff', fontFamily: 'PlusJakartaSans_500Medium' },
  connectedText: { color: '#fff' },
})
