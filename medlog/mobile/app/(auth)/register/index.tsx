import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    specialty: '',
  })
  const [loading, setLoading] = useState(false)

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

    setLoading(true)
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (authError) {
      Alert.alert('Error', authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        role: 'resident',
        specialty_id: specialty,
        notification_settings: { reminder_enabled: true, reminder_time: '21:00', vacation_mode: false },
      })

      if (profileError) {
        Alert.alert('Error', 'Failed to create profile')
      } else {
        Alert.alert('Success', 'Account created! Please check your email to verify.')
        router.replace('/(auth)/login')
      }
    }
    
    setLoading(false)
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

        <TextInput
          style={styles.input}
          placeholder="Select Specialty"
          value={specialties.find(s => s.id === formData.specialty)?.name || ''}
          editable={false}
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.specialtyGrid}>
          {specialties.map((s) => (
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
    backgroundColor: '#f0f9ff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0c4a6e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#1f2937',
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  specialtyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  specialtyChipSelected: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  specialtyChipText: {
    fontSize: 14,
    color: '#64748b',
  },
  specialtyChipTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkHighlight: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
})
