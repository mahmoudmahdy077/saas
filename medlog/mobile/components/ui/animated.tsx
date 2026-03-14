import React, { useEffect, useState } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  SlideInLeft,
  ZoomIn,
} from 'react-native-reanimated'

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      setCount(Math.floor(value * progress))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [value, duration])

  return (
    <Text style={{ fontWeight: 'bold' }}>
      {prefix}{count.toLocaleString()}{suffix}
    </Text>
  )
}

export function ProgressBar({
  value,
  max = 100,
  color = '#007AFF',
  height = 8,
  showLabel = false,
}: {
  value: number
  max?: number
  color?: string
  height?: number
  showLabel?: boolean
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const animatedWidth = useSharedValue(0)

  useEffect(() => {
    animatedWidth.value = withTiming(percentage, { duration: 500 })
  }, [percentage])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }))

  return (
    <View style={styles.progressContainer}>
      {showLabel && (
        <View style={styles.progressLabel}>
          <Text style={styles.progressLabelText}>Progress</Text>
          <Text style={styles.progressLabelValue}>{Math.round(percentage)}%</Text>
        </View>
      )}
      <View style={[styles.progressTrack, { height }]}>
        <Animated.View
          style={[
            animatedStyle,
            styles.progressFill,
            { backgroundColor: color, height },
          ]}
        />
      </View>
    </View>
  )
}

export function FadeInView({
  children,
  delay = 0,
  duration = 300,
}: {
  children: React.ReactNode
  delay?: number
  duration?: number
}) {
  return (
    <Animated.View entering={FadeIn.duration(duration).delay(delay)}>
      {children}
    </Animated.View>
  )
}

export function SlideInLeftView({
  children,
  delay = 0,
  distance = 20,
}: {
  children: React.ReactNode
  delay?: number
  distance?: number
}) {
  return (
    <Animated.View entering={SlideInLeft.duration(300).delay(delay)}>
      {children}
    </Animated.View>
  )
}

export function ZoomInView({
  children,
  delay = 0,
  scale = 0.9,
}: {
  children: React.ReactNode
  delay?: number
  scale?: number
}) {
  return (
    <Animated.View entering={ZoomIn.duration(300).delay(delay)}>
      {children}
    </Animated.View>
  )
}

export function BouncyButton({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode
  onPress: () => void
  style?: any
}) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  return (
    <Animated.View
      style={[animatedStyle, style]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {children}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  progressContainer: {
    width: '100%',
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  progressLabelValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressTrack: {
    width: '100%',
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
})
