import apiClient from "@/lib/axios";
import { Location } from "@/modules/locations/type";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getUserIP } from "@/lib/ip";

const rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 60,
});

export const weatherAPI = {
    getLatest: async (location_id: string) => {
        const response = await apiClient.get("/weather/latest", {
            params: { location_id },
        });
        return response.data;
    },
    getHourly: async (location_id: string, from: string, to: string) => {
        const response = await apiClient.get("/weather/hourly", {
            params: { location_id, from, to },
        });
        return response.data;
    },
    getDaily: async (location_id: string, from: string, to: string) => {
        const response = await apiClient.get("/weather/daily", {
            params: { location_id, from, to },
        });
        return response.data;
    },
    exportCSV: async (location_id: string, from: string, to: string, type: 'hourly' | 'daily') => {
        const response = await apiClient.get("/weather/export/csv", {
            params: { location_id, from, to, type },
            responseType: 'blob',
        });
        return response.data;
    },
    fetchAndSaveWeather: async (location_id: string) => {
        const response = await apiClient.post("/weather/fetch", { location_id });
        return response.data;
    },
    ingestWeatherData: async (location: Location) => {
        try {
            const userIP = await getUserIP();
            console.log("User IP for rate limiting:", userIP);
            await rateLimiter.consume(userIP, 1);
            const response = await apiClient.post("/weather/ingest/run", { location });
            return { status: response.status, data: response.data };
        } catch (error: any) {
            if (error && typeof error.msBeforeNext === "number") {
                console.warn("Ingest weather data rate limit exceeded:", error);
                return { status: 409, data: null };
            }
            if (error.response) {
                return { status: error.response.status, data: error.response.data };
            }
            console.error("Ingest weather data error:", error);
            throw error;
        }
    },
};