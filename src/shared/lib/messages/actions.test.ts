import { describe, expect, it } from "vitest";
import { getMessageActions } from "@/shared/lib/messages/actions";
import type { Message } from "@/shared/types/domain";

const baseMessage: Message = {
  id: "message-1",
  chatId: "chat-1",
  senderId: "user-1",
  ciphertext: "ciphertext",
  iv: "iv",
  type: "text",
  createdAt: "2026-08-03T10:00:00.000Z",
  expiresAt: null,
  replyTo: null,
  preview: "Привет",
  status: "sent"
};

describe("message actions", () => {
  it("allows copying text and timely own-message deletion", () => {
    expect(
      getMessageActions(baseMessage, "user-1", new Date("2026-08-03T11:00:00.000Z").getTime())
    ).toEqual(["copy", "reply", "forward", "delete-for-me", "delete-for-everyone"]);
  });

  it("hides unsafe actions for media and old messages", () => {
    const actions = getMessageActions(
      { ...baseMessage, type: "image" },
      "user-1",
      new Date("2026-08-08T10:00:00.000Z").getTime()
    );
    expect(actions).toEqual(["reply", "forward", "delete-for-me"]);
  });
});
