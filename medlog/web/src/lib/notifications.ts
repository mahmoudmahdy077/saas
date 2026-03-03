import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://postgres:${process.env.DB_PASSWORD || 'medlog2024'}@db:5432/medlog`
})

export interface CreateNotificationParams {
  userId: string
  type: 'reminder' | 'streak' | 'achievement' | 'gap_alert' | 'verification' | 'milestone' | 'subscription' | 'system'
  title: string
  message: string
  data?: Record<string, any>
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      params.userId,
      params.type,
      params.title,
      params.message,
      params.data || {}
    ])
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

export async function createNotificationForInstitution(
  institutionId: string,
  type: CreateNotificationParams['type'],
  title: string,
  message: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const result = await pool.query(`
      SELECT id FROM public.profiles 
      WHERE institution_id = $1 AND role IN ('program_director', 'institution_admin')
    `, [institutionId])

    for (const row of result.rows) {
      await createNotification({
        userId: row.id,
        type,
        title,
        message,
        data
      })
    }
  } catch (error) {
    console.error('Failed to create institution notification:', error)
  }
}

export async function queueEmail(
  userId: string,
  email: string,
  subject: string,
  body: string
): Promise<void> {
  try {
    await pool.query(`
      INSERT INTO public.email_queue (user_id, email, subject, body)
      VALUES ($1, $2, $3, $4)
    `, [userId, email, subject, body])
  } catch (error) {
    console.error('Failed to queue email:', error)
  }
}

export const NotificationTypes = {
  REMINDER: 'reminder',
  STREAK: 'streak',
  ACHIEVEMENT: 'achievement',
  GAP_ALERT: 'gap_alert',
  VERIFICATION: 'verification',
  MILESTONE: 'milestone',
  SUBSCRIPTION: 'subscription',
  SYSTEM: 'system',
} as const

export const NotificationMessages = {
  CASE_REMINDER: (streak: number) => ({
    title: 'Case Logging Reminder',
    message: `You haven't logged any cases in ${streak} day(s). Keep your streak going!`
  }),
  STREAK_BREAK: (streak: number) => ({
    title: 'Streak Lost',
    message: `Your ${streak}-day logging streak has ended. Start fresh today!`
  }),
  VERIFICATION_REQUESTED: (caseTitle: string) => ({
    title: 'Verification Request',
    message: `A case "${caseTitle}" is awaiting your verification.`
  }),
  CASE_VERIFIED: (caseTitle: string) => ({
    title: 'Case Verified',
    message: `Your case "${caseTitle}" has been verified.`
  }),
  MILESTONE_COMPLETE: (milestone: string) => ({
    title: 'Milestone Achieved',
    message: `Congratulations! You've completed the ${milestone} milestone.`
  }),
  SUBSCRIPTION_EXPIRING: (days: number) => ({
    title: 'Subscription Expiring',
    message: `Your subscription will expire in ${days} days. Please renew to continue premium features.`
  }),
  GAP_ALERT: (category: string) => ({
    title: 'Case Gap Detected',
    message: `You're below the minimum for ${category}. Consider logging more cases in this category.`
  }),
}
