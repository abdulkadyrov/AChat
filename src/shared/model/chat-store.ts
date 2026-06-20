import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildInviteToken, normalizePhone, parseInviteToken } from "@/shared/lib/invite/token";
import type { Chat, ChatInvite, UserProfile } from "@/shared/types/domain";

interface CreateDirectInput {
  title: string;
  recipientPhone: string;
  user: UserProfile;
}

interface CreateGroupInput {
  title: string;
  memberLimit: number;
  user: UserProfile;
}

interface JoinInviteInput {
  token: string;
  user: UserProfile;
}

interface ChatState {
  chats: Chat[];
  invites: ChatInvite[];
  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
  createDirectChat: (input: CreateDirectInput) => ChatInvite;
  createGroupChat: (input: CreateGroupInput) => ChatInvite;
  joinByInviteToken: (input: JoinInviteInput) => { ok: true; chatId: string } | { ok: false; reason: string };
  updateGroupLimit: (chatId: string, memberLimit: number) => void;
}

function buildBaseChat(input: {
  id: string;
  title: string;
  type: Chat["type"];
  user: UserProfile;
  memberLimit: number | null;
  inviteId: string;
  targetPhone: string | null;
}) {
  const now = new Date().toISOString();

  return {
    id: input.id,
    familyId: input.id,
    type: input.type,
    title: input.title.trim(),
    subtitle: input.type === "group" ? "Группа создана" : "Приглашение создано",
    avatarGroup: [input.user.avatarUrl],
    unreadCount: 0,
    lastMessageAt: now,
    ownerId: input.user.id,
    participantIds: [input.user.id],
    memberLimit: input.memberLimit,
    inviteId: input.inviteId,
    targetPhone: input.targetPhone
  } satisfies Chat;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      invites: [],
      currentChatId: "",
      setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
      createDirectChat: ({ title, recipientPhone, user }) => {
        const chatId = crypto.randomUUID();
        const inviteId = crypto.randomUUID();
        const allowedPhone = normalizePhone(recipientPhone);
        const draft = {
          id: inviteId,
          chatId,
          kind: "direct" as const,
          title: title.trim(),
          createdBy: user.id,
          createdByPhone: normalizePhone(user.phone),
          allowedPhone,
          maxParticipants: 1,
          createdAt: new Date().toISOString()
        };
        const invite: ChatInvite = { ...draft, token: buildInviteToken(draft) };
        const chat = buildBaseChat({
          id: chatId,
          title,
          type: "direct",
          user,
          memberLimit: 1,
          inviteId,
          targetPhone: allowedPhone
        });

        set((state) => ({
          chats: [chat, ...state.chats],
          invites: [invite, ...state.invites],
          currentChatId: chatId
        }));

        return invite;
      },
      createGroupChat: ({ title, memberLimit, user }) => {
        const chatId = crypto.randomUUID();
        const inviteId = crypto.randomUUID();
        const normalizedLimit = Math.max(1, Math.min(memberLimit, 50));
        const draft = {
          id: inviteId,
          chatId,
          kind: "group" as const,
          title: title.trim(),
          createdBy: user.id,
          createdByPhone: normalizePhone(user.phone),
          allowedPhone: null,
          maxParticipants: normalizedLimit,
          createdAt: new Date().toISOString()
        };
        const invite: ChatInvite = { ...draft, token: buildInviteToken(draft) };
        const chat = buildBaseChat({
          id: chatId,
          title,
          type: "group",
          user,
          memberLimit: normalizedLimit,
          inviteId,
          targetPhone: null
        });

        set((state) => ({
          chats: [chat, ...state.chats],
          invites: [invite, ...state.invites],
          currentChatId: chatId
        }));

        return invite;
      },
      joinByInviteToken: ({ token, user }) => {
        try {
          const payload = parseInviteToken(token.trim());
          const normalizedUserPhone = normalizePhone(user.phone);

          if (payload.kind === "direct" && payload.allowedPhone !== normalizedUserPhone) {
            return { ok: false as const, reason: "Этот QR-код привязан к другому номеру телефона." };
          }

          const existingChat = get().chats.find((chat) => chat.inviteId === payload.inviteId);
          if (existingChat && existingChat.participantIds.includes(user.id)) {
            return { ok: false as const, reason: "Этот чат уже подключен на текущем устройстве." };
          }

          const chat: Chat = existingChat
            ? {
                ...existingChat,
                participantIds: Array.from(new Set([...existingChat.participantIds, user.id])),
                avatarGroup: Array.from(new Set([...existingChat.avatarGroup, user.avatarUrl])).slice(0, 3),
                subtitle:
                  payload.kind === "group"
                    ? `Участников: ${Math.min(existingChat.participantIds.length + 1, payload.maxParticipants + 1)}`
                    : "Подключение выполнено"
              }
            : {
                id: payload.chatId,
                familyId: payload.chatId,
                type: payload.kind,
                title: payload.title,
                subtitle: payload.kind === "group" ? "Подключение по QR" : "Личный чат по QR",
                avatarGroup: [user.avatarUrl],
                unreadCount: 0,
                lastMessageAt: new Date().toISOString(),
                ownerId: payload.createdBy,
                participantIds: [user.id],
                memberLimit: payload.kind === "group" ? payload.maxParticipants : 1,
                inviteId: payload.inviteId,
                targetPhone: payload.allowedPhone
              };

          if (
            chat.type === "group" &&
            chat.memberLimit !== null &&
            chat.participantIds.length - 1 > chat.memberLimit
          ) {
            return { ok: false as const, reason: "Лимит участников этой группы уже исчерпан." };
          }

          set((state) => ({
            chats: existingChat
              ? state.chats.map((item) => (item.id === chat.id ? chat : item))
              : [chat, ...state.chats],
            currentChatId: chat.id
          }));

          return { ok: true as const, chatId: chat.id };
        } catch {
          return { ok: false as const, reason: "Не удалось прочитать QR-код или код приглашения." };
        }
      },
      updateGroupLimit: (chatId, memberLimit) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId && chat.type === "group"
              ? {
                  ...chat,
                  memberLimit: Math.max(1, Math.min(memberLimit, 50)),
                  subtitle: `Лимит участников: ${Math.max(1, Math.min(memberLimit, 50))}`
                }
              : chat
          ),
          invites: state.invites.map((invite) =>
            invite.chatId === chatId && invite.kind === "group"
              ? {
                  ...invite,
                  maxParticipants: Math.max(1, Math.min(memberLimit, 50)),
                  token: buildInviteToken({
                    ...invite,
                    maxParticipants: Math.max(1, Math.min(memberLimit, 50))
                  })
                }
              : invite
          )
        }))
    }),
    {
      name: "achat-chats",
      partialize: (state) => ({
        chats: state.chats,
        invites: state.invites,
        currentChatId: state.currentChatId
      })
    }
  )
);
