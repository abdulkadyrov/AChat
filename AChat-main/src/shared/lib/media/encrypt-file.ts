import { encryptText } from "@/shared/lib/crypto/achat-crypto";

export async function encryptFileMetadata(
  file: File,
  key: CryptoKey,
  chatId: string,
  messageId: string
) {
  const payload = JSON.stringify({
    name: file.name,
    size: file.size,
    type: file.type
  });

  const encrypted = await encryptText(payload, key);

  return {
    path: `${chatId}/${messageId}/${file.name}.enc`,
    ...encrypted
  };
}
