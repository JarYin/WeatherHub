import apiClient from "@/lib/axios";

export const signUp = async (data: { email: string; password: string }) => {
  const response = await apiClient.post("/auth/sign-up", data);
  return response.data;
}