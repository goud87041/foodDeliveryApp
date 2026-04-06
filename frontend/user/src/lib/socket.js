import { io } from "socket.io-client";

const url = import.meta.env.VITE_SOCKET_URL || "";

/** Connects to same host as API when empty (Vite proxy only proxies /api; socket needs full URL in prod) */
export function getSocketUrl() {
  if (url) return url;
  if (import.meta.env.DEV) return "http://localhost:5000";
  return window.location.origin;
}

export function createUserSocket() {
  return io(getSocketUrl(), { transports: ["websocket", "polling"] });
}
