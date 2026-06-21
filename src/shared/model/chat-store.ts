import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSharedSecret } from "@/shared/lib/crypto/achat-crypto";
import {
  buildInviteToken,
  dedupePhones,
  generateAccessCode,
  isValidMemberPhone,
  normalizePhone
} from "@/shared/lib/invite/token";
import {
  createRemoteChat,
  deleteRemoteChat,
  fetchRemoteChats,
  joinRemoteChatByCode,
  updateRemoteChatSettings
} from "@/shared/lib/supabase/messaging";
import { useMessageStore } from "@/shared/model/message-store";
import type { Chat, ChatInvite, MessageTTL, UserProfile } from "@/shared/types/domain";

interface CreateDirectInput {
  title: string;
  recipientPhone: string;
  user: UserProfile;
}

interface CreateGroupInput {
  title: string;
  memberPhones: string[];
  user: UserProfile;
}

interface JoinInviteInput {
  accessCode: string;
  user: UserProfile;
}

interface ChatState {
  chats: Chat[];
  invites: ChatInvite[];
  chatSecretsByChatId: Record<string, string>;
  currentChatId: string;
  loading: boolean;
  setCurrentChatId: (chatId: string) => void;
  hydrateChats: (user: UserProfile) => Promise<void>;
  createDirectChat: (input: CreateDirectInput) => Promise<ChatInvite>;
  createGroupChat: (input: CreateGroupInput) => Promise<ChatInvite>;
  joinByAccessCode: (input: JoinInviteInput) => Promise<{ ok: true; chatId: string } | { ok: false; reason: string }>;
  updateGroupLimit: (chatId: string, memberLimit: number) => void;
  updateChatSettings: (input: {
    chatId: string;
    title: string;
    messageTtl: MessageTTL;
    memberLimit?: number;
  }) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  clearAllChats: () => void;
}

function sanitizeAllowedPhones(phones: string[]) {
  return dedupePhones(phones);
}

async function buildLocalChatInvite(input: {
  title: string;
  type: Chat["type"];
  user: UserProfile;
  allowedPhones: string[];
}) {
  const chatId = crypto.randomUUID();
  const inviteId = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const chatSecret = await generateSharedSecret();
  const normalizedPhones = sanitizeAllowedPhones(input.allowedPhones);
  const accessCode = generateAccessCode();

  const invite: ChatInvite = {
    id: inviteId,
    chatId,
    kind: input.type,
    title: input.title.trim(),
    createdBy: input.user.id,
    createdByPhone: normalizePhone(input.user.phone),
    accessCode,
    allowedPhones: normalizedPhones,
    allowedPhone: normalizedPhones[0] ?? null,
    maxParticipants: normalizedPhones.length,
    createdAt,
    chatSecret,
    token: ""
  };

  invite.token = buildInviteToken(invite);

  const chat: Chat = {
    id: chatId,
    familyId: chatId,
    type: input.type,
    title: input.title.trim(),
    subtitle:
      input.type === "group"
        ? `Код для ${normalizedPhones.length} участников`
        : `Вход по коду для номера ${normalizedPhones[0] ?? "не задан"}`,
    avatarGroup: [input.user.avatarUrl],
    unreadCount: 0,
    lastMessageAt: createdAt,
    ownerId: input.user.id,
    participantIds: [input.user.id],
    participantPhones: [normalizePhone(input.user.phone)],
    memberLimit: normalizedPhones.length,
    inviteId,
    targetPhone: normalizedPhones[0] ?? null,
    messageTtl: "7d"
  };

  return { chat, invite, chatSecret };
}

function validateGroupPhones(phones: string[]) {
  const normalizedPhones = sanitizeAllowedPhones(phones);

  if (normalizedPhones.length === 0) {
    return { ok: false as const, reason: "Добавьте хотя бы один 8-значный номер." };
  }

  if (normalizedPhones.some((phone) => !isValidMemberPhone(phone))) {
    return { ok: false as const, reason: "Для группы разрешены только 8-значные номера." };
  }

  if (normalizedPhones.length !== phones.map((phone) => normalizePhone(phone)).filter(Boolean).length) {
    return { ok: false as const, reason: "Одинаковые номера в группе запрещены." };
  }

  return { ok: true as const, phones: normalizedPhones };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get): ChatState => ({
      chats: [],
      invites: [],
      chatSecretsByChatId: {},
      currentChatId: "",
      loading: false,
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      hydrateChats: async (user) => {
        set({ loading: true });
        try {
          const chats = await fetchRemoteChats(user);
          set((state) => ({
            chats: chats.map((chat: Chat) => {
              const localInvite = state.invites.find((invite: ChatInvite) => invite.chatId === chat.id);
              return localInvite ? { ...chat, inviteId: localInvite.id } : chat;
            }),
            loading: false
          }));
        } catch {
          set({ loading: false });
        }
      },
      createDirectChat: async ({ title, recipientPhone, user }) => {
        const normalizedPhone = normalizePhone(recipientPhone);
        if (!isValidMemberPhone(normalizedPhone)) {
          throw new Error("Для личного чата нужен один 8-значный номер.");
        }

        const { chat, invite, chatSecret } = await createRemoteChat({
          title,
          type: "direct",
          allowedPhones: [normalizedPhone],
          user
        }).catch(() =>
          buildLocalChatInvite({
            title,
            type: "direct",
            allowedPhones: [normalizedPhone],
            user
          })
        );

        set((state) => ({
          chats: [chat, ...state.chats.filter((item: Chat) => item.id !== chat.id)],
          invites: [invite, ...state.invites.filter((item: ChatInvite) => item.id !== invite.id)],
          chatSecretsByChatId: {
            ...state.chatSecretsByChatId,
            [chat.id]: chatSecret
          },
          currentChatId: chat.id
        }));

        return invite;
      },
      createGroupChat: async ({ title, memberPhones, user }) => {
        const validation = validateGroupPhones(memberPhones);
        if (!validation.ok) {
          throw new Error(validation.reason);
        }

        const { chat, invite, chatSecret } = await createRemoteChat({
          title,
          type: "group",
          allowedPhones: validation.phones,
          user
        }).catch(() =>
          buildLocalChatInvite({
            title,
            type: "group",
            allowedPhones: validation.phones,
            user
          })
        );

        set((state) => ({
          chats: [chat, ...state.chats.filter((item: Chat) => item.id !== chat.id)],
          invites: [invite, ...state.invites.filter((item: ChatInvite) => item.id !== invite.id)],
          chatSecretsByChatId: {
            ...state.chatSecretsByChatId,
            [chat.id]: chatSecret
          },
          currentChatId: chat.id
        }));

        return invite;
      },
      joinByAccessCode: async ({
        accessCode,
        user
      }: JoinInviteInput): Promise<{ ok: true; chatId: string } | { ok: false; reason: string }> => {
        const normalizedAccessCode = accessCode.trim().toUpperCase();
        const normalizedUserPhone = normalizePhone(user.phone);

        const localInvite = get().invites.find((invite: ChatInvite) => invite.accessCode === normalizedAccessCode);

        if (localInvite) {
          const invitePhones = localInvite.allowedPhones;
          if (!invitePhones.includes(normalizedUserPhone)) {
            return { ok: false as const, reason: "Этот код не разрешён для вашего номера." };
          }

          const targetChat = get().chats.find((chat: Chat) => chat.id === localInvite.chatId);
          if (!targetChat) {
            return { ok: false as const, reason: "Чат для этого кода не найден." };
          }

          if (targetChat.participantPhones.includes(normalizedUserPhone)) {
            return { ok: false as const, reason: "С этим номером уже вошли в чат." };
          }

          set((state) => ({
            chats: state.chats.map((chat: Chat) =>
              chat.id === targetChat.id
                ? {
                    ...chat,
                    participantIds: [...chat.participantIds, user.id],
                    participantPhones: [...chat.participantPhones, normalizedUserPhone],
                    subtitle:
                      chat.type === "group"
                        ? `Участников: ${chat.participantPhones.length + 1}`
                        : "Защищенный чат"
                  }
                : chat
            ),
            currentChatId: targetChat.id
          }));

          return { ok: true as const, chatId: targetChat.id };
        }

        try {
          const { chat, chatSecret } = await joinRemoteChatByCode({
            accessCode: normalizedAccessCode,
            user
          });

          set((state) => ({
            chats: [chat, ...state.chats.filter((item: Chat) => item.id !== chat.id)],
            chatSecretsByChatId: {
              ...state.chatSecretsByChatId,
              [chat.id]: chatSecret
            },
            currentChatId: chat.id
          }));

          return { ok: true as const, chatId: chat.id };
        } catch (error) {
          return {
            ok: false as const,
            reason:
              error instanceof Error
                ? error.message
                : "Не удалось подключиться по коду."
          };
        }
      },
      updateGroupLimit: (chatId: string, memberLimit: number) =>
        set((state) => ({
          chats: state.chats.map((chat: Chat) =>
            chat.id === chatId && chat.type === "group"
              ? {
                  ...chat,
                  memberLimit: Math.max(1, Math.min(memberLimit, 50)),
                  subtitle: `Лимит участников: ${Math.max(1, Math.min(memberLimit, 50))}`
                }
              : chat
          ),
          invites: state.invites.map((invite: ChatInvite) =>
            invite.chatId === chatId && invite.kind === "group"
              ? {
                  ...invite,
                  maxParticipants: Math.max(1, Math.min(memberLimit, 50))
                }
              : invite
          )
        })),
      updateChatSettings: async ({
        chatId,
        title,
        messageTtl,
        memberLimit
      }: {
        chatId: string;
        title: string;
        messageTtl: MessageTTL;
        memberLimit?: number;
      }) => {
        await updateRemoteChatSettings({
          chatId,
          title,
          messageTtl,
          memberLimit
        }).catch(() => undefined);

        set((state) => ({
          chats: state.chats.map((chat: Chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: title.trim(),
                  messageTtl,
                  memberLimit:
                    chat.type === "group" && typeof memberLimit === "number"
                      ? Math.max(1, Math.min(memberLimit, 50))
                      : chat.memberLimit
                }
              : chat
          )
        }));
      },
      deleteChat: async (chatId: string) => {
        await deleteRemoteChat(chatId).catch(() => undefined);
        useMessageStore.getState().clearChatMessages(chatId);
        set((state) => {
          const nextSecrets = { ...state.chatSecretsByChatId };
          delete nextSecrets[chatId];

          return {
            chats: state.chats.filter((chat: Chat) => chat.id !== chatId),
            invites: state.invites.filter((invite: ChatInvite) => invite.chatId !== chatId),
            chatSecretsByChatId: nextSecrets,
            currentChatId: state.currentChatId === chatId ? "" : state.currentChatId
          };
        });
      },
      clearAllChats: () => {
        set({
          chats: [],
          invites: [],
          chatSecretsByChatId: {},
          currentChatId: "",
          loading: false
        });
      }
    }),
    {
      name: "achat-chats",
      partialize: (state) => ({
        chats: state.chats,
        invites: state.invites,
        chatSecretsByChatId: state.chatSecretsByChatId,
        currentChatId: state.currentChatId
      })
    }
  )
);
