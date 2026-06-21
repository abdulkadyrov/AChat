import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseInviteToken } from "@/shared/lib/invite/token";
import {
  createRemoteChat,
  fetchRemoteChats,
  joinRemoteChatByInvite,
  updateRemoteChatSettings
} from "@/shared/lib/supabase/messaging";
import type { Chat, ChatInvite, MessageTTL, UserProfile } from "@/shared/types/domain";

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
  chatSecretsByChatId: Record<string, string>;
  currentChatId: string;
  loading: boolean;
  setCurrentChatId: (chatId: string) => void;
  hydrateChats: (user: UserProfile) => Promise<void>;
  createDirectChat: (input: CreateDirectInput) => Promise<ChatInvite>;
  createGroupChat: (input: CreateGroupInput) => Promise<ChatInvite>;
  joinByInviteToken: (input: JoinInviteInput) => Promise<{ ok: true; chatId: string } | { ok: false; reason: string }>;
  updateGroupLimit: (chatId: string, memberLimit: number) => void;
  updateChatSettings: (input: {
    chatId: string;
    title: string;
    messageTtl: MessageTTL;
    memberLimit?: number;
  }) => Promise<void>;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
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
            chats: chats.map((chat) => {
              const localInvite = state.invites.find((invite) => invite.chatId === chat.id);
              return localInvite ? { ...chat, inviteId: localInvite.id } : chat;
            }),
            loading: false
          }));
        } catch {
          set({ loading: false });
        }
      },
      createDirectChat: async ({ title, recipientPhone, user }) => {
        const { chat, invite, chatSecret } = await createRemoteChat({
          title,
          type: "direct",
          memberLimit: 1,
          targetPhone: recipientPhone,
          user
        });

        set((state) => ({
          chats: [chat, ...state.chats.filter((item) => item.id !== chat.id)],
          invites: [invite, ...state.invites.filter((item) => item.id !== invite.id)],
          chatSecretsByChatId: {
            ...state.chatSecretsByChatId,
            [chat.id]: chatSecret
          },
          currentChatId: chat.id
        }));

        return invite;
      },
      createGroupChat: async ({ title, memberLimit, user }) => {
        const { chat, invite, chatSecret } = await createRemoteChat({
          title,
          type: "group",
          memberLimit,
          targetPhone: null,
          user
        });

        set((state) => ({
          chats: [chat, ...state.chats.filter((item) => item.id !== chat.id)],
          invites: [invite, ...state.invites.filter((item) => item.id !== invite.id)],
          chatSecretsByChatId: {
            ...state.chatSecretsByChatId,
            [chat.id]: chatSecret
          },
          currentChatId: chat.id
        }));

        return invite;
      },
      joinByInviteToken: async ({ token, user }) => {
        try {
          const payload = parseInviteToken(token.trim());
          const { chat, chatSecret } = await joinRemoteChatByInvite({
            inviteId: payload.inviteId,
            chatSecret: payload.chatSecret,
            user
          });

          set((state) => ({
            chats: [chat, ...state.chats.filter((item) => item.id !== chat.id)],
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
                : "Не удалось подключиться по QR-коду."
          };
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
                  maxParticipants: Math.max(1, Math.min(memberLimit, 50))
                }
              : invite
          )
        })),
      updateChatSettings: async ({ chatId, title, messageTtl, memberLimit }) => {
        await updateRemoteChatSettings({
          chatId,
          title,
          messageTtl,
          memberLimit
        });
        set((state) => ({
          chats: state.chats.map((chat) =>
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
          ),
          invites: state.invites.map((invite) =>
            invite.chatId === chatId
              ? {
                  ...invite,
                  title: title.trim(),
                  maxParticipants:
                    invite.kind === "group" && typeof memberLimit === "number"
                      ? Math.max(1, Math.min(memberLimit, 50))
                      : invite.maxParticipants
                }
              : invite
          )
        }));
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
