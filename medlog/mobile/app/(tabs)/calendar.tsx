import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FadeInView } from '@/components/ui/animated'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'case' | 'deadline' | 'milestone' | 'meeting'
  description?: string
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: '50 Case Milestone',
    date: new Date(),
    type: 'milestone',
    description: 'You\'ve logged 50 cases!',
  },
  {
    id: '2',
    title: 'Case Review Due',
    date: new Date(Date.now() + 86400000),
    type: 'deadline',
    description: 'Review 3 pending cases',
  },
  {
    id: '3',
    title: 'Grand Rounds',
    date: new Date(Date.now() + 172800000),
    type: 'meeting',
    description: 'Present interesting case',
  },
]

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(
      (event) => event.date.toDateString() === date.toDateString()
    )
  }

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'case':
        return { bg: '#E3F2FD', icon: '#007AFF', text: '#007AFF' }
      case 'deadline':
        return { bg: '#FFEBEE', icon: '#FF3B30', text: '#FF3B30' }
      case 'milestone':
        return { bg: '#E8F5E9', icon: '#34C759', text: '#34C759' }
      case 'meeting':
        return { bg: '#F3E5F5', icon: '#5856D6', text: '#5856D6' }
      default:
        return { bg: '#F5F5F5', icon: '#666', text: '#666' }
    }
  }

  const renderEvent = (event: CalendarEvent, index: number) => {
    const colors = getEventTypeColor(event.type)
    return (
      <FadeInView key={event.id} delay={index * 0.1}>
        <Card style={styles.eventCard}>
          <View style={[styles.eventIcon, { backgroundColor: colors.bg }]}>
            <Ionicons
              name={
                event.type === 'case' ? 'document-text' :
                event.type === 'deadline' ? 'warning' :
                event.type === 'milestone' ? 'trophy' : 'people'
              }
              size={20}
              color={colors.icon}
            />
          </View>
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>
            <Text style={styles.eventDate}>
              {event.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Badge variant={
            event.type === 'milestone' ? 'success' :
            event.type === 'deadline' ? 'destructive' : 'default'
          }>
            <Text style={styles.badgeText}>{event.type}</Text>
          </Badge>
        </Card>
      </FadeInView>
    )
  }

  const selectedEvents = getEventsForDate(selectedDate)

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Track your schedule & milestones</Text>
      </View>

      {/* Month Selector */}
      <Card style={styles.monthSelector}>
        <View style={styles.monthSelectorContent}>
          <Button variant="ghost" size="icon">
            <Ionicons name="chevron-back" size={20} color="#007AFF" />
          </Button>
          <Text style={styles.monthText}>March 2026</Text>
          <Button variant="ghost" size="icon">
            <Ionicons name="chevron-forward" size={20} color="#007AFF" />
          </Button>
        </View>
      </Card>

      {/* Today's Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Events</Text>
          <Badge variant="default">
            <Text style={styles.badgeCount}>{selectedEvents.length}</Text>
          </Badge>
        </View>
        {selectedEvents.length > 0 ? (
          selectedEvents.map((event, index) => renderEvent(event, index))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-clear" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No events today</Text>
          </Card>
        )}
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>
        {mockEvents.slice(1).map((event, index) => renderEvent(event, index))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button style={styles.actionButton} variant="default">
          <Ionicons name="add-circle" size={24} color="#FFF" />
          <Text style={styles.actionButtonText}>Add Event</Text>
        </Button>
        <Button style={styles.actionButton} variant="outline">
          <Ionicons name="sync" size={24} color="#007AFF" />
          <Text style={[styles.actionButtonText, styles.actionButtonTextOutline]}>Sync</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
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
  monthSelector: {
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  monthSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  badgeCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: '#999',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
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
