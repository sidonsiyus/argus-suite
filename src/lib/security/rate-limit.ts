import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Persistent & Distributed Rate Limiter for Department of Aviation Portal.
 * Backed by Supabase PostgreSQL (public.rate_limits & public.check_rate_limit RPC)
 * to provide reliable, shared protection across all serverless / Vercel container instances.
 */

interface RateLimitRecord {
  timestamps: number[];
  failedAttempts: number[];
  blockedUntil?: number;
}

const trackingLimiterStore = new Map<string, RateLimitRecord>();

// Process-local cleanup interval (unref'd to prevent keeping Node process alive)
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  trackingLimiterStore.forEach((record, key) => {
    if (
      record.timestamps.length === 0 ||
      (now - Math.max(...record.timestamps) > 600000 && (!record.blockedUntil || now > record.blockedUntil))
    ) {
      trackingLimiterStore.delete(key);
    }
  });
}, 300000);
if (typeof cleanupInterval.unref === 'function') {
  cleanupInterval.unref();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  error?: string;
  source?: 'database' | 'memory';
}

/**
 * Synchronous local process rate limiter (used for fallback or offline testing).
 */
export function checkTrackingRateLimit(
  clientIp: string,
  isFailedAttempt: boolean = false
): RateLimitResult {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20;
  const maxFailedAttempts = 5;
  const blockDurationMs = 5 * 60 * 1000; // 5 minutes

  const ipKey = clientIp || 'anonymous';
  let record = trackingLimiterStore.get(ipKey);

  if (!record) {
    record = { timestamps: [], failedAttempts: [] };
    trackingLimiterStore.set(ipKey, record);
  }

  // Check if IP is currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    const remainingBlockSec = Math.ceil((record.blockedUntil - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds: remainingBlockSec,
      error: `Too many invalid tracking code attempts. Access temporarily paused for ${remainingBlockSec} seconds.`,
      source: 'memory',
    };
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
  record.failedAttempts = record.failedAttempts.filter((t) => now - t < windowMs);

  if (isFailedAttempt) {
    record.failedAttempts.push(now);
    if (record.failedAttempts.length >= maxFailedAttempts) {
      record.blockedUntil = now + blockDurationMs;
      const remainingBlockSec = Math.ceil(blockDurationMs / 1000);
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetSeconds: remainingBlockSec,
        error: `Too many invalid tracking code attempts. Access temporarily paused for 5 minutes.`,
        source: 'memory',
      };
    }
  }

  // Check standard request rate limit
  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetSeconds,
      error: `Rate limit exceeded. Maximum ${maxRequests} requests per minute.`,
      source: 'memory',
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, maxRequests - record.timestamps.length);

  return {
    success: true,
    limit: maxRequests,
    remaining,
    resetSeconds: 60,
    source: 'memory',
  };
}

/**
 * Persistent Database-Backed Rate Limiting Function.
 * Executes the PostgreSQL atomic check_rate_limit() function.
 * Ensures consistent rate limiting across all distributed serverless instances.
 */
export async function checkTrackingRateLimitPersistent(
  clientIp: string,
  isFailedAttempt: boolean = false
): Promise<RateLimitResult> {
  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : createClient();

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_client_ip: clientIp || '127.0.0.1',
      p_is_failed: isFailedAttempt,
      p_max_requests: 20,
      p_window_seconds: 60,
      p_max_failed: 5,
      p_block_seconds: 300,
    });

    if (!error && data) {
      return {
        success: Boolean(data.allowed),
        limit: data.limit || 20,
        remaining: data.remaining ?? 0,
        resetSeconds: data.reset_seconds || 60,
        error: data.error,
        source: 'database',
      };
    }
  } catch {
    // Graceful fallback to in-memory process limiter
  }

  return checkTrackingRateLimit(clientIp, isFailedAttempt);
}

/**
 * Helper to extract client IP from Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '127.0.0.1';
}

