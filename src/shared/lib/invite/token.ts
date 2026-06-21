import type { ChatInvite, ChatType } from "@/shared/types/domain";

interface InvitePayload {
  version: 2;
  inviteId: string;
  chatId: string;
  title: string;
  kind: ChatType;
  createdBy: string;
  createdByPhone: string;
  accessCode: string;
  allowedPhones: string[];
  maxParticipants: number;
  createdAt: string;
  chatSecret: string;
}

const accessCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function toBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function fromBase64(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").trim();
}

export function isValidMemberPhone(phone: string) {
  return normalizePhone(phone).length === 8;
}

export function parsePhoneList(value: string) {
  return value
    .split(/[\n,; ]+/)
    .map((item) => normalizePhone(item))
    .filter(Boolean);
}

export function dedupePhones(phones: string[]) {
  return Array.from(new Set(phones.map((phone) => normalizePhone(phone)).filter(Boolean)));
}

export function generateAccessCode(length = 6) {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * accessCodeAlphabet.length);
    return accessCodeAlphabet[index];
  }).join("");
}

export function buildInviteToken(invite: Omit<ChatInvite, "token">) {
  const payload: InvitePayload = {
    version: 2,
    inviteId: invite.id,
    chatId: invite.chatId,
    title: invite.title,
    kind: invite.kind,
    createdBy: invite.createdBy,
    createdByPhone: invite.createdByPhone,
    accessCode: invite.accessCode,
    allowedPhones: invite.allowedPhones,
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
