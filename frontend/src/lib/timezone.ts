// /d:/code/nextJS/WeatherHub/frontend/src/lib/timezone.ts
/**
 * Returns the current IANA time zone followed by the current live local time in that zone.
 *
 * Example: "America/Los_Angeles 2025-10-24 15:03:12"
 */
export function timezone(): string {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const now = new Date()
    // Use 'sv-SE' to get a stable "YYYY-MM-DD HH:mm:ss" style output in most environments
    const local = now.toLocaleString('sv-SE', { timeZone: tz, hour12: false })
    return `${tz} ${local}`
}

/**
 * Returns structured information about the current timezone and local time.
 */
export function timezoneInfo() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    const now = new Date()
    const local = now.toLocaleString('sv-SE', { timeZone: tz, hour12: false })
    return {
        timeZone: tz,
        localTime: local,
        timestamp: now.getTime()
    }
}

export default timezone