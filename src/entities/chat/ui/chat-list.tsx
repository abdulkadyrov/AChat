import { ChatListItem } from "@/entities/chat/ui/chat-list-item";
import type { Chat, Message } from "@/shared/types/domain";

interface ChatListProps {
  chats: Array<Chat & { lastMessage?: Message }>;
  selectedId?: string;
  onSelect?: (chatId: string) => void;
}

export function ChatList({ chats, selectedId, onSelect }: ChatListProps) {
  return (
    <div className="overflow-hidden bg-[var(--color-surface)]" aria-label="Список чатов">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          selected={chat.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
