import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const ASSET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${ASSET_BASE_URL}${path}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
