import { beforeEach, describe, expect, it } from "vitest";
import { useMessageStore } from "./message-store";
import type { Message } from "@/shared/types/domain";

function message(id: string, createdAt: string): Message {
  return {
    id,
    chatId: "chat-1",
    senderId: "user-1",
    ciphertext: "cipher",
    iv: "iv",
    type: "text",
    createdAt,
    expiresAt: null,
    replyTo: null,
    preview: id,
    status: "sent"
  };
}

describe("message store realtime merge", () => {
  beforeEach(() => useMessageStore.getState().clearAllMessages());

  it("merges fetched and realtime messages without duplicates in chronological order", () => {
    useMessageStore.getState().enqueueMessage(message("new", "2026-08-03T10:02:00.000Z"));
    useMessageStore
      .getState()
      .mergeMessages("chat-1", [
        message("old", "2026-08-03T10:01:00.000Z"),
        message("new", "2026-08-03T10:02:00.000Z")
      ]);

    expect(useMessageStore.getState().messagesByChatId["chat-1"].map((item) => item.id)).toEqual([
      "old",
      "new"
    ]);
  });
});
