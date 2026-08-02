import { describe, expect, it } from "vitest";
import { formatChatTimestamp, formatDateDivider, formatTime } from "@/shared/lib/utils/date";

describe("date formatting", () => {
  it("formats a valid localized time", () => {
    expect(formatTime("2026-08-03T10:05:00.000Z")).toMatch(/^\d{2}:\d{2}$/);
  });

  it("uses compact labels for chat and date separators", () => {
    const now = new Date();
    now.setHours(12, 30, 0, 0);
    expect(formatChatTimestamp(now.toISOString())).toMatch(/^\d{2}:\d{2}$/);
    expect(formatDateDivider(now.toISOString())).toBe("Сегодня");
  });
});
