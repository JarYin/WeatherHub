import axios from "axios";
import axiosRetry from "axios-retry";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

const logClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

async function sendIngestJob(note: string, source: string = "axiosRetry", status: number) {
  try {
    await logClient.post("/ingest-job", { note, source, status });
    console.log("✅ Logged error to ingestJob");
  } catch (err: any) {
    console.warn("⚠️ Failed to log error:", err.message);
  }
}

// ---- ตั้งค่า retry เฉพาะ apiClient ----
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    const delay = 1000 * Math.pow(2, retryCount - 1);
    console.log(`⏳ Retry attempt #${retryCount} after ${delay}ms`);
    return delay;
  },
  retryCondition: (error) => {
    const status = error.response?.status ?? 0;
    const message = (error.response?.data as any).error || error.message;

    // ป้องกันไม่ให้ log /ingestJob เอง
    if (error.config?.url?.includes("/ingest-job")) return false;

    sendIngestJob(`Retrying due to error: ${status} - ${message}`, "axiosRetry", status);

    return status >= 500;
  },
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status ?? 0;
    if ((error.config?._retryCount ?? 0) >= 3 && !error.config?.url?.includes("/ingest-job")) {
      await sendIngestJob(`Final failure after retries: ${error.message}`, "axiosRetry", status);
    }
    return Promise.reject(error);
  }
);
export default apiClient;