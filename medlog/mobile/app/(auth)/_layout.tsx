import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#4D66EB' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#F9FAFB' }
      }}
    >
      <Stack.Screen
        name="login/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="register/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="forgot-password/index"
        options={{
          title: 'Reset Password',
          headerShown: true
        }}
      />
    </Stack>
  )
}
