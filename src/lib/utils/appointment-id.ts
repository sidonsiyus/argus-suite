import { randomBytes } from 'crypto';

/**
 * Generates a simple, human-friendly sequential Appointment Reference ID.
 * Examples: APT-001, APT-002, APT-042, APT-100
 *
 * NOTE: The Appointment ID is strictly an administrative reference number,
 * NOT a security credential. Security and status lookups use the cryptographically
 * random Tracking Code (e.g. AVN-7K4P-92XM).
 */
export function generateAppointmentId(
  _dateStr?: string,
  sequenceNumber: number = 1
): string {
  const safeSeq = Math.max(1, Math.floor(sequenceNumber || 1));
  const padded = safeSeq.toString().padStart(3, '0');
  return `APT-${padded}`;
}

export function formatSimpleAppointmentId(sequenceNumber: number): string {
  const safeSeq = Math.max(1, Math.floor(sequenceNumber || 1));
  const padded = safeSeq.toString().padStart(3, '0');
  return `APT-${padded}`;
}

export function generateSecureToken(): string {
  // Generates a cryptographically strong 64-character hexadecimal token (256 bits of entropy)
  return randomBytes(32).toString('hex');
}
