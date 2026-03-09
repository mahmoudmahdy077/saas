import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Notifications only work on physical devices')
      return false
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted')
      return false
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
      })
    }

    return true
  },

  async scheduleCaseReminder(hour: number = 21, minute: number = 0): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return null

    await Notifications.cancelAllScheduledNotificationsAsync()

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Log Your Cases! 📋',
        body: "Don't break your streak. Log your cases for today.",
        data: { type: 'case_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })

    return id
  },

  async scheduleWeeklyReport(dayOfWeek: number = 1): Promise<string | null> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return null

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Report Ready 📊',
        body: 'Your weekly case summary is ready. Check out your progress!',
        data: { type: 'weekly_report' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek,
        hour: 9,
        minute: 0,
      } as Notifications.WeeklyTriggerInput,
    })

    return id
  },

  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) return

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null,
    })
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync()
  },

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync()
  },

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count)
  },
}
