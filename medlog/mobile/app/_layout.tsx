import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useAuthStore } from '../lib/stores/authStore'
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'

export default function RootLayout() {
  const { user, profile, initialized } = useAuthStore()
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    useAuthStore.getState().initialize()
  }, [])

  if (!initialized || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4D66EB" />
      </View>
    )
  }

  const isConsultant = profile?.role === 'consultant'
  const isProgramDirector = profile?.role === 'program_director'
  const isInstitutionAdmin = profile?.role === 'institution_admin'
  const isSuperAdmin = profile?.role === 'super_admin'

  const getRouteGroup = () => {
    if (!user) return '(auth)'
    if (isSuperAdmin) return '(super_admin)'
    if (isInstitutionAdmin) return '(institution_admin)'
    if (isProgramDirector) return '(program_director)'
    if (isConsultant) return '(consultant)'
    return '(main)' // resident
  }

  const routeGroup = getRouteGroup()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4D66EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold' },
        contentStyle: { backgroundColor: '#F9FAFB' }
      }}
    >
      <Stack.Screen
        name={routeGroup}
        options={{ headerShown: false }}
      />
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
