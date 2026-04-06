import axios from "axios";

const base = import.meta.env.VITE_API_URL || "/api";
const client = axios.create({ baseURL: base });

client.interceptors.request.use((config) => {
  const t = localStorage.getItem("admin_token");
  if (t) config.headers.Authorization = "Bearer " + t;
  return config;
});

export default client;
