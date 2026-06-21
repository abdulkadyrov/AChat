import { Link } from "react-router-dom";
import type { Chat, Message } from "@/shared/types/domain";
import { AvatarStack } from "@/shared/ui/avatar-stack";
import { SectionCard } from "@/shared/ui/section-card";
import { formatTime } from "@/shared/lib/utils/date";
import { cn } from "@/shared/lib/utils/cn";

interface ChatListProps {
  chats: Array<Chat & { lastMessage?: Message }>;
}

export function ChatList({ chats }: ChatListProps) {
  return (
    <SectionCard className="overflow-hidden p-0">
      <div className="divide-y divide-slate-200/70 dark:divide-white/10">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50/80 dark:hover:bg-white/5"
          >
            <AvatarStack avatars={chat.avatarGroup} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate text-base font-extrabold tracking-[-0.03em]">
                  {chat.title}
                </p>
                <span className="shrink-0 text-xs text-ink-soft dark:text-slate-400">
                  {formatTime(chat.lastMessageAt)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="truncate text-sm text-ink-soft dark:text-slate-400">
                  {chat.lastMessage?.preview ?? chat.subtitle}
                </p>
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    chat.unreadCount > 0
                      ? "bg-accent text-white"
                      : "bg-transparent text-transparent"
                  )}
                >
                  {chat.unreadCount}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
