import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })
  const [isDarkMode, setIsDarkMode] = useState(false)
  const colorScheme = useColorScheme()

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  useEffect(() => {
    // Check if dark mode is enabled
    setIsDarkMode(colorScheme === 'dark')
  }, [colorScheme])

  if (!loaded) {
    return null
  }

  const theme = isDarkMode ? DarkTheme : DefaultTheme

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen 
            name="dashboard/enterprise" 
            options={{ 
              title: 'Enterprise',
              headerShown: true
            }} 
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
