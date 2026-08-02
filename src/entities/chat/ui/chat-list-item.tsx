import { CheckCheck, FileText, Image, LockKeyhole, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import { AvatarStack } from "@/shared/ui/avatar-stack";
import { formatChatTimestamp } from "@/shared/lib/utils/date";
import { cn } from "@/shared/lib/utils/cn";
import type { Chat, Message } from "@/shared/types/domain";

interface ChatListItemProps {
  chat: Chat & { lastMessage?: Message };
  selected?: boolean;
  onSelect?: (chatId: string) => void;
}

function MessageTypeIcon({ message }: { message?: Message }) {
  if (!message) return null;
  if (message.type === "voice")
    return <Mic aria-hidden="true" size={15} className="text-[var(--color-accent)]" />;
  if (message.type === "image") return <Image aria-hidden="true" size={15} />;
  if (message.type === "file") return <FileText aria-hidden="true" size={15} />;
  if (message.senderId === "user-papa") return <CheckCheck aria-hidden="true" size={15} />;
  return null;
}

export function ChatListItem({ chat, selected = false, onSelect }: ChatListItemProps) {
  const content = (
    <>
      <AvatarStack avatars={chat.avatarGroup} names={[chat.title, chat.title]} />
      <span className="min-w-0 flex-1 py-1">
        <span className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[16px] font-semibold">{chat.title}</span>
            <LockKeyhole
              aria-label="Защищённый чат"
              size={13}
              className="shrink-0 text-[var(--color-text-muted)]"
            />
          </span>
          <span className="shrink-0 text-[11px] text-[var(--color-text-secondary)]">
            {formatChatTimestamp(chat.lastMessageAt)}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <MessageTypeIcon message={chat.lastMessage} />
          <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[var(--color-text-secondary)]">
            {(chat.lastMessage?.preview ?? chat.subtitle) || "Сообщений пока нет"}
          </span>
          {chat.unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-[11px] font-bold text-white">
              {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
            </span>
          )}
        </span>
      </span>
    </>
  );

  const className = cn(
    "flex min-h-[76px] w-full items-center gap-3 border-b border-[var(--color-divider)] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-[var(--color-surface-secondary)]",
    selected && "bg-[var(--color-accent-soft)]"
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onSelect(chat.id)}
        aria-current={selected ? "page" : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <Link to={`/chat/${chat.id}`} className={className}>
      {content}
    </Link>
  );
}
