const DEFAULT_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

/** localhost / 127.0.0.1 with any port */
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function parseList(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePatterns(value) {
  return parseList(value)
    .map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch {
        console.warn("[cors] Invalid CLIENT_ORIGIN_PATTERNS entry:", pattern);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Builds CORS origin checker for Express and Socket.io.
 * Allows:
 * - Exact origins in CLIENT_ORIGINS
 * - localhost / 127.0.0.1 (any port) when CORS_ALLOW_LOCALHOST is not "false"
 * - Regex patterns in CLIENT_ORIGIN_PATTERNS (e.g. ^https://.*\.vercel\.app$)
 */
export function createCorsOriginChecker() {
  const allowed = new Set([...DEFAULT_ORIGINS, ...parseList(process.env.CLIENT_ORIGINS)]);
  const patterns = parsePatterns(process.env.CLIENT_ORIGIN_PATTERNS);
  const allowLocalhost = process.env.CORS_ALLOW_LOCALHOST !== "false";

  function isAllowed(origin) {
    if (!origin) return true;
    if (allowed.has(origin)) return true;
    if (allowLocalhost && LOCAL_ORIGIN.test(origin)) return true;
    for (const re of patterns) {
      if (re.test(origin)) return true;
    }
    return false;
  }

  return function corsOrigin(origin, callback) {
    if (isAllowed(origin)) {
      callback(null, origin || true);
      return;
    }
    console.warn("[cors] Blocked origin:", origin);
    callback(null, false);
  };
}

export function getCorsOptions() {
  return {
    origin: createCorsOriginChecker(),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
}

export function getSocketCorsOptions() {
  return {
    origin: createCorsOriginChecker(),
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  };
}
