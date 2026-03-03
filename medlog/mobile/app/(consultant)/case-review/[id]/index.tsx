import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuthStore } from '../../../../lib/stores/authStore'
import { supabase } from '../../../../lib/stores/authStore'

interface Case {
  id: string
  title: string
  category: string
  description: string
  status: string
  cpt_code?: string
  icd_code?: string
  notes?: string
  resident_name: string
  created_at: string
}

export default function CaseReviewScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user } = useAuthStore()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadCase()
  }, [id])

  const loadCase = async () => {
    const { data } = await supabase
      .from('cases')
      .select('*, profiles(full_name)')
      .eq('id', id)
      .single()

    if (data) {
      setCaseData({
        ...data,
        resident_name: data.profiles?.full_name || 'Unknown',
      })
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    if (!user || !id) return

    const { error } = await supabase
      .from('cases')
      .update({
        status: 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Case verified successfully', [
        { text: 'OK', onPress: () => router.back() }
      ])
    }
  }

  const handleReject = async () => {
    if (!id) return

    Alert.prompt(
      'Reject Case',
      'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            const { error } = await supabase
              .from('cases')
              .update({ status: 'rejected', rejection_reason: reason })
              .eq('id', id)

            if (error) {
              Alert.alert('Error', error.message)
            } else {
              router.back()
            }
          },
        },
      ],
      'plain-text'
    )
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4D66EB" />
      </View>
    )
  }

  if (!caseData) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>Case not found</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0D0D12" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Case</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.residentRow}>
          <View style={styles.residentAvatar}>
            <MaterialCommunityIcons name="account" size={24} color="#4D66EB" />
          </View>
          <View>
            <Text style={styles.residentLabel}>Submitted by</Text>
            <Text style={styles.residentName}>{caseData.resident_name}</Text>
          </View>
        </View>

        <Text style={styles.title}>{caseData.title}</Text>
        <Text style={styles.category}>{caseData.category}</Text>

        {caseData.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.sectionContent}>{caseData.description}</Text>
          </View>
        )}

        <View style={styles.codesRow}>
          {caseData.cpt_code && (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>CPT Code</Text>
              <Text style={styles.codeValue}>{caseData.cpt_code}</Text>
            </View>
          )}
          {caseData.icd_code && (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>ICD-10 Code</Text>
              <Text style={styles.codeValue}>{caseData.icd_code}</Text>
            </View>
          )}
        </View>

        {caseData.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.sectionContent}>{caseData.notes}</Text>
          </View>
        )}

        <Text style={styles.dateText}>
          Submitted: {new Date(caseData.created_at).toLocaleString()}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.verifyButton]}
            onPress={handleVerify}
          >
            <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Verify Case</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={handleReject}
          >
            <MaterialCommunityIcons name="close-circle" size={22} color="#fff" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 16,
  },
  residentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4D66EB' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  residentLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  residentName: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#0D0D12',
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#4D66EB',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
  },
  codesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  codeCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  codeLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  codeValue: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4D66EB',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  verifyButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
