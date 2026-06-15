import axios from "axios";
import { getApiBaseUrl } from "../lib/config.js";

const client = axios.create({ baseURL: getApiBaseUrl() });

client.interceptors.request.use((config) => {
  const t = localStorage.getItem("admin_token");
  if (t) config.headers.Authorization = "Bearer " + t;
  return config;
});

export default client;
