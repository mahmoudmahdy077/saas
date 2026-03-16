/**
 * Structured Logging for MedLog SaaS
 * Replaces console.* with proper logging including context
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  route?: string
  requestId?: string
  [key: string]: any
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProduction) {
      console.debug(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    console.info(this.formatMessage('info', message, context))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context))
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack
    }
    console.error(this.formatMessage('error', message, errorContext))
  }
}

export const logger = new Logger()

/**
 * Usage in API routes:
 * 
 * try {
 *   // Business logic
 * } catch (error) {
 *   logger.error('Failed to fetch cases', error as Error, {
 *     userId: user?.id,
 *     route: request.nextUrl.pathname
 *   })
 *   return NextResponse.json(
 *     { error: 'Internal server error', code: 'FETCH_CASES_FAILED' },
 *     { status: 500 }
 *   )
 * }
 */
