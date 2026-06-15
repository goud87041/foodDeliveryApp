import axios from "axios";
import { getApiBaseUrl } from "../lib/config.js";

const client = axios.create({ baseURL: getApiBaseUrl() });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
