import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'

const specialties = [
  { id: 'general-surgery', name: 'General Surgery' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'internal-medicine', name: 'Internal Medicine' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'other', name: 'Other' },
]

const procedures: Record<string, string[]> = {
  'general-surgery': ['Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Bowel Resection', 'Mastectomy'],
  'orthopedics': ['Knee Arthroscopy', 'Hip Replacement', 'ACL Reconstruction', 'Fracture Fixation'],
  'internal-medicine': ['Colonoscopy', 'EGD', 'Bronchoscopy', 'Lumbar Puncture', 'Central Line'],
  'pediatrics': ['Circumcision', 'Hernia Repair', 'Appendectomy'],
  'other': ['Other Procedure'],
}

const roles = [
  { id: 'primary', label: 'Primary Operator' },
  { id: 'assistant', label: 'First Assistant' },
  { id: 'observer', label: 'Observer' },
]

export default function AddCaseScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    specialty: '',
    procedure: '',
    role: 'primary',
    diagnosis: '',
    notes: '',
  })

  const availableProcedures = formData.specialty ? procedures[formData.specialty] || [] : []

  const handleSubmit = async () => {
    if (!formData.specialty || !formData.procedure || !formData.role) {
      Alert.alert('Error', 'Please fill in required fields')
      return
    }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('cases').insert({
      user_id: user.id,
      date: formData.date,
      category: formData.specialty,
      procedure_type: formData.procedure,
      role: formData.role,
      diagnosis: formData.diagnosis,
      notes: formData.notes,
      verification_status: 'self',
    })

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Case logged successfully!')
      router.push('/(tabs)')
    }
    setLoading(false)
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(text) => setFormData({ ...formData, date: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        {/* Specialty */}
        <View style={styles.field}>
          <Text style={styles.label}>Specialty *</Text>
          <View style={styles.chipContainer}>
            {specialties.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, formData.specialty === s.id && styles.chipSelected]}
                onPress={() => setFormData({ ...formData, specialty: s.id, procedure: '' })}
              >
                <Text style={[styles.chipText, formData.specialty === s.id && styles.chipTextSelected]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Procedure */}
        {formData.specialty && (
          <View style={styles.field}>
            <Text style={styles.label}>Procedure *</Text>
            <View style={styles.chipContainer}>
              {availableProcedures.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, formData.procedure === p && styles.chipSelected]}
                  onPress={() => setFormData({ ...formData, procedure: p })}
                >
                  <Text style={[styles.chipText, formData.procedure === p && styles.chipTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Role */}
        <View style={styles.field}>
          <Text style={styles.label}>Your Role *</Text>
          <View style={styles.chipContainer}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.chip, formData.role === r.id && styles.chipSelected]}
                onPress={() => setFormData({ ...formData, role: r.id })}
              >
                <Text style={[styles.chipText, formData.role === r.id && styles.chipTextSelected]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.field}>
          <Text style={styles.label}>Diagnosis</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.diagnosis}
            onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
            placeholder="Enter diagnosis"
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.submitText}>{loading ? 'Saving...' : 'Save Case'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipSelected: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  chipText: { fontSize: 14, color: '#64748b' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
