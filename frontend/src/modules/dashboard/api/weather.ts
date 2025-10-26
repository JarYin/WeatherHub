import apiClient from "@/lib/axios";
import { Location } from "@/modules/locations/type";

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
        const response = await apiClient.post("/weather/ingest/run", { location });
        return response.data;
    },
};