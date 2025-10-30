import apiClient from "@/lib/axios";

export const compareAPI = {
    compareLocation: async (locationId: string) => {
        const response = await apiClient.post("/compare", { locationId });
        return response.data;
    },
    getComparedLocations: async () => {
        const response = await apiClient.get("/compare");
        return response.data;
    },
}