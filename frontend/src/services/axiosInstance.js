import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Add a request interceptor to automatically add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("orderguard_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiry or unauthorized access
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("orderguard_token");
      localStorage.removeItem("orderguard_user");
      // Only redirect if we are not already on the login/register pages
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
