import { io } from "socket.io-client";
import { getSocketUrl } from "./config.js";

export { getSocketUrl } from "./config.js";

export function createUserSocket() {
  return io(getSocketUrl(), {
    transports: ["websocket", "polling"],
    withCredentials: true,
  });
}
