function stripTrailingSlash(url) {
  return url ? url.replace(/\/$/, "") : url;
}

export function getApiBaseUrl() {
  const env = import.meta.env.VITE_API_URL;
  if (env) return stripTrailingSlash(env);
  if (import.meta.env.DEV) return "/api";
  return `${window.location.origin}/api`;
}

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
