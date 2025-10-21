import apiClient from "@/lib/axios";

export const signOut = async () => {
    await apiClient.post("/auth/logout");
};
