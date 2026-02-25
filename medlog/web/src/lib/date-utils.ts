/**
 * Formats a date to YYYY-MM-DD in a given timezone
 */
export function getLocalDate(timezone: string = 'UTC', date: Date = new Date()): string {
    try {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date)
    } catch (e) {
        console.error(`Invalid timezone: ${timezone}, falling back to UTC`)
        return date.toISOString().split('T')[0]
    }
}

/**
 * Gets the localized "yesterday" date
 */
export function getLocalYesterday(timezone: string = 'UTC', date: Date = new Date()): string {
    const yesterday = new Date(date)
    yesterday.setDate(yesterday.getDate() - 1)
    return getLocalDate(timezone, yesterday)
}

/**
 * Checks if two dates are consecutive in a given timezone
 */
export function isConsecutive(lastDate: string, currentDate: string, timezone: string = 'UTC'): boolean {
    const last = new Date(lastDate)
    const current = new Date(currentDate)

    // Difference in days
    const diffTime = current.getTime() - last.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    return diffDays === 1
}
