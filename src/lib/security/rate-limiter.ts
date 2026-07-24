/**
 * In-memory rate limiter for serverless (per-instance).
 * For production at scale, use Redis (Upstash) instead.
 *
 * Limits:
 * - Login: 5 attempts per 15 minutes per IP
 * - Registration: 3 per hour per IP
 * - AI endpoints: 30 per minute per user
 * - General API: 100 per minute per user
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export const RATE_LIMITS = {
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },      // 5 per 15 min
  registro: { maxRequests: 3, windowMs: 60 * 60 * 1000 },    // 3 per hour
  ai: { maxRequests: 30, windowMs: 60 * 1000 },              // 30 per min
  api: { maxRequests: 100, windowMs: 60 * 1000 },            // 100 per min
  upload: { maxRequests: 10, windowMs: 60 * 1000 },          // 10 per min
} as const;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = identifier;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetIn: entry.resetAt - now };
}

/**
 * Get client IP from request headers (Vercel forwards X-Forwarded-For)
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
