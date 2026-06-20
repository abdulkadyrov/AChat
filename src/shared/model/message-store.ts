import { create } from "zustand";
import type { Message } from "@/shared/types/domain";
import { demoMessages } from "@/shared/mocks/demo-data";

interface MessageState {
  messagesByChatId: Record<string, Message[]>;
  sendingState: "idle" | "sending" | "error";
  enqueueMessage: (message: Message) => void;
  setSendingState: (state: MessageState["sendingState"]) => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messagesByChatId: demoMessages,
  sendingState: "idle",
  enqueueMessage: (message) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [message.chatId]: [...(state.messagesByChatId[message.chatId] ?? []), message]
      }
    })),
  setSendingState: (sendingState) => set({ sendingState })
}));
