import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import type { Chat } from "@/shared/types/domain";

export function useChats() {
  const chats = useChatStore((state: ChatState) => state.chats);
  const messagesByChatId = useMessageStore((state: MessageState) => state.messagesByChatId);

  return chats.map((chat: Chat) => ({
    ...chat,
    lastMessage: (() => {
      const chatMessages = messagesByChatId[chat.id] ?? [];
      return chatMessages[chatMessages.length - 1];
    })()
  }));
}
