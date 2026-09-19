/**
 * Centralized Server-Side Validation and Sanitization
 * Department of Aviation — Faculty–Student Appointment Portal
 */

export function isValidUUID(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    str.trim()
  );
}

export function isValidDateStr(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str.trim())) return false;
  const d = new Date(str.trim());
  return !isNaN(d.getTime()) && d.toISOString().startsWith(str.trim());
}

export function isValidTimeStr(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  return /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(str.trim());
}

export function isValidEmail(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str.trim());
}

export function isValidRegisterNumber(str: unknown): boolean {
  if (typeof str !== 'string') return false;
  const trimmed = str.trim();
  return trimmed.length >= 2 && trimmed.length <= 30 && /^[a-zA-Z0-9\-_/]+$/.test(trimmed);
}

export function sanitizeText(str: unknown, maxLength: number = 255): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

/**
 * Prevents CSV Formula Injection (OWASP mitigation).
 * If a cell begins with '=', '+', '-', '@', '\t', or '\r',
 * prepend a single quote to force spreadsheet software to treat it as literal text.
 */
export function sanitizeCsvField(str: unknown, maxLength: number = 255): string {
  if (typeof str !== 'string') return '';
  const trimmed = str.trim().slice(0, maxLength);
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}
