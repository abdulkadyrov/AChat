import { create } from "zustand";
import type { Message } from "@/shared/types/domain";

export interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  sendingState: "idle" | "sending" | "error";
  setMessages: (chatId: string, messages: Message[]) => void;
  enqueueMessage: (message: Message) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  updateMessage: (chatId: string, messageId: string, patch: Partial<Message>) => void;
  clearChatMessages: (chatId: string) => void;
  clearAllMessages: () => void;
  setSendingState: (state: MessageState["sendingState"]) => void;
}

export const useMessageStore = create<MessageState>()((set) => ({
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
        [chatId]: (state.messagesByChatId[chatId] ?? []).filter(
          (message) => message.id !== messageId
        )
      }
    })),
  updateMessage: (chatId, messageId, patch) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: (state.messagesByChatId[chatId] ?? []).map((message) =>
          message.id === messageId ? { ...message, ...patch } : message
        )
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
}));
