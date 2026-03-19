import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VoiceDictation() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')

  const startListening = async () => {
    try {
      setIsListening(true)
      setError('')
      // Voice recognition logic here
      setTranscript('Listening...')
    } catch (err) {
      setError('Voice recognition not available')
    }
  }

  const stopListening = () => {
    setIsListening(false)
    // Process transcript
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Dictation</Text>
        <Text style={styles.subtitle}>Hands-free case logging</Text>
      </View>

      <Card style={styles.micCard}>
        <Button
          onPress={isListening ? stopListening : startListening}
          style={[styles.micButton, isListening && styles.micButtonActive]}
        >
          <Ionicons name={isListening ? 'mic' : 'mic-outline'} size={48} color="#FFF" />
        </Button>
        {isListening && <ActivityIndicator size="large" color="#FF3B30" style={styles.spinner} />}
      </Card>

      {transcript && (
        <Card style={styles.transcriptCard}>
          <Text style={styles.transcriptLabel}>Transcript:</Text>
          <Text style={styles.transcript}>{transcript}</Text>
        </Card>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Ionicons name="alert-circle" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </Card>
      )}

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Tips:</Text>
        <Text style={styles.tipsText}>• Speak clearly and at normal pace</Text>
        <Text style={styles.tipsText}>• Use medical terminology</Text>
        <Text style={styles.tipsText}>• Review transcript before saving</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  header: { paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  micCard: { marginVertical: 20, padding: 40, alignItems: 'center' },
  micButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FF3B30', justifyContent: 'center', alignItems: 'center' },
  micButtonActive: { backgroundColor: '#FF3B30', animation: 'pulse 1s infinite' },
  spinner: { marginTop: 20 },
  transcriptCard: { marginVertical: 10, padding: 16 },
  transcriptLabel: { fontSize: 12, color: '#666', marginBottom: 8 },
  transcript: { fontSize: 16 },
  errorCard: { marginVertical: 10, padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFEBEE' },
  errorText: { marginLeft: 12, color: '#FF3B30' },
  tips: { marginTop: 20, padding: 16, backgroundColor: '#FFF', borderRadius: 8 },
  tipsTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  tipsText: { fontSize: 13, color: '#666', marginVertical: 2 },
})
