import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { Chat, ChatType } from "@/shared/types/domain";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";

interface ManageChatsSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  filter?: ChatType;
}

export function ManageChatsSheet({
  open,
  onClose,
  title = "Управление чатами",
  filter
}: ManageChatsSheetProps) {
  const chats = useChatStore((state: ChatState) => state.chats);
  const deleteChat = useChatStore((state: ChatState) => state.deleteChat);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);

  if (!open) return null;

  const visibleChats = filter ? chats.filter((chat: Chat) => chat.type === filter) : chats;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
          Удаление безвозвратное: текст, голосовые, фото и код доступа будут стёрты полностью.
        </p>

        <div className="mt-4 space-y-3">
          {visibleChats.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 px-4 py-4 text-sm text-ink-soft dark:border-white/10 dark:text-slate-400">
              Здесь пока нечего удалять.
            </div>
          ) : (
            visibleChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-white/10"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{chat.title}</p>
                  <p className="text-sm text-ink-soft dark:text-slate-400">
                    {chat.type === "group" ? "Группа" : "Личный чат"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingChatId === chat.id}
                  onClick={async () => {
                    const confirmed = window.confirm(`Удалить "${chat.title}" без возможности восстановления?`);
                    if (!confirmed) return;

                    setDeletingChatId(chat.id);
                    try {
                      await deleteChat(chat.id);
                    } finally {
                      setDeletingChatId(null);
                    }
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingChatId === chat.id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
