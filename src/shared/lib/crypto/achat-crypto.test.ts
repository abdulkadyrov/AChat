import { describe, expect, it } from "vitest";
import {
  decryptText,
  encryptText,
  exportDeviceKey,
  generateDeviceKey,
  importDeviceKey
} from "@/shared/lib/crypto/achat-crypto";

describe("achat-crypto", () => {
  it("encrypts and decrypts text with AES-GCM", async () => {
    const key = await generateDeviceKey();
    const encrypted = await encryptText("family-first secret", key);
    const decrypted = await decryptText(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe("family-first secret");
  });

  it("exports and imports device keys", async () => {
    const key = await generateDeviceKey();
    const raw = await exportDeviceKey(key);
    const imported = await importDeviceKey(raw);
    const encrypted = await encryptText("backup seed", imported);
    const decrypted = await decryptText(encrypted.ciphertext, encrypted.iv, imported);

    expect(decrypted).toBe("backup seed");
  });

  it("encrypts image-sized payloads without overflowing the call stack", async () => {
    const key = await generateDeviceKey();
    const payload = "x".repeat(2 * 1024 * 1024);

    const encrypted = await encryptText(payload, key);
    const decrypted = await decryptText(encrypted.ciphertext, encrypted.iv, key);

    expect(decrypted).toBe(payload);
  });
});
