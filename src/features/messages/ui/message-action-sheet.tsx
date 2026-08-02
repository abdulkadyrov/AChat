import { useState } from "react";
import { ArrowLeft, Copy, Forward, Reply, Trash2 } from "lucide-react";
import { deleteRemoteMessage } from "@/shared/lib/supabase/messaging";
import { getMessageActions, type MessageAction } from "@/shared/lib/messages/actions";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Sheet } from "@/shared/ui/sheet";
import type { Chat, Message } from "@/shared/types/domain";

interface MessageActionSheetProps {
  message: Message | null;
  open: boolean;
  onClose: () => void;
}

const labels: Record<MessageAction, string> = {
  copy: "Копировать",
  reply: "Ответить",
  forward: "Переслать",
  "delete-for-me": "Удалить у меня",
  "delete-for-everyone": "Удалить у всех"
};

function ActionIcon({ action }: { action: MessageAction }) {
  if (action === "copy") return <Copy aria-hidden="true" size={20} />;
  if (action === "reply") return <Reply aria-hidden="true" size={20} />;
  if (action === "forward") return <Forward aria-hidden="true" size={20} />;
  return <Trash2 aria-hidden="true" size={20} />;
}

export function MessageActionSheet({ message, open, onClose }: MessageActionSheetProps) {
  const user = useAuthStore((state: AuthState) => state.user);
  const chats = useChatStore((state: ChatState) => state.chats);
  const removeMessage = useMessageStore((state: MessageState) => state.removeMessage);
  const updateMessage = useMessageStore((state: MessageState) => state.updateMessage);
  const enqueueMessage = useMessageStore((state: MessageState) => state.enqueueMessage);
  const setReplyTo = useUiStore((state: UiState) => state.setReplyTo);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const [mode, setMode] = useState<"actions" | "forward" | "confirm-delete">("actions");

  if (!message) return null;
  const currentMessage: Message = message;
  const actions = getMessageActions(currentMessage, user?.id);

  function close() {
    setMode("actions");
    onClose();
  }

  async function handleAction(action: MessageAction) {
    if (action === "copy") {
      try {
        await navigator.clipboard.writeText(currentMessage.preview ?? "");
        showToast("Скопировано");
      } catch {
        showToast("Не удалось скопировать");
      }
      close();
    }
    if (action === "reply") {
      setReplyTo(currentMessage.id);
      close();
    }
    if (action === "forward") setMode("forward");
    if (action === "delete-for-me") {
      removeMessage(currentMessage.chatId, currentMessage.id);
      showToast("Сообщение удалено у вас");
      close();
    }
    if (action === "delete-for-everyone") setMode("confirm-delete");
  }

  function forwardTo(chat: Chat) {
    enqueueMessage({
      ...currentMessage,
      id: crypto.randomUUID(),
      chatId: chat.id,
      senderId: user?.id ?? currentMessage.senderId,
      createdAt: new Date().toISOString(),
      replyTo: null,
      status: "sent"
    });
    showToast(`Переслано в «${chat.title}»`);
    close();
  }

  async function deleteForEveryone() {
    await deleteRemoteMessage(currentMessage.id).catch(() => undefined);
    updateMessage(currentMessage.chatId, currentMessage.id, {
      status: "deleted",
      preview: "Сообщение удалено",
      mediaDataUrl: undefined,
      mediaPath: undefined
    });
    showToast("Сообщение удалено у всех");
    close();
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={
        mode === "actions"
          ? "Действия с сообщением"
          : mode === "forward"
            ? "Переслать в…"
            : "Удалить у всех?"
      }
    >
      {mode === "actions" && (
        <div className="mt-3 divide-y divide-[var(--color-divider)]">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleAction(action)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-[var(--color-surface-secondary)] ${action === "delete-for-everyone" ? "text-[var(--color-danger)]" : ""}`}
            >
              <ActionIcon action={action} />
              <span className="font-medium">{labels[action]}</span>
            </button>
          ))}
        </div>
      )}
      {mode === "forward" && (
        <div className="mt-3">
          <button
            type="button"
            className="mb-2 flex min-h-11 items-center gap-2 text-[13px] text-[var(--color-text-secondary)]"
            onClick={() => setMode("actions")}
          >
            <ArrowLeft aria-hidden="true" size={18} /> Назад
          </button>
          <div className="max-h-[48dvh] overflow-y-auto rounded-2xl border border-[var(--color-border)]">
            {chats
              .filter((chat: Chat) => chat.id !== currentMessage.chatId)
              .map((chat: Chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => forwardTo(chat)}
                  className="flex min-h-14 w-full items-center border-b border-[var(--color-divider)] px-4 text-left last:border-b-0 hover:bg-[var(--color-surface-secondary)]"
                >
                  <span className="font-medium">{chat.title}</span>
                </button>
              ))}
          </div>
        </div>
      )}
      {mode === "confirm-delete" && (
        <div className="mt-4">
          <p className="text-[14px] leading-6 text-[var(--color-text-secondary)]">
            Это необратимое действие. Сообщение станет недоступно всем участникам чата.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" className="secondary-button" onClick={() => setMode("actions")}>
              Отмена
            </button>
            <button
              type="button"
              className="danger-button bg-[var(--color-danger)] text-white"
              onClick={deleteForEveryone}
            >
              Удалить
            </button>
          </div>
        </div>
      )}
      {mode === "actions" && (
        <button type="button" className="secondary-button mt-3 w-full" onClick={close}>
          Отмена
        </button>
      )}
    </Sheet>
  );
}
