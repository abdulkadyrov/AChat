import { create } from "zustand";
import type { Chat } from "@/shared/types/domain";
import { demoChats } from "@/shared/mocks/demo-data";

interface ChatState {
  chats: Chat[];
  currentChatId: string;
  setCurrentChatId: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: demoChats,
  currentChatId: demoChats[0]?.id ?? "",
  setCurrentChatId: (chatId) => set({ currentChatId: chatId })
}));
