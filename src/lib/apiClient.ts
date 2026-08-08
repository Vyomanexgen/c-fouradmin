import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL as string) || "https://ecommerce-backend-iota-six.vercel.app";
const ORG_ID = (import.meta.env.VITE_ORGANIZATION_ID as string) || "default-org";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    
    // Precise header injection logic matching user and route requirements
    const isOrgEndpoint = config.url && (
      config.url.includes("/api/v1/users") ||
      config.url.includes("/api/v1/orders") ||
      config.url.includes("/api/v1/config") ||
      config.url.includes("/api/v1/roles") ||
      config.url.includes("/api/v1/payments")
    );
    
    if (isOrgEndpoint) {
      config.headers["x-organization-id"] = ORG_ID;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || "");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (import.meta.env.DEV) {
      console.error(`[API Error] ${error.response?.status || "Network"} ${originalRequest?.url}`, error.response?.data || error.message);
    }

    // Global API Error Event Dispatch (except for initial retryable 401s)
    const isRetryable401 = error.response?.status === 401 && !originalRequest?._retry;
    if (!isRetryable401 && typeof window !== "undefined") {
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message;
      const errStatus = error.response?.status;
      window.dispatchEvent(new CustomEvent("api-error", {
        detail: { message: errMsg, status: errStatus }
      }));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data || response.data;
        
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
        }

        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.dispatchEvent(new Event("auth-expired"));
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
