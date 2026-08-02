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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-overlay)] p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-2xl">
        <div className="mb-3 h-1 w-10 rounded-full bg-[var(--color-border)]" />
        <h3 className="text-lg font-extrabold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Удаление безвозвратное: текст, голосовые, фото и код доступа будут стёрты полностью.
        </p>

        <div className="mt-4 space-y-3">
          {visibleChats.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] px-4 py-4 text-sm text-[var(--color-text-secondary)]">
              Здесь пока нечего удалять.
            </div>
          ) : (
            visibleChats.map((chat: Chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold">{chat.title}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {chat.type === "group" ? "Группа" : "Личный чат"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={deletingChatId === chat.id}
                  onClick={async () => {
                    const confirmed = window.confirm(
                      `Удалить "${chat.title}" без возможности восстановления?`
                    );
                    if (!confirmed) return;

                    setDeletingChatId(chat.id);
                    try {
                      await deleteChat(chat.id);
                    } finally {
                      setDeletingChatId(null);
                    }
                  }}
                  className="danger-button bg-[var(--color-danger)] text-white"
                >
                  <Trash2 className="h-4 w-4" />
                  {deletingChatId === chat.id ? "Удаляем..." : "Удалить"}
                </button>
              </div>
            ))
          )}
        </div>

        <button type="button" onClick={onClose} className="secondary-button mt-5 w-full">
          Закрыть
        </button>
      </div>
    </div>
  );
}
