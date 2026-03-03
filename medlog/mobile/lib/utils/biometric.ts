import * as LocalAuthentication from 'expo-local-authentication'

export interface BiometricResult {
  success: boolean
  error?: string
}

export const isBiometricAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync()
    const enrolled = await LocalAuthentication.isEnrolledAsync()
    return compatible && enrolled
  } catch {
    return false
  }
}

export const getBiometricType = async (): Promise<string> => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID'
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint'
    }
    return 'Biometric'
  } catch {
    return 'Biometric'
  }
}

export const authenticateWithBiometric = async (): Promise<BiometricResult> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to sign in to MedLog',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    })

    return {
      success: result.success,
      error: result.success ? undefined : 'Authentication failed',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Biometric authentication failed',
    }
  }
}
