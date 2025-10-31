export interface SevenDateResult {
    start: Date;
    end: Date;
    days: Date[]; // 7 days ending on selected date (each at 00:00:00.000)
}

/**
 * Returns start (00:00:00.000) and end (23:59:59.999) for the selected date,
 * plus an array of the last 7 days (each normalized to 00:00:00.000) ending on that date.
 * @param selectedDate Date | string | number - defaults to now if omitted
 */
export function getSevenDates(selectedDate?: Date | string | number): SevenDateResult {
    const base = selectedDate ? new Date(selectedDate) : new Date();

    const selectedDateStart = new Date(base);
    selectedDateStart.setHours(0, 0, 0, 0);

    const selectedDateEnd = new Date(base);
    selectedDateEnd.setHours(23, 59, 59, 999);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(base);
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
    });

    return {
        start: selectedDateStart,
        end: selectedDateEnd,
        days: last7Days,
    };
}