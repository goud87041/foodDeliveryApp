import axios from "axios";

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

client.interceptors.request.use((config) => {
  const t = localStorage.getItem("delivery_token");
  if (t) config.headers.Authorization = "Bearer " + t;
  return config;
});

export default client;
