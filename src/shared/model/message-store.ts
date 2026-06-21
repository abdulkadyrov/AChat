import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/shared/types/domain";

export interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  sendingState: "idle" | "sending" | "error";
  setMessages: (chatId: string, messages: Message[]) => void;
  enqueueMessage: (message: Message) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  clearChatMessages: (chatId: string) => void;
  clearAllMessages: () => void;
  setSendingState: (state: MessageState["sendingState"]) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messagesByChatId: {},
      sendingState: "idle",
      setMessages: (chatId, messages) =>
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: messages
          }
        })),
      enqueueMessage: (message) =>
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [message.chatId]: [...(state.messagesByChatId[message.chatId] ?? []), message].filter(
              (item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index
            )
          }
        })),
      removeMessage: (chatId, messageId) =>
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: (state.messagesByChatId[chatId] ?? []).filter((message) => message.id !== messageId)
          }
        })),
      clearChatMessages: (chatId) =>
        set((state) => {
          const nextMessagesByChatId = { ...state.messagesByChatId };
          delete nextMessagesByChatId[chatId];

          return {
            messagesByChatId: nextMessagesByChatId
          };
        }),
      clearAllMessages: () =>
        set({
          messagesByChatId: {},
          sendingState: "idle"
        }),
      setSendingState: (sendingState) => set({ sendingState })
    }),
    {
      name: "achat-messages",
      partialize: (state) => ({
        messagesByChatId: state.messagesByChatId
      })
    }
  )
);
