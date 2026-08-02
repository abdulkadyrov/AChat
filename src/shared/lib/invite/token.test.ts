import { describe, expect, it } from "vitest";
import { buildInviteToken, parseInviteToken } from "./token";
import type { ChatInvite } from "@/shared/types/domain";

const invite: Omit<ChatInvite, "token"> = {
  id: "invite-1",
  chatId: "chat-1",
  kind: "direct",
  title: "Мама",
  createdBy: "user-1",
  createdByPhone: "79001234567",
  accessCode: "A7K9Q2",
  allowedPhones: [],
  allowedPhone: null,
  maxParticipants: 1,
  createdAt: "2026-08-03T10:00:00.000Z",
  chatSecret: "secret"
};

describe("invite token", () => {
  it("round-trips a QR invitation", () => {
    expect(parseInviteToken(buildInviteToken(invite))).toMatchObject({
      chatId: invite.chatId,
      accessCode: invite.accessCode,
      maxParticipants: 1
    });
  });

  it("rejects unrelated QR values", () => {
    expect(() => parseInviteToken("not-an-achat-qr")).toThrow();
  });
});
