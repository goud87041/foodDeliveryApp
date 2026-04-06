import { io } from "socket.io-client";

export function getSocketUrl() {
  const u = import.meta.env.VITE_SOCKET_URL;
  if (u) return u;
  if (import.meta.env.DEV) return "http://localhost:5000";
  return window.location.origin;
}

export function createDeliverySocket() {
  return io(getSocketUrl(), { transports: ["websocket", "polling"] });
} 
