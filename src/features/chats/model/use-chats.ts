import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";

export function useChats() {
  const chats = useChatStore((state) => state.chats);
  const messagesByChatId = useMessageStore((state) => state.messagesByChatId);

  return chats.map((chat) => ({
    ...chat,
    lastMessage: messagesByChatId[chat.id]?.at(-1)
  }));
}
