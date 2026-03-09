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
  created_at: string
  user_id?: string
  verified_by?: string
  verified_at?: string
}

export default function CaseDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { user, profile } = useAuthStore()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const isConsultantOrAbove = ['consultant', 'program_director', 'institution_admin', 'super_admin'].includes(profile?.role || '')

  useEffect(() => {
    if (id) loadCase()
  }, [id])

  const loadCase = async () => {
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single()
    
    setCaseData(data)
    setLoading(false)
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Case',
      'Are you sure you want to delete this case? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteCase },
      ]
    )
  }

  const deleteCase = async () => {
    setDeleting(true)
    const { error } = await supabase.from('cases').delete().eq('id', id)
    setDeleting(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      router.back()
    }
  }

  const handleVerify = async () => {
    const { error } = await supabase
      .from('cases')
      .update({ 
        status: 'verified',
        verified_by: user?.id,
        verified_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      loadCase()
      Alert.alert('Success', 'Case verified')
    }
  }

  const handleReject = async () => {
    const { error } = await supabase
      .from('cases')
      .update({ status: 'rejected' })
      .eq('id', id)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      loadCase()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#10b981'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#64748b'
    }
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
        {user?.id === caseData.user_id && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <MaterialCommunityIcons name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{caseData.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(caseData.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(caseData.status) }]}>
              {caseData.status}
            </Text>
          </View>
        </View>

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

        <View style={styles.metaSection}>
          <Text style={styles.metaText}>
            Created: {new Date(caseData.created_at).toLocaleDateString()}
          </Text>
          {caseData.verified_at && (
            <Text style={styles.metaText}>
              Verified: {new Date(caseData.verified_at).toLocaleDateString()}
            </Text>
          )}
        </View>

        {isConsultantOrAbove && caseData.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.verifyButton]}
              onPress={handleVerify}
            >
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Verify Case</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
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
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#0D0D12',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textTransform: 'capitalize',
  },
  category: {
    fontSize: 16,
    color: '#64748b',
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
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4D66EB',
  },
  metaSection: {
    marginBottom: 24,
  },
  metaText: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
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
