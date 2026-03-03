import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function TemplatesScreen() {
  const templates = [
    { id: '1', name: 'General Surgery', category: 'Surgery', fields: 12 },
    { id: '2', name: 'Laparoscopic Appendectomy', category: 'Surgery', fields: 8 },
    { id: '3', name: 'Vascular Case', category: 'Surgery', fields: 15 },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <TouchableOpacity style={styles.addButton}><MaterialCommunityIcons name="plus" size={20} color="#fff" /></TouchableOpacity>
      </View>
      <View style={styles.section}>
        {templates.map((template) => (
          <TouchableOpacity key={template.id} style={styles.templateCard}>
            <View style={styles.templateIcon}><MaterialCommunityIcons name="file-document" size={24} color="#4D66EB" /></View>
            <View style={styles.templateInfo}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateMeta}>{template.category} • {template.fields} fields</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontFamily: 'PlusJakartaSans_700Bold', color: '#0D0D12' },
  addButton: { backgroundColor: '#4D66EB', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  section: { padding: 16 },
  templateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  templateIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#4D66EB' + '15', justifyContent: 'center', alignItems: 'center' },
  templateInfo: { flex: 1, marginLeft: 12 },
  templateName: { fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold', color: '#0D0D12' },
  templateMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
})
