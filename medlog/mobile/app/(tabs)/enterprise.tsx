import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ionicons } from '@expo/vector-icons'

/**
 * Enterprise Dashboard - Mobile
 * For program directors and administrators
 */

interface EnterpriseStats {
  totalResidents: number
  activeThisMonth: number
  totalCases: number
  complianceRate: number
  topPerformers: Array<{
    id: string
    name: string
    caseCount: number
    growth: number
  }>
  atRiskResidents: Array<{
    id: string
    name: string
    deficit: number
    year: number
  }>
}

export default function EnterpriseDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState<EnterpriseStats>({
    totalResidents: 0,
    activeThisMonth: 0,
    totalCases: 0,
    complianceRate: 0,
    topPerformers: [],
    atRiskResidents: []
  })

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/institution/analytics`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch enterprise stats:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchStats()
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Enterprise Dashboard</Text>
        <Text style={styles.subtitle}>Institution analytics</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <Card style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Total Residents</Text>
            <Ionicons name="people" size={20} color="#666" />
          </View>
          <Text style={styles.kpiValue}>{stats.totalResidents}</Text>
          <Text style={styles.kpiSubtext}>{stats.activeThisMonth} active</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Total Cases</Text>
            <Ionicons name="document-text" size={20} color="#666" />
          </View>
          <Text style={styles.kpiValue}>{stats.totalCases.toLocaleString()}</Text>
          <Text style={styles.kpiSubtext}>All time</Text>
        </Card>

        <Card style={styles.kpiCard}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>Compliance</Text>
            <Ionicons name="shield-checkmark" size={20} color="#666" />
          </View>
          <Text style={styles.kpiValue}>{stats.complianceRate}%</Text>
          <Text style={styles.kpiSubtext}>ACGME requirements</Text>
        </Card>
      </View>

      {/* Top Performers */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Performers</Text>
          <Ionicons name="trophy" size={20} color="#FFD700" />
        </View>
        {stats.topPerformers.map((performer, index) => (
          <View key={performer.id} style={styles.listItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listTitle}>{performer.name}</Text>
              <Text style={styles.listSubtitle}>{performer.caseCount} cases</Text>
            </View>
            <Badge variant="success">
              <Ionicons name="trending-up" size={12} color="#34C759" />
              <Text style={styles.badgeText}>+{performer.growth}%</Text>
            </Badge>
          </View>
        ))}
      </Card>

      {/* At-Risk Residents */}
      {stats.atRiskResidents.length > 0 && (
        <Card style={[styles.section, styles.alertSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, styles.alertTitle]}>Needs Attention</Text>
            <Ionicons name="warning" size={20} color="#FF3B30" />
          </View>
          {stats.atRiskResidents.map((resident) => (
            <View key={resident.id} style={styles.listItem}>
              <View style={styles.alertBadge}>
                <Ionicons name="flag" size={16} color="#FF3B30" />
              </View>
              <View style={styles.listContent}>
                <Text style={styles.listTitle}>{resident.name}</Text>
                <Text style={styles.listSubtitle}>Year {resident.year}</Text>
              </View>
              <Badge variant="destructive">
                <Text style={styles.badgeText}>{resident.deficit} behind</Text>
              </Badge>
            </View>
          ))}
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actions}>
        <Button style={styles.actionButton} variant="default">
          <Ionicons name="download" size={18} color="#FFF" />
          <Text style={styles.actionButtonText}>Export Report</Text>
        </Button>
        <Button style={styles.actionButton} variant="outline">
          <Ionicons name="refresh" size={18} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Refresh</Text>
        </Button>
      </View>
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
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    width: '48%',
    padding: 16,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  kpiSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  alertSection: {
    borderColor: '#FF3B30',
    borderWidth: 1,
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
  alertTitle: {
    color: '#FF3B30',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  alertBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  listSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  actionButtonTextOutline: {
    color: '#007AFF',
  },
})
