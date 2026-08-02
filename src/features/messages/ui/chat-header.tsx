import { ArrowLeft, LockKeyhole, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import type { Chat } from "@/shared/types/domain";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { AvatarStack } from "@/shared/ui/avatar-stack";
import { IconButton } from "@/shared/ui/icon-button";

interface ChatHeaderProps {
  chat: Chat;
  embedded?: boolean;
}

export function ChatHeader({ chat, embedded = false }: ChatHeaderProps) {
  const setModalState = useUiStore((state: UiState) => state.setModalState);

  return (
    <header className="top-bar shrink-0">
      {!embedded && (
        <Link to="/chats" className="icon-button -ml-2" aria-label="Назад к чатам">
          <ArrowLeft aria-hidden="true" size={22} />
        </Link>
      )}
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => setModalState("chat-settings")}
        aria-label={`Открыть информацию о чате ${chat.title}`}
      >
        <AvatarStack avatars={chat.avatarGroup} names={[chat.title, chat.title]} size="sm" />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[17px] font-semibold">{chat.title}</span>
            <LockKeyhole
              aria-label="Сквозное шифрование"
              size={13}
              className="text-[var(--color-text-secondary)]"
            />
          </span>
          <span className="block truncate text-[12px] text-[var(--color-text-secondary)]">
            {chat.type === "group" ? `${chat.participantIds.length + 1} участника` : "В сети"}
          </span>
        </span>
      </button>
      <IconButton onClick={() => setModalState("chat-settings")} aria-label="Настройки чата">
        <MoreVertical aria-hidden="true" size={21} />
      </IconButton>
    </header>
  );
}
