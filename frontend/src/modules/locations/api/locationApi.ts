import apiClient from "@/lib/axios";
import { Location } from "../type";

export const createLocation = async (data: Location) => {
    const response = await apiClient.post("/locations", data);
    return response.data;
}

export const fetchLocations = async (page: number, limit: number): Promise<{ data: Location[]; pagination: any }> => {
    const response = await apiClient.get(`/locations?page=${page}&limit=${limit}`);
    return response.data;
}

export const deleteLocation = async (id: string) => {
    const response = await apiClient.delete(`/locations/${id}`);
    return response.data;
}

export const setDefaultLocation = async (id: string) => {
    const response = await apiClient.put(`/locations/${id}/default`);
    return response.data;
}

export const updateLocation = async (id: string, data: Partial<Location>) => {
    const response = await apiClient.put(`/locations/${id}`, data);
    return response.data;
}