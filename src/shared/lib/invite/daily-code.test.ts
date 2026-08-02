import { describe, expect, it } from "vitest";
import { generateDailyParticipantCode, getLocalDateKey } from "./daily-code";
import type { UserProfile } from "@/shared/types/domain";

const user: UserProfile = {
  id: "user-1",
  name: "Папа",
  avatarUrl: "",
  phone: "+7 900 123-45-67",
  about: "",
  createdAt: "2026-06-10T09:00:00.000Z"
};

describe("daily participant code", () => {
  it("returns the same eight digits during one local day", () => {
    const morning = new Date(2026, 7, 3, 8, 0);
    const evening = new Date(2026, 7, 3, 22, 30);
    const code = generateDailyParticipantCode(user, morning);

    expect(code).toMatch(/^\d{8}$/);
    expect(generateDailyParticipantCode(user, evening)).toBe(code);
    expect(getLocalDateKey(morning)).toBe("2026-08-03");
  });

  it("rotates on the next local day", () => {
    expect(generateDailyParticipantCode(user, new Date(2026, 7, 3, 23, 59))).not.toBe(
      generateDailyParticipantCode(user, new Date(2026, 7, 4, 0, 1))
    );
  });
});
