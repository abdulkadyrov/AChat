import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  decryptText,
  encryptText,
  generateSharedSecret,
  importDeviceKey
} from "@/shared/lib/crypto/achat-crypto";
import { buildInviteToken, normalizePhone } from "@/shared/lib/invite/token";
import { computeExpiresAt } from "@/shared/lib/ttl/messages";
import { supabase } from "@/shared/lib/supabase/client";
import type { Chat, ChatInvite, Message, MessageTTL, UserProfile } from "@/shared/types/domain";

type ChatRow = {
  id: string;
  type: Chat["type"];
  title: string;
  owner_id: string;
  target_phone: string | null;
  member_limit: number | null;
  message_ttl: MessageTTL;
  created_at: string;
};

type MessageRow = {
  id: string;
  chat_id: string;
  sender_id: string;
  ciphertext: string;
  iv: string;
  type: Message["type"];
  created_at: string;
  expires_at: string | null;
  reply_to: string | null;
  media_path: string | null;
};

function mapChatRow(row: ChatRow, memberIds: string[], avatarGroup: string[], inviteId: string | null): Chat {
  return {
    id: row.id,
    familyId: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.type === "group" ? `Участников: ${memberIds.length}` : "Защищенный чат",
    avatarGroup,
    unreadCount: 0,
    lastMessageAt: row.created_at,
    ownerId: row.owner_id,
    participantIds: memberIds,
    memberLimit: row.member_limit,
    inviteId,
    targetPhone: row.target_phone,
    messageTtl: row.message_ttl
  };
}

export async function ensureSupabaseIdentity(user: UserProfile) {
  const existing = await supabase.auth.getSession();
  if (!existing.data.session) {
    const auth = await supabase.auth.signInAnonymously();
    if (auth.error || !auth.data.user) throw auth.error ?? new Error("Unable to create session");
  }

  const current = await supabase.auth.getUser();
  const authUser = current.data.user;
  if (!authUser) throw new Error("Missing Supabase auth user");

  const { error } = await supabase.from("users").upsert({
    id: authUser.id,
    name: user.name,
    avatar_url: user.avatarUrl,
    phone: user.phone,
    about: user.about
  });

  if (error) throw error;
  return authUser.id;
}

export async function signOutSupabase() {
  await supabase.auth.signOut();
}

export async function createRemoteChat(input: {
  title: string;
  type: Chat["type"];
  user: UserProfile;
  memberLimit: number | null;
  targetPhone: string | null;
}) {
  const ownerId = await ensureSupabaseIdentity(input.user);
  const chatSecret = await generateSharedSecret();
  const inviteId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const { data: chatRow, error: chatError } = await supabase
    .from("chats")
    .insert({
      id: crypto.randomUUID(),
      type: input.type,
      title: input.title.trim(),
      owner_id: ownerId,
      target_phone: input.targetPhone ? normalizePhone(input.targetPhone) : null,
      member_limit: input.memberLimit,
      message_ttl: "7d"
    })
    .select()
    .single<ChatRow>();

  if (chatError || !chatRow) throw chatError ?? new Error("Unable to create chat");

  const { error: memberError } = await supabase.from("chat_members").insert({
    chat_id: chatRow.id,
    user_id: ownerId
  });
  if (memberError) throw memberError;

  const inviteDraft = {
    id: inviteId,
    chatId: chatRow.id,
    kind: input.type,
    title: input.title.trim(),
    createdBy: ownerId,
    createdByPhone: normalizePhone(input.user.phone),
    allowedPhone: input.targetPhone ? normalizePhone(input.targetPhone) : null,
    maxParticipants: input.type === "group" ? Math.max(1, input.memberLimit ?? 1) : 1,
    createdAt,
    chatSecret
  };
  const invite: ChatInvite = {
    ...inviteDraft,
    token: buildInviteToken(inviteDraft)
  };

  const { error: inviteError } = await supabase.from("chat_invites").insert({
    id: invite.id,
    chat_id: invite.chatId,
    kind: invite.kind,
    created_by: invite.createdBy,
    allowed_phone: invite.allowedPhone,
    max_participants: invite.maxParticipants,
    used_count: 0,
    is_active: true
  });
  if (inviteError) throw inviteError;

  const chat = mapChatRow(chatRow, [ownerId], [input.user.avatarUrl], invite.id);
  return { chat, invite, chatSecret };
}

export async function joinRemoteChatByInvite(input: {
  inviteId: string;
  chatSecret: string;
  user: UserProfile;
}) {
  const remoteUserId = await ensureSupabaseIdentity(input.user);
  const { data, error } = await supabase.rpc("consume_chat_invite", {
    p_invite_id: input.inviteId,
    p_phone: normalizePhone(input.user.phone)
  });

  if (error || !data) throw error ?? new Error("Unable to join invite");

  const chatRow = data as ChatRow;
  return {
    chat: mapChatRow(chatRow, [remoteUserId], [input.user.avatarUrl], input.inviteId),
    chatSecret: input.chatSecret
  };
}

export async function fetchRemoteChats(user: UserProfile) {
  const remoteUserId = await ensureSupabaseIdentity(user);
  const { data: memberRows, error: memberError } = await supabase
    .from("chat_members")
    .select("chat_id")
    .eq("user_id", remoteUserId);

  if (memberError) throw memberError;
  const chatIds = (memberRows ?? []).map((row) => row.chat_id);
  if (chatIds.length === 0) return [];

  const { data: chats, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .in("id", chatIds)
    .order("created_at", { ascending: false });
  if (chatError) throw chatError;

  const { data: allMembers } = await supabase
    .from("chat_members")
    .select("chat_id,user_id,users(avatar_url)")
    .in("chat_id", chatIds);
  const { data: invites } = await supabase
    .from("chat_invites")
    .select("id,chat_id")
    .in("chat_id", chatIds);

  return (chats as ChatRow[]).map((row) => {
    const members = (allMembers ?? []).filter((member) => member.chat_id === row.id);
    const avatars = members
      .map((member: any) => member.users?.avatar_url)
      .filter(Boolean)
      .slice(0, 3);
    const memberIds = members.map((member) => member.user_id);
    const inviteId = (invites ?? []).find((item: any) => item.chat_id === row.id)?.id ?? null;
    return mapChatRow(row, memberIds, avatars, inviteId);
  });
}

export async function fetchRemoteMessages(chatId: string, chatSecret: string) {
  const key = await importDeviceKey(chatSecret);
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as MessageRow[];
  const messages = await Promise.all(
    rows.map(async (row) => {
      const decrypted = await decryptText(row.ciphertext, row.iv, key).catch(() => "");
      const mediaPayload =
        row.type === "image" || row.type === "voice" ? safeParseMediaPayload(decrypted) : null;
      return {
        id: row.id,
        chatId: row.chat_id,
        senderId: row.sender_id,
        ciphertext: row.ciphertext,
        iv: row.iv,
        type: row.type,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        replyTo: row.reply_to,
        preview: mediaPayload?.preview ?? decrypted,
        mediaPath: row.media_path ?? undefined,
        mediaDataUrl: mediaPayload?.dataUrl,
        durationSec: mediaPayload?.durationSec,
        status: "sent" as const
      } satisfies Message;
    })
  );

  return messages;
}

export async function sendRemoteTextMessage(input: {
  chatId: string;
  user: UserProfile;
  chatSecret: string;
  content: string;
  ttl: MessageTTL;
  replyTo?: string | null;
}) {
  const remoteUserId = await ensureSupabaseIdentity(input.user);
  const key = await importDeviceKey(input.chatSecret);
  const createdAt = new Date().toISOString();
  const encrypted = await encryptText(input.content, key);

  const payload = {
    chat_id: input.chatId,
    sender_id: remoteUserId,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    type: "text",
    created_at: createdAt,
    expires_at: computeExpiresAt(createdAt, input.ttl),
    reply_to: input.replyTo ?? null
  };

  const { data, error } = await supabase.from("messages").insert(payload).select().single<MessageRow>();
  if (error || !data) throw error ?? new Error("Unable to send message");

  return {
    id: data.id,
    chatId: data.chat_id,
    senderId: data.sender_id,
    ciphertext: data.ciphertext,
    iv: data.iv,
    type: "text",
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    replyTo: data.reply_to,
    preview: input.content,
    status: "sent" as const
  } satisfies Message;
}

function safeParseMediaPayload(value: string) {
  try {
    return JSON.parse(value) as {
      preview: string;
      dataUrl: string;
      durationSec?: number;
    };
  } catch {
    return null;
  }
}

export async function sendRemoteMediaMessage(input: {
  chatId: string;
  user: UserProfile;
  chatSecret: string;
  ttl: MessageTTL;
  type: "image" | "voice";
  dataUrl: string;
  preview: string;
  durationSec?: number;
  replyTo?: string | null;
}) {
  const remoteUserId = await ensureSupabaseIdentity(input.user);
  const key = await importDeviceKey(input.chatSecret);
  const createdAt = new Date().toISOString();
  const encrypted = await encryptText(
    JSON.stringify({
      preview: input.preview,
      dataUrl: input.dataUrl,
      durationSec: input.durationSec
    }),
    key
  );

  const payload = {
    chat_id: input.chatId,
    sender_id: remoteUserId,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    type: input.type,
    created_at: createdAt,
    expires_at: computeExpiresAt(createdAt, input.ttl),
    reply_to: input.replyTo ?? null
  };

  const { data, error } = await supabase.from("messages").insert(payload).select().single<MessageRow>();
  if (error || !data) throw error ?? new Error("Unable to send media message");

  return {
    id: data.id,
    chatId: data.chat_id,
    senderId: data.sender_id,
    ciphertext: data.ciphertext,
    iv: data.iv,
    type: input.type,
    createdAt: data.created_at,
    expiresAt: data.expires_at,
    replyTo: data.reply_to,
    preview: input.preview,
    mediaDataUrl: input.dataUrl,
    durationSec: input.durationSec,
    status: "sent" as const
  } satisfies Message;
}

export async function deleteRemoteMessage(messageId: string) {
  const { error } = await supabase.from("messages").delete().eq("id", messageId);
  if (error) throw error;
}

export async function updateRemoteChatSettings(input: {
  chatId: string;
  title: string;
  messageTtl: MessageTTL;
  memberLimit?: number;
}) {
  const { error: chatError } = await supabase
    .from("chats")
    .update({
      title: input.title.trim(),
      message_ttl: input.messageTtl,
      member_limit: typeof input.memberLimit === "number" ? input.memberLimit : undefined
    })
    .eq("id", input.chatId);

  if (chatError) throw chatError;

  if (typeof input.memberLimit === "number") {
    const { error: inviteError } = await supabase
      .from("chat_invites")
      .update({ max_participants: input.memberLimit })
      .eq("chat_id", input.chatId);
    if (inviteError) throw inviteError;
  }
}

export async function deleteRemoteChat(chatId: string) {
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) throw error;
}

export function subscribeToRemoteMessages(
  chatId: string,
  onInsert: (row: MessageRow) => void
): RealtimeChannel {
  return supabase
    .channel(`messages:${chatId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
      (payload) => onInsert(payload.new as MessageRow)
    )
    .subscribe();
}

export async function decryptRemoteMessage(row: MessageRow, chatSecret: string) {
  const key = await importDeviceKey(chatSecret);
  const decrypted = await decryptText(row.ciphertext, row.iv, key).catch(() => "");
  const mediaPayload =
    row.type === "image" || row.type === "voice" ? safeParseMediaPayload(decrypted) : null;

  return {
    id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    ciphertext: row.ciphertext,
    iv: row.iv,
    type: row.type,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    replyTo: row.reply_to,
    preview: mediaPayload?.preview ?? decrypted,
    mediaPath: row.media_path ?? undefined,
    mediaDataUrl: mediaPayload?.dataUrl,
    durationSec: mediaPayload?.durationSec,
    status: "sent" as const
  } satisfies Message;
}
