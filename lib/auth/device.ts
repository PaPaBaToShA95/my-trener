const STORAGE_KEY = "my-trener-device-id";

function generateFallbackId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${random}`;
}

export function getStoredDeviceId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredDeviceId(deviceId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, deviceId);
}

export async function getOrCreateDeviceId(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  let deviceId = getStoredDeviceId();

  if (!deviceId) {
    deviceId = generateFallbackId();
    setStoredDeviceId(deviceId);
  }

  return deviceId;
}
