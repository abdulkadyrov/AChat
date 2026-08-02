import { describe, expect, it } from "vitest";
import { getMessageStatusLabel } from "@/shared/lib/messages/status";

describe("message status label", () => {
  it("maps delivery and failure states", () => {
    expect(getMessageStatusLabel("queued")).toBe("В очереди");
    expect(getMessageStatusLabel("read")).toBe("Прочитано");
    expect(getMessageStatusLabel("failed")).toBe("Ошибка отправки");
    expect(getMessageStatusLabel("expired")).toBe("Срок сообщения истёк");
  });
});
