const PBKDF2_PREFIX = "pbkdf2";
const PBKDF2_ITERATIONS = 100_000;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKey(password, salt);
  return `${PBKDF2_PREFIX}:${toHex(salt)}:${toHex(derivedKey)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [prefix, saltHex, hashHex] = storedHash.split(":");
  if (prefix !== PBKDF2_PREFIX || !saltHex || !hashHex) {
    return false;
  }

  const salt = fromHex(saltHex);
  const expectedHash = fromHex(hashHex);
  const derivedKey = await deriveKey(password, salt);

  return timingSafeEqual(derivedKey, expectedHash);
}
