const algorithm = "AES-GCM";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

export async function generateDeviceKey() {
  return crypto.subtle.generateKey(
    {
      name: algorithm,
      length: 256
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function exportDeviceKey(key: CryptoKey) {
  const exported = await crypto.subtle.exportKey("raw", key);
  return bytesToBase64(new Uint8Array(exported));
}

export async function importDeviceKey(rawKey: string) {
  return crypto.subtle.importKey(
    "raw",
    base64ToBytes(rawKey),
    {
      name: algorithm
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptText(plainText: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: algorithm, iv },
    key,
    encoder.encode(plainText)
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(cipherBuffer)),
    iv: bytesToBase64(iv)
  };
}

export async function decryptText(ciphertext: string, iv: string, key: CryptoKey) {
  const plainBuffer = await crypto.subtle.decrypt(
    { name: algorithm, iv: base64ToBytes(iv) },
    key,
    base64ToBytes(ciphertext)
  );

  return decoder.decode(plainBuffer);
}
