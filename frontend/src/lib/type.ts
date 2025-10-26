export interface Weather {
    id: number;
    location_id: string;
    timestamp: string;
    temperature: number | null;
    humidity: number | null;
    rain_mm: number | null;
    wind_speed: number | null;
    weather_code: number | null;
    granularity: string;
}

export interface DailySummary {
    id: number;
    locationId: string;
    date: string;
    temp_max: number | null;
    temp_min: number | null;
    rain_total: number | null;
    wind_max: number | null;
}