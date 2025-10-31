export function localTimeISO(date = new Date()) {
    // Get system timezone name automatically (e.g., "Asia/Bangkok")
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const parts = formatter.formatToParts(date).reduce((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {} as Record<string, string>);

    // Calculate timezone offset manually
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0');
    const mins = String(Math.abs(offsetMinutes) % 60).padStart(2, '0');

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${sign}${hours}:${mins}`;
}
