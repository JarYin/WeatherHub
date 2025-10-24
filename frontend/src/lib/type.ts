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