import { getApiOrigin } from "./config.js";

/**
 * Build a usable <img src> when the API stores /uploads/... or a full http(s) URL.
 */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl) return "";
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (pathOrUrl.startsWith("/uploads/")) {
    return getApiOrigin() + pathOrUrl;
  }
  return pathOrUrl;
}
