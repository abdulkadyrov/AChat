import type { MessageTTL } from "@/shared/types/domain";

const ttlToMs: Record<Exclude<MessageTTL, "off">, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000
};

export function computeExpiresAt(createdAt: string, ttl: MessageTTL) {
  if (ttl === "off") return null;
  return new Date(new Date(createdAt).getTime() + ttlToMs[ttl]).toISOString();
}

export function isMessageExpired(expiresAt: string | null) {
  return expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false;
}
