import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../../lib/stores/authStore'
import { supabase } from '../../../lib/stores/authStore'

const specialties = [
  { id: 'general-surgery', name: 'General Surgery' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'internal-medicine', name: 'Internal Medicine' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'obstetrics-gynecology', name: 'Obstetrics & Gynecology' },
  { id: 'psychiatry', name: 'Psychiatry' },
  { id: 'radiology', name: 'Radiology' },
  { id: 'anesthesiology', name: 'Anesthesiology' },
  { id: 'emergency-medicine', name: 'Emergency Medicine' },
  { id: 'other', name: 'Other' },
]

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp, loading } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    specialty: '',
  })
  const [specialtyList, setSpecialtyList] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    loadSpecialties()
  }, [])

  const loadSpecialties = async () => {
    const { data } = await supabase.from('specialties').select('id, name')
    if (data) setSpecialtyList(data)
  }

  const handleRegister = async () => {
    const { email, password, fullName, specialty } = formData
    
    if (!email || !password || !fullName || !specialty) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters')
      return
    }

    const { error } = await signUp(email, password, fullName, specialty)

    if (error) {
      Alert.alert('Error', error)
    } else {
      Alert.alert('Success', 'Account created! Please check your email to verify.')
      router.replace('/(auth)/login')
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start tracking your cases today</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Select Specialty</Text>
        <View style={styles.specialtyGrid}>
          {(specialtyList.length > 0 ? specialtyList : specialties).map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.specialtyChip,
                formData.specialty === s.id && styles.specialtyChipSelected,
              ]}
              onPress={() => setFormData({ ...formData, specialty: s.id })}
            >
              <Text
                style={[
                  styles.specialtyChipText,
                  formData.specialty === s.id && styles.specialtyChipTextSelected,
                ]}
              >
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.back()}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkHighlight}>Sign in</Text>
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
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0px 8px 24px rgba(77, 102, 235, 0.1)',
    elevation: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_400Regular',
    marginBottom: 16,
    color: '#0D0D12',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyChipSelected: {
    backgroundColor: '#4D66EB',
    borderColor: '#4D66EB',
  },
  specialtyChipText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#64748b',
  },
  specialtyChipTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4D66EB',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: '0px 4px 10px rgba(77, 102, 235, 0.3)',
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
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  linkHighlight: {
    color: '#4D66EB',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
})
