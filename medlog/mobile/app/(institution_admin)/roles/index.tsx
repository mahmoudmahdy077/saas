import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function RolesScreen() {
  const roles = [
    { id: 'resident', name: 'Resident', description: 'Can log cases and view own progress', permissions: 3 },
    { id: 'consultant', name: 'Consultant', description: 'Can verify resident cases', permissions: 5 },
    { id: 'program_director', name: 'Program Director', description: 'Can manage residents and view reports', permissions: 8 },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Role Management</Text></View>
      <View style={styles.section}>
        {roles.map((role) => (
          <TouchableOpacity key={role.id} style={styles.roleCard}>
            <View style={styles.roleInfo}>
              <Text style={styles.roleName}>{role.name}</Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
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
  roleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  roleInfo: { flex: 1 },
  roleName: { fontSize: 16, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  roleDesc: { fontSize: 13, color: '#64748b', marginTop: 2 },
})
