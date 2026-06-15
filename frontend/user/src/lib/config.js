/**
 * API + Socket URLs for local dev (Vite proxy) and production deploys.
 *
 * Local dev: leave VITE_* unset — uses /api proxy and http://localhost:5000 for sockets.
 * Split deploy: set VITE_API_URL=https://your-api.com/api and optionally VITE_SOCKET_URL=https://your-api.com
 */

function stripTrailingSlash(url) {
  return url ? url.replace(/\/$/, "") : url;
}

/** REST base path, e.g. /api or https://api.example.com/api */
export function getApiBaseUrl() {
  const env = import.meta.env.VITE_API_URL;
  if (env) return stripTrailingSlash(env);
  if (import.meta.env.DEV) return "/api";
  return `${window.location.origin}/api`;
}

/** Backend origin without /api — for uploads and Socket.io */
export function getApiOrigin() {
  const socketEnv = import.meta.env.VITE_SOCKET_URL;
  if (socketEnv) return stripTrailingSlash(socketEnv);

  const apiEnv = import.meta.env.VITE_API_URL;
  if (apiEnv) {
    const origin = apiEnv.replace(/\/api\/?$/i, "").replace(/\/$/, "");
    if (origin) return origin;
  }

  if (import.meta.env.DEV) return "http://localhost:5000";
  return window.location.origin;
}

export function getSocketUrl() {
  return getApiOrigin();
}
