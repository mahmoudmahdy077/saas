import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../../../lib/stores/authStore'
import { supabase } from '../../../../lib/stores/authStore'

interface Category {
  id: string
  name: string
}

export default function AddCaseScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    cpt_code: '',
    icd_code: '',
    notes: '',
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('case_categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const handleSubmit = async () => {
    if (!user) return
    
    if (!formData.title || !formData.category) {
      Alert.alert('Error', 'Please fill in required fields')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.from('cases').insert({
      user_id: user.id,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      cpt_code: formData.cpt_code,
      icd_code: formData.icd_code,
      notes: formData.notes,
      status: 'pending',
    })

    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Case added successfully')
      router.back()
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add New Case</Text>
      <Text style={styles.subtitle}>Log a new case for tracking</Text>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Case title"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  formData.category === cat.id && styles.categoryChipSelected,
                ]}
                onPress={() => setFormData({ ...formData, category: cat.id })}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    formData.category === cat.id && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Case description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>CPT Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 47562"
              value={formData.cpt_code}
              onChangeText={(text) => setFormData({ ...formData, cpt_code: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>ICD-10 Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. K80.00"
              value={formData.icd_code}
              onChangeText={(text) => setFormData({ ...formData, icd_code: text })}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Additional notes"
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={3}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Case'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#0D0D12',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#4D66EB',
    borderColor: '#4D66EB',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4D66EB',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#4D66EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
