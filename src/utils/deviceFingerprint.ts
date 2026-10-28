const DEVICE_ID_KEY = 'aurelith_device_id';
const DEVICE_TRUST_TOKEN_KEY = 'aurelith_device_trust_token';

/**
 * Returns or generates a persistent, unique hardware/browser device identifier.
 */
export function getOrCreateDeviceId(): string {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generate a crypto UUID or fallback random identifier
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        deviceId = `dev_${crypto.randomUUID()}`;
      } else {
        deviceId = `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'dev_fallback_session_id';
  }
}

/**
 * Returns the server-issued cryptographic trust token for this device, if any.
 */
export function getDeviceTrustToken(): string | null {
  try {
    return localStorage.getItem(DEVICE_TRUST_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores the server-validated device trust token.
 */
export function setDeviceTrustToken(token: string): void {
  try {
    localStorage.setItem(DEVICE_TRUST_TOKEN_KEY, token);
  } catch (err) {
    console.warn('Failed to persist device trust token:', err);
  }
}

/**
 * Clears the device trust token (e.g. on revocation or manual security reset).
 */
export function clearDeviceTrustToken(): void {
  try {
    localStorage.removeItem(DEVICE_TRUST_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Detects browser details for human-readable device identification.
 */
export function getDeviceDetails(): {
  deviceName: string;
  browser: string;
  os: string;
  platform: string;
  timezone: string;
} {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? (navigator.platform || '') : '';

  let browser = 'Web Browser';
  if (/Edg\//.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//.test(ua) && !/Chromium\//.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
    browser = 'Apple Safari';
  }

  let os = 'Unknown OS';
  if (/iPhone|iPad|iPod/.test(ua)) {
    os = 'iOS';
  } else if (/Android/.test(ua)) {
    os = 'Android';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'macOS';
  } else if (/Windows NT/.test(ua)) {
    os = 'Windows';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  let timezone = 'UTC';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    // fallback
  }

  const deviceName = `${browser} on ${os}`;

  return {
    deviceName,
    browser,
    os,
    platform,
    timezone,
  };
}

/**
 * Assembles the full device telemetry package for server validation.
 */
export function getDeviceAuthPayload() {
  const deviceId = getOrCreateDeviceId();
  const deviceTrustToken = getDeviceTrustToken();
  const details = getDeviceDetails();

  return {
    deviceId,
    deviceTrustToken,
    deviceInfo: details,
  };
}
