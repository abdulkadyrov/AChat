import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/shared/types/domain";

interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  sendingState: "idle" | "sending" | "error";
  enqueueMessage: (message: Message) => void;
  setSendingState: (state: MessageState["sendingState"]) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      messagesByChatId: {},
      sendingState: "idle",
      enqueueMessage: (message) =>
        set((state) => ({
          messagesByChatId: {
            ...state.messagesByChatId,
            [message.chatId]: [...(state.messagesByChatId[message.chatId] ?? []), message]
          }
        })),
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
