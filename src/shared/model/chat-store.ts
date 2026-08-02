import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateSharedSecret } from "@/shared/lib/crypto/achat-crypto";
import {
  buildInviteToken,
  dedupePhones,
  generateAccessCode,
  normalizePhone,
  parseInviteToken
} from "@/shared/lib/invite/token";
import {
  createRemoteChat,
  deleteRemoteChat,
  fetchRemoteChats,
  joinRemoteChatByCode,
  updateRemoteChatSettings
} from "@/shared/lib/supabase/messaging";
import { useMessageStore } from "@/shared/model/message-store";
import { isSupabaseConfigured } from "@/shared/config/env";
import { createDemoChats, createDemoInvites, createDemoMessages } from "@/shared/mocks/demo-data";
import type { Chat, ChatInvite, MessageTTL, UserProfile } from "@/shared/types/domain";

interface CreateDirectInput {
  title: string;
  user: UserProfile;
}

interface CreateGroupInput {
  title: string;
  memberLimit: number;
  user: UserProfile;
}

interface JoinInviteInput {
  accessCode: string;
  user: UserProfile;
}

interface JoinTokenInput {
  token: string;
  user: UserProfile;
}

export interface ChatState {
  chats: Chat[];
  invites: ChatInvite[];
  chatSecretsByChatId: Record<string, string>;
  currentChatId: string;
  loading: boolean;
  error: string | null;
  setCurrentChatId: (chatId: string) => void;
  hydrateChats: (user: UserProfile) => Promise<void>;
  createDirectChat: (input: CreateDirectInput) => Promise<ChatInvite>;
  createGroupChat: (input: CreateGroupInput) => Promise<ChatInvite>;
  joinByAccessCode: (
    input: JoinInviteInput
  ) => Promise<{ ok: true; chatId: string } | { ok: false; reason: string }>;
  joinByInviteToken: (
    input: JoinTokenInput
  ) => Promise<{ ok: true; chatId: string } | { ok: false; reason: string }>;
  updateGroupLimit: (chatId: string, memberLimit: number) => void;
  rotateInvite: (chatId: string) => ChatInvite | null;
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
  memberLimit: number;
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
    maxParticipants: input.memberLimit,
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
        ? `QR-приглашение · до ${input.memberLimit} участников`
        : "Вход по QR-приглашению",
    avatarGroup: [input.user.avatarUrl],
    unreadCount: 0,
    lastMessageAt: createdAt,
    ownerId: input.user.id,
    participantIds: [input.user.id],
    participantPhones: [normalizePhone(input.user.phone)],
    memberLimit: input.memberLimit,
    inviteId,
    targetPhone: normalizedPhones[0] ?? null,
    messageTtl: "7d"
  };

  return { chat, invite, chatSecret };
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get): ChatState => ({
      chats: [],
      invites: [],
      chatSecretsByChatId: {},
      currentChatId: "",
      loading: false,
      error: null,
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      hydrateChats: async (user) => {
        set({ loading: true, error: null });
        if (!isSupabaseConfigured) {
          const currentChats = get().chats;
          const chats = currentChats.length > 0 ? currentChats : createDemoChats(user);
          const messages = createDemoMessages(user);
          const messageStore = useMessageStore.getState();
          for (const [chatId, chatMessages] of Object.entries(messages)) {
            if ((messageStore.messagesByChatId[chatId] ?? []).length === 0) {
              messageStore.setMessages(chatId, chatMessages);
            }
          }
          set((state) => ({
            chats,
            invites: state.invites.length > 0 ? state.invites : createDemoInvites(user),
            currentChatId: state.currentChatId || chats[0]?.id || "",
            loading: false
          }));
          return;
        }
        try {
          const chats = await fetchRemoteChats(user);
          set((state) => ({
            chats: chats.map((chat: Chat) => {
              const localInvite = state.invites.find(
                (invite: ChatInvite) => invite.chatId === chat.id
              );
              return localInvite ? { ...chat, inviteId: localInvite.id } : chat;
            }),
            loading: false
          }));
        } catch {
          set({
            loading: false,
            error: "Не удалось загрузить чаты. Проверьте подключение и повторите."
          });
        }
      },
      createDirectChat: async ({ title, user }) => {
        if (!title.trim()) throw new Error("Введите название чата.");

        const { chat, invite, chatSecret } = isSupabaseConfigured
          ? await createRemoteChat({
              title,
              type: "direct",
              allowedPhones: [],
              memberLimit: 1,
              user
            })
          : await buildLocalChatInvite({
              title,
              type: "direct",
              allowedPhones: [],
              memberLimit: 1,
              user
            });

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
      createGroupChat: async ({ title, memberLimit, user }) => {
        if (!title.trim()) throw new Error("Введите название группы.");
        if (!Number.isInteger(memberLimit) || memberLimit < 1 || memberLimit > 50) {
          throw new Error("Укажите количество участников от 1 до 50.");
        }

        const { chat, invite, chatSecret } = isSupabaseConfigured
          ? await createRemoteChat({
              title,
              type: "group",
              allowedPhones: [],
              memberLimit,
              user
            })
          : await buildLocalChatInvite({
              title,
              type: "group",
              allowedPhones: [],
              memberLimit,
              user
            });

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
      }: JoinInviteInput): Promise<
        { ok: true; chatId: string } | { ok: false; reason: string }
      > => {
        const normalizedAccessCode = accessCode.trim().toUpperCase();
        const normalizedUserPhone = normalizePhone(user.phone);

        const localInvite = get().invites.find(
          (invite: ChatInvite) => invite.accessCode === normalizedAccessCode
        );

        if (localInvite) {
          const invitePhones = localInvite.allowedPhones;
          if (invitePhones.length > 0 && !invitePhones.includes(normalizedUserPhone)) {
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
            reason: error instanceof Error ? error.message : "Не удалось подключиться по коду."
          };
        }
      },
      joinByInviteToken: async ({ token, user }) => {
        try {
          const payload = parseInviteToken(token);
          const existingInvite = get().invites.find(
            (invite) => invite.id === payload.inviteId || invite.accessCode === payload.accessCode
          );

          if (existingInvite || isSupabaseConfigured) {
            return get().joinByAccessCode({ accessCode: payload.accessCode, user });
          }

          if (Date.now() - new Date(payload.createdAt).getTime() > 24 * 60 * 60 * 1000) {
            return { ok: false as const, reason: "Срок действия QR-приглашения истёк." };
          }

          const normalizedUserPhone = normalizePhone(user.phone);
          if (
            payload.allowedPhones.length > 0 &&
            !payload.allowedPhones.includes(normalizedUserPhone)
          ) {
            return {
              ok: false as const,
              reason: "Приглашение не предназначено для этого профиля."
            };
          }

          const participantIds = Array.from(new Set([payload.createdBy, user.id]));
          const participantPhones = Array.from(
            new Set([payload.createdByPhone, normalizedUserPhone].filter(Boolean))
          );
          const invite: ChatInvite = {
            id: payload.inviteId,
            chatId: payload.chatId,
            kind: payload.kind,
            title: payload.title,
            createdBy: payload.createdBy,
            createdByPhone: payload.createdByPhone,
            accessCode: payload.accessCode,
            allowedPhones: payload.allowedPhones,
            allowedPhone: payload.allowedPhones[0] ?? null,
            maxParticipants: payload.maxParticipants,
            createdAt: payload.createdAt,
            chatSecret: payload.chatSecret,
            token
          };
          const chat: Chat = {
            id: payload.chatId,
            familyId: payload.chatId,
            type: payload.kind,
            title: payload.title,
            subtitle:
              payload.kind === "group" ? `Участников: ${participantIds.length}` : "Защищённый чат",
            avatarGroup: [user.avatarUrl],
            unreadCount: 0,
            lastMessageAt: new Date().toISOString(),
            ownerId: payload.createdBy,
            participantIds,
            participantPhones,
            memberLimit: payload.maxParticipants,
            inviteId: payload.inviteId,
            targetPhone: payload.allowedPhones[0] ?? null,
            messageTtl: "7d"
          };

          set((state) => ({
            chats: [chat, ...state.chats.filter((item) => item.id !== chat.id)],
            invites: [invite, ...state.invites.filter((item) => item.id !== invite.id)],
            chatSecretsByChatId: {
              ...state.chatSecretsByChatId,
              [chat.id]: payload.chatSecret
            },
            currentChatId: chat.id
          }));

          return { ok: true as const, chatId: chat.id };
        } catch {
          return { ok: false as const, reason: "Это не QR-приглашение AChat." };
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
      rotateInvite: (chatId: string) => {
        const current = get().invites.find((invite) => invite.chatId === chatId);
        if (!current) return null;
        const draft = {
          ...current,
          id: crypto.randomUUID(),
          accessCode: generateAccessCode(),
          createdAt: new Date().toISOString()
        };
        const nextInvite: ChatInvite = { ...draft, token: buildInviteToken(draft) };
        set((state) => ({
          invites: [nextInvite, ...state.invites.filter((invite) => invite.chatId !== chatId)],
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, inviteId: nextInvite.id } : chat
          )
        }));
        return nextInvite;
      },
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
          loading: false,
          error: null
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
