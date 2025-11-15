const ENCODER = new TextEncoder();

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashPin(pin: string, deviceId: string): Promise<string> {
  const normalizedPin = pin.trim();
  const payload = `${normalizedPin}:${deviceId}`;
  const data = ENCODER.encode(payload);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim());
}
