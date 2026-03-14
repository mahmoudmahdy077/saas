import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeInView, SlideInLeftView, ZoomInView, BouncyButton, ProgressBar, AnimatedCounter } from '@/components/ui/animated'

export default function DemoScreen() {
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>UI Component Demo</Text>
            <Text style={styles.subtitle}>Testing mobile animations</Text>
          </View>
          <Button onPress={() => setLoading(!loading)} variant="outline" size="sm">
            <Text style={styles.headerButtonText}>{loading ? 'Stop' : 'Test'}</Text>
          </Button>
        </View>
      </FadeInView>

      {/* Animated Counter */}
      <FadeInView delay={0.1}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>1. Animated Counter</Text>
          <View style={styles.counterRow}>
            <View style={styles.counterItem}>
              <Text style={styles.counterLabel}>Total</Text>
              <Text style={styles.counterValue}>
                <AnimatedCounter value={156} duration={1500} />
              </Text>
            </View>
            <View style={styles.counterItem}>
              <Text style={styles.counterLabel}>Streak</Text>
              <Text style={[styles.counterValue, styles.counterValueGreen]}>
                <AnimatedCounter value={7} suffix=" days" duration={1000} />
              </Text>
            </View>
          </View>
        </Card>
      </FadeInView>

      {/* Progress Bars */}
      <SlideInLeftView delay={0.2}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>2. Progress Bars</Text>
          <View style={styles.progressSection}>
            <ProgressBar value={70} max={100} color="#007AFF" showLabel />
            <ProgressBar value={45} max={100} color="#34C759" showLabel />
            <ProgressBar value={30} max={100} color="#FF9500" showLabel />
          </View>
        </Card>
      </SlideInLeftView>

      {/* Bouncy Buttons */}
      <ZoomInView delay={0.3}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>3. Bouncy Buttons</Text>
          <View style={styles.buttonRow}>
            <BouncyButton
              onPress={() => setCount(c => c + 1)}
              style={styles.bouncyButton}
            >
              <View style={[styles.buttonContent, styles.buttonPrimary]}>
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Add</Text>
              </View>
            </BouncyButton>
            <BouncyButton
              onPress={() => setCount(0)}
              style={styles.bouncyButton}
            >
              <View style={[styles.buttonContent, styles.buttonSecondary]}>
                <Ionicons name="refresh" size={20} color="#007AFF" />
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>Reset</Text>
              </View>
            </BouncyButton>
          </View>
          <View style={styles.countDisplay}>
            <Text style={styles.countLabel}>Count:</Text>
            <Text style={styles.countValue}>{count}</Text>
          </View>
        </Card>
      </ZoomInView>

      {/* Loading States */}
      <FadeInView delay={0.4}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>4. Loading States</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.loadedContent}>
              <View style={styles.loadedItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.loadedText}>Component 1</Text>
              </View>
              <View style={styles.loadedItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.loadedText}>Component 2</Text>
              </View>
              <View style={styles.loadedItem}>
                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                <Text style={styles.loadedText}>Component 3</Text>
              </View>
            </View>
          )}
        </Card>
      </FadeInView>

      {/* Badge Variants */}
      <SlideInLeftView delay={0.5}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>5. Badge Variants</Text>
          <View style={styles.badgeRow}>
            <Badge variant="default">
              <Text style={styles.badgeText}>Default</Text>
            </Badge>
            <Badge variant="success">
              <Text style={styles.badgeText}>Success</Text>
            </Badge>
            <Badge variant="warning">
              <Text style={styles.badgeText}>Warning</Text>
            </Badge>
            <Badge variant="destructive">
              <Text style={styles.badgeText}>Error</Text>
            </Badge>
          </View>
        </Card>
      </SlideInLeftView>

      {/* Card Animations */}
      <ZoomInView delay={0.6}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>6. Card Animations</Text>
          <View style={styles.cardGrid}>
            <FadeInView delay={0.1}>
              <Card style={styles.smallCard}>
                <Ionicons name="document-text" size={24} color="#007AFF" />
                <Text style={styles.smallCardText}>Cases</Text>
              </Card>
            </FadeInView>
            <FadeInView delay={0.2}>
              <Card style={styles.smallCard}>
                <Ionicons name="people" size={24} color="#34C759" />
                <Text style={styles.smallCardText}>Users</Text>
              </Card>
            </FadeInView>
            <FadeInView delay={0.3}>
              <Card style={styles.smallCard}>
                <Ionicons name="stats-chart" size={24} color="#FF9500" />
                <Text style={styles.smallCardText}>Stats</Text>
              </Card>
            </FadeInView>
          </View>
        </Card>
      </ZoomInView>

      {/* Feature List */}
      <SlideInLeftView delay={0.7}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>7. Animated List</Text>
          <View style={styles.featureList}>
            {[
              { icon: 'checkmark', text: 'Fade animations', color: '#007AFF' },
              { icon: 'arrow-forward', text: 'Slide animations', color: '#34C759' },
              { icon: 'expand', text: 'Zoom animations', color: '#FF9500' },
              { icon: 'repeat', text: 'Bouncy buttons', color: '#5856D6' },
              { icon: 'pulse', text: 'Progress bars', color: '#FF3B30' },
            ].map((feature, index) => (
              <FadeInView key={index} delay={0.1 * index}>
                <View style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: feature.color + '20' }]}>
                    <Ionicons name={feature.icon as any} size={16} color={feature.color} />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              </FadeInView>
            ))}
          </View>
        </Card>
      </SlideInLeftView>

      {/* Footer */}
      <FadeInView delay={0.8}>
        <View style={styles.footer}>
          <Ionicons name="checkmark-circle" size={32} color="#34C759" />
          <Text style={styles.footerText}>All components tested!</Text>
          <Text style={styles.footerSubtext}>Built with React Native Reanimated</Text>
        </View>
      </FadeInView>

      {/* Bottom Padding */}
      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  counterItem: {
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  counterValueGreen: {
    color: '#34C759',
  },
  progressSection: {
    spaceY: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bouncyButton: {
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#E3F2FD',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  buttonTextSecondary: {
    color: '#007AFF',
  },
  countDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  countLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  countValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  loadedContent: {
    spaceY: 12,
  },
  loadedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  loadedText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#000',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  smallCard: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallCardText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  featureList: {
    spaceY: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#000',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
})
