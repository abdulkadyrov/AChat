import { describe, expect, it, vi } from "vitest";
import { computeExpiresAt, isMessageExpired } from "@/shared/lib/ttl/messages";

describe("message TTL", () => {
  it("calculates every supported period", () => {
    const createdAt = "2026-08-03T10:00:00.000Z";
    expect(computeExpiresAt(createdAt, "24h")).toBe("2026-08-04T10:00:00.000Z");
    expect(computeExpiresAt(createdAt, "7d")).toBe("2026-08-10T10:00:00.000Z");
    expect(computeExpiresAt(createdAt, "30d")).toBe("2026-09-02T10:00:00.000Z");
    expect(computeExpiresAt(createdAt, "90d")).toBe("2026-11-01T10:00:00.000Z");
    expect(computeExpiresAt(createdAt, "off")).toBeNull();
  });

  it("detects expired messages", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-03T10:00:00.000Z"));
    expect(isMessageExpired("2026-08-03T09:59:59.000Z")).toBe(true);
    expect(isMessageExpired("2026-08-03T10:00:01.000Z")).toBe(false);
    expect(isMessageExpired(null)).toBe(false);
    vi.useRealTimers();
  });
});
