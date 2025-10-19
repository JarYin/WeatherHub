import axios from "axios";
import { getSession } from "./session";
import Router from "next/router";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

apiClient.interceptors.response.use(async (config) => {
    const accessToken = await getSession();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
})

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("Unauthorized! Maybe session expired.");
            Router.push('/');
        }
        return Promise.reject(error);
    }
);

export default apiClient;