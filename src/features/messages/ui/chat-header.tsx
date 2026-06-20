import { ArrowLeft, Lock, MoreVertical, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import type { Chat } from "@/shared/types/domain";
import { useUiStore } from "@/shared/model/ui-store";
import { AvatarStack } from "@/shared/ui/avatar-stack";
import { IconButton } from "@/shared/ui/icon-button";

interface ChatHeaderProps {
  chat: Chat;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const setModalState = useUiStore((state) => state.setModalState);

  return (
    <div className="mb-4 flex items-center gap-3">
      <Link
        to="/chats"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white/90 dark:border-white/10 dark:bg-white/5"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <AvatarStack avatars={chat.avatarGroup} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold tracking-[-0.03em]">{chat.title}</p>
            <p className="flex items-center gap-1 text-xs text-ink-soft dark:text-slate-400">
              <Lock className="h-3 w-3" />
              Сообщения защищены
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton onClick={() => setModalState("chat-settings")}>
          <Phone className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={() => setModalState("chat-settings")}>
          <MoreVertical className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
