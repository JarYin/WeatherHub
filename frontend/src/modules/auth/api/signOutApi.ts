import apiClient from "@/lib/axios";

export const signOut = async () => {
    try {
        await apiClient.post("/auth/logout");
    } catch (error) {
        throw error;
    }
};
