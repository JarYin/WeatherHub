import apiClient from "@/lib/axios";

export const signInApi = async (data: { email: string; password: string }) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
};