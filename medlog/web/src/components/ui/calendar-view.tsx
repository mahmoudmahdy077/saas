'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedCard } from '@/components/ui/animated-card'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type?: 'case' | 'deadline' | 'milestone' | 'meeting'
  description?: string
}

interface CalendarViewProps {
  events?: CalendarEvent[]
  onDateClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  showMonthView?: boolean
  showWeekView?: boolean
  showDayView?: boolean
}

export function CalendarView({
  events = [],
  onDateClick,
  onEventClick,
  showMonthView = true,
  showWeekView = false,
  showDayView = false,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [view, setView] = React.useState<'month' | 'week' | 'day'>('month')

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDayOfMonth }
  }

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate)

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) =>
        event.date.toDateString() === date.toDateString()
    )
  }

  const getEventTypeColor = (type?: CalendarEvent['type']) => {
    switch (type) {
      case 'case':
        return 'bg-blue-500'
      case 'deadline':
        return 'bg-red-500'
      case 'milestone':
        return 'bg-green-500'
      case 'meeting':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <AnimatedCard className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          {showMonthView && (
            <Button
              variant={view === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
          )}
          {showWeekView && (
            <Button
              variant={view === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
          )}
          {showDayView && (
            <Button
              variant={view === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('day')}
            >
              Day
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div className="grid grid-cols-7 gap-1">
          {/* Day Names */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 min-h-[80px]" />
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayEvents = getEventsForDate(date)
            const isToday = date.toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`p-2 min-h-[80px] border rounded-lg cursor-pointer transition-colors ${
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => onDateClick?.(date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isToday ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <motion.div
                      key={event.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-xs p-1 rounded bg-gray-100 dark:bg-gray-800 truncate cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getEventTypeColor(
                            event.type
                          )}`}
                        />
                        <span className="truncate">{event.title}</span>
                      </div>
                    </motion.div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="text-center py-12 text-gray-500">
          Week view coming soon...
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="text-center py-12 text-gray-500">
          Day view coming soon...
        </div>
      )}
    </AnimatedCard>
  )
}
