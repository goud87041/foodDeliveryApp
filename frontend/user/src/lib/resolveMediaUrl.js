/**
 * Build a usable <img src> when the API stores /uploads/... or a full http(s) URL.
 */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const apiBase = import.meta.env.VITE_API_URL || "";
  if (pathOrUrl.startsWith("/uploads/") && apiBase) {
    const origin = apiBase.replace(/\/?api\/?$/i, "").replace(/\/$/, "");
    return origin + pathOrUrl;
  }
  return pathOrUrl;
}
