import { beforeEach, describe, expect, it } from "vitest";
import { buildInviteToken } from "@/shared/lib/invite/token";
import { useChatStore } from "./chat-store";
import type { ChatInvite, UserProfile } from "@/shared/types/domain";

const user: UserProfile = {
  id: "joining-user",
  name: "Мама",
  avatarUrl: "",
  phone: "+7 900 555-61-88",
  about: "",
  createdAt: "2026-08-03T09:00:00.000Z"
};

describe("chat QR invitation", () => {
  beforeEach(() => {
    useChatStore.setState({
      chats: [],
      invites: [],
      chatSecretsByChatId: {},
      currentChatId: "",
      loading: false,
      error: null
    });
  });

  it("joins a local demo chat from a self-contained QR token", async () => {
    const draft: Omit<ChatInvite, "token"> = {
      id: "invite-qr",
      chatId: "chat-qr",
      kind: "direct",
      title: "Семейный чат",
      createdBy: "owner-user",
      createdByPhone: "79001234567",
      accessCode: "A7K9Q2",
      allowedPhones: [],
      allowedPhone: null,
      maxParticipants: 1,
      createdAt: new Date().toISOString(),
      chatSecret: "shared-secret"
    };

    const result = await useChatStore.getState().joinByInviteToken({
      token: buildInviteToken(draft),
      user
    });

    expect(result).toEqual({ ok: true, chatId: "chat-qr" });
    expect(useChatStore.getState().chats[0]).toMatchObject({
      id: "chat-qr",
      title: "Семейный чат",
      participantIds: ["owner-user", "joining-user"]
    });
  });
});
