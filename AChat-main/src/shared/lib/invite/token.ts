import type { ChatInvite, ChatType } from "@/shared/types/domain";

interface InvitePayload {
  version: 1;
  inviteId: string;
  chatId: string;
  title: string;
  kind: ChatType;
  createdBy: string;
  createdByPhone: string;
  allowedPhone: string | null;
  maxParticipants: number;
  createdAt: string;
  chatSecret: string;
}

function toBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function fromBase64(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

export function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function buildInviteToken(invite: Omit<ChatInvite, "token">) {
  const payload: InvitePayload = {
    version: 1,
    inviteId: invite.id,
    chatId: invite.chatId,
    title: invite.title,
    kind: invite.kind,
    createdBy: invite.createdBy,
    createdByPhone: invite.createdByPhone,
    allowedPhone: invite.allowedPhone,
    maxParticipants: invite.maxParticipants,
    createdAt: invite.createdAt,
    chatSecret: invite.chatSecret
  };

  return toBase64(JSON.stringify(payload));
}

export function parseInviteToken(token: string) {
  const payload = JSON.parse(fromBase64(token)) as InvitePayload;
  return payload;
}
