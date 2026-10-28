/**
 * Client ID Formatter Utility
 * Formats user ID into a user-friendly, human-readable identifier (e.g., AR-XXXXXX).
 */

export function formatClientId(userId?: string, existingClientId?: string): string {
  if (existingClientId && /^AR-[A-Z0-9]{6}$/i.test(existingClientId)) {
    return existingClientId.toUpperCase();
  }

  if (!userId) {
    return 'AR-882190';
  }

  // If userId is already in format AR-XXXXXX, return as-is
  if (/^AR-[A-Z0-9]{6}$/i.test(userId)) {
    return userId.toUpperCase();
  }

  // Generate a deterministic 6-character hex/alphanumeric code from userId
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  const abs = Math.abs(hash);
  const hex = abs.toString(16).toUpperCase().padStart(6, '0').slice(-6);
  return `AR-${hex}`;
}
