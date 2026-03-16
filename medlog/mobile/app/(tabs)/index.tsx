import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatedCounter, ProgressBar } from '@/components/ui/animated'

interface DashboardData {
  totalCases: number
  thisMonth: number
  verified: number
  pending: number
  currentStreak: number
  longestStreak: number
  recentCases: Array<{
    id: string
    date: string
    procedure_type: string
    category: string
    verification_status: string
  }>
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cases/stats`)
      const stats = await response.json()
      
      const casesResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cases?limit=5`)
      const cases = await casesResponse.json()

      setData({
        totalCases: stats.totalCases || 0,
        thisMonth: stats.thisMonth || 0,
        verified: stats.verified || 0,
        pending: stats.pending || 0,
        currentStreak: 7,
        longestStreak: 21,
        recentCases: cases.cases || [],
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Ionicons name="refresh" size={32} color="#007AFF" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#007AFF', '#00C6FF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#FFF" />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="document-text" size={20} color="#007AFF" />
          </View>
          <Text style={styles.statValue}>{data?.totalCases || 0}</Text>
          <Text style={styles.statLabel}>Total Cases</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="trending-up" size={20} color="#34C759" />
          </View>
          <Text style={styles.statValue}>{data?.thisMonth || 0}</Text>
          <Text style={styles.statLabel}>This Month</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#5856D6" />
          </View>
          <Text style={styles.statValue}>{data?.verified || 0}</Text>
          <Text style={styles.statLabel}>Verified</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="time" size={20} color="#FF9500" />
          </View>
          <Text style={styles.statValue}>{data?.pending || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </Card>
      </View>

      {/* Streak Card */}
      <Card style={styles.streakCard}>
        <LinearGradient
          colors={['rgba(0, 122, 255, 0.1)', 'rgba(0, 198, 255, 0.05)']}
          style={styles.streakGradient}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakInfo}>
              <Text style={styles.streakLabel}>Current Streak</Text>
              <Text style={styles.streakValue}>
                <AnimatedCounter value={data?.currentStreak || 0} suffix=" days" />
              </Text>
              <Text style={styles.streakSubtext}>Keep logging cases daily!</Text>
            </View>
            <View style={styles.streakIcon}>
              <Ionicons name="flame" size={40} color="#FF3B30" />
            </View>
          </View>
          <ProgressBar value={data?.currentStreak || 0} max={30} color="#007AFF" />
          <Text style={styles.streakProgress}>
            {30 - (data?.currentStreak || 0)} days until next milestone
          </Text>
        </LinearGradient>
      </Card>

      {/* Recent Cases */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Cases</Text>
          <Button variant="ghost" size="sm">
            <Text style={styles.seeAll}>See All</Text>
          </Button>
        </View>
        {data?.recentCases.map((caseItem, index) => (
          <View key={caseItem.id} style={styles.caseItem}>
            <View style={styles.caseIcon}>
              <Ionicons 
                name={
                  caseItem.verification_status === 'verified' ? 'checkmark-circle' :
                  caseItem.verification_status === 'pending' ? 'time' : 'document'
                } 
                size={20} 
                color={
                  caseItem.verification_status === 'verified' ? '#34C759' :
                  caseItem.verification_status === 'pending' ? '#FF9500' : '#007AFF'
                } 
              />
            </View>
            <View style={styles.caseContent}>
              <Text style={styles.caseTitle}>{caseItem.procedure_type}</Text>
              <Text style={styles.caseSubtitle}>
                {new Date(caseItem.date).toLocaleDateString()} • {caseItem.category}
              </Text>
            </View>
            <Badge 
              variant={
                caseItem.verification_status === 'verified' ? 'success' :
                caseItem.verification_status === 'pending' ? 'warning' : 'default'
              }
            >
              <Text style={styles.badgeText}>{caseItem.verification_status}</Text>
            </Badge>
          </View>
        ))}
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button style={styles.actionButton} variant="default">
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Log Case</Text>
        </Button>
        <Button style={styles.actionButton} variant="outline">
          <Ionicons name="stats-chart" size={24} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Analytics</Text>
        </Button>
      </View>

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    width: '48%',
    padding: 16,
  },
  statHeader: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  streakCard: {
    margin: 16,
    marginTop: 0,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 20,
    borderRadius: 12,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  streakSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  streakIcon: {
    marginLeft: 16,
  },
  streakProgress: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
  },
  caseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  caseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  caseContent: {
    flex: 1,
  },
  caseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  caseSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  actionButtonTextOutline: {
    color: '#007AFF',
  },
})
