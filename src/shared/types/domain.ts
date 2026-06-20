export type MessageType = "text" | "voice" | "image" | "system";
export type ChatType = "direct" | "group";
export type ThemeMode = "light" | "dark";
export type MessageTTL = "off" | "24h" | "7d" | "30d";
export type InviteKind = "direct" | "group";

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  about: string;
  createdAt: string;
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: "owner" | "member";
  status: "online" | "recently" | "offline";
}

export interface Chat {
  id: string;
  familyId: string;
  type: ChatType;
  title: string;
  subtitle: string;
  avatarGroup: string[];
  unreadCount: number;
  lastMessageAt: string;
  ownerId: string;
  participantIds: string[];
  memberLimit: number | null;
  inviteId: string | null;
  targetPhone: string | null;
}

export interface ChatInvite {
  id: string;
  chatId: string;
  kind: InviteKind;
  title: string;
  createdBy: string;
  createdByPhone: string;
  allowedPhone: string | null;
  maxParticipants: number;
  createdAt: string;
  token: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  ciphertext: string;
  iv: string;
  type: MessageType;
  createdAt: string;
  expiresAt: string | null;
  replyTo: string | null;
  preview?: string;
  mediaPath?: string;
  durationSec?: number;
  status?: "sending" | "sent" | "read";
}

export interface DecryptedMessage extends Message {
  content: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
