import { randomBytes, createHash } from 'crypto';

/**
 * 32-character unambiguous alphabet.
 * Excludes visually ambiguous characters: I, O, 0, 1.
 * 32^6 = 1,073,741,824 (> 1 billion) permutations for 6 characters.
 */
export const TRACKING_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates a short, human-friendly, student-facing 6-character alphanumeric Tracking Code.
 * Format: AVN-XXXXXX (e.g. AVN-7K4P92, AVN-K8M4Q7, AVN-5T9X3P).
 * Cryptographically random, collision-safe generation.
 */
export function generateSimpleTrackingCode(): string {
  const bytes = randomBytes(6);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += TRACKING_ALPHABET[bytes[i] % TRACKING_ALPHABET.length];
  }
  return `AVN-${code}`;
}

/**
 * Generates an internal cryptographically secure token and its SHA-256 hex digest.
 * This 256-bit token is the underlying security credential used for the public status RPC.
 */
export function generateInternalTokenHash(): string {
  const secret = randomBytes(32).toString('hex');
  return createHash('sha256').update(secret).digest('hex');
}

/**
 * Generates a legacy Base32 Tracking Code (AVN-XXXX-XXXX).
 * Preserved for backward compatibility.
 */
export function generateTrackingCode(): string {
  const bytes = randomBytes(8);
  let result = '';
  for (let i = 0; i < 8; i++) {
    const charIndex = bytes[i] % TRACKING_ALPHABET.length;
    result += TRACKING_ALPHABET[charIndex];
  }
  return `AVN-${result.slice(0, 4)}-${result.slice(4, 8)}`;
}

/**
 * Normalizes a tracking code for comparison and hashing.
 * Trims whitespace and converts to uppercase.
 * If the student enters only the 6 characters (e.g. "7K4P92"), auto-prepends "AVN-".
 */
export function normalizeTrackingCode(code: string): string {
  let normalized = (code || '').trim().toUpperCase();
  if (/^[A-Z0-9]{6}$/.test(normalized)) {
    normalized = `AVN-${normalized}`;
  } else if (/^\d{4,5}$/.test(normalized)) {
    normalized = `AVN-${normalized}`;
  }
  return normalized;
}

/**
 * Validates tracking code format.
 * Accepts:
 * - Preferred format: AVN-XXXXXX (6 alphanumeric chars excluding I, O, 0, 1)
 * - Legacy format: AVN-XXXX-XXXX (8-character Base32)
 * - Legacy 4-5 digit format: AVN-XXXX (for backwards compatibility)
 */
export function isValidTrackingCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const normalized = normalizeTrackingCode(code);
  // Preferred 6-character alphanumeric (excluding ambiguous I, O, 0, 1)
  if (/^AVN-[A-HJ-NP-Z2-9]{6}$/.test(normalized)) return true;
  // Legacy Base32 format (AVN-XXXX-XXXX)
  if (/^AVN-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normalized)) return true;
  // Legacy 4-5 digit format
  if (/^AVN-[0-9]{4,5}$/.test(normalized)) return true;
  return false;
}

/**
 * Computes a deterministic SHA-256 hex digest of the normalized tracking code.
 * Used for legacy token lookups.
 */
export function hashTrackingCode(code: string): string {
  const normalized = normalizeTrackingCode(code);
  return createHash('sha256').update(normalized).digest('hex');
}


