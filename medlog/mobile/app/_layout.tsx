import { Stack } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'

export default function RootLayout() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  let [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4D66EB" />
      </View>
    )
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4D66EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold' },
        contentStyle: { backgroundColor: '#F9FAFB' }
      }}
    >
      {!session ? (
        <Stack.Screen
          name="(auth)/login"
          options={{ headerShown: false }}
        />
      ) : (
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
      )}
    </Stack>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
})
