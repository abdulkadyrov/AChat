import { useRef } from "react";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock3,
  MoreHorizontal,
  Reply,
  RotateCcw
} from "lucide-react";
import { FileMessageBubble } from "@/entities/message/ui/file-message-bubble";
import { ImageMessageBubble } from "@/entities/message/ui/image-message-bubble";
import { VoiceMessageBubble } from "@/entities/message/ui/voice-message-bubble";
import { getUserById } from "@/entities/user/model/selectors";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { formatTime } from "@/shared/lib/utils/date";
import { cn } from "@/shared/lib/utils/cn";
import type { Message } from "@/shared/types/domain";

interface MessageBubbleProps {
  message: Message;
  replyPreview?: string | null;
  onOpenActions?: (message: Message, anchor?: { x: number; y: number }) => void;
  onReplyClick?: (messageId: string) => void;
  onRetry?: (message: Message) => void;
  highlighted?: boolean;
}

function DeliveryStatus({ message }: { message: Message }) {
  if (message.status === "failed")
    return (
      <AlertCircle aria-label="Ошибка отправки" size={14} className="text-[var(--color-danger)]" />
    );
  if (
    message.status === "queued" ||
    message.status === "sending" ||
    message.status === "encrypting" ||
    message.status === "uploading"
  ) {
    return <Clock3 aria-label="Отправляется" size={13} />;
  }
  if (message.status === "read")
    return <CheckCheck aria-label="Прочитано" size={15} className="text-[var(--color-accent)]" />;
  if (message.status === "delivered") return <CheckCheck aria-label="Доставлено" size={15} />;
  return <Check aria-label="Отправлено" size={14} />;
}

export function MessageBubble({
  message,
  replyPreview,
  onOpenActions,
  onReplyClick,
  onRetry,
  highlighted = false
}: MessageBubbleProps) {
  const currentUser = useAuthStore((state: AuthState) => state.user);
  const sender = getUserById(message.senderId, currentUser);
  const isMine = message.senderId === currentUser?.id;
  const longPressTimer = useRef<number | null>(null);

  if (message.type === "system") {
    return (
      <div className="my-2 flex justify-center px-4" id={`message-${message.id}`}>
        <p className="max-w-[90%] rounded-full bg-[var(--color-surface-secondary)] px-3 py-1.5 text-center text-[12px] text-[var(--color-text-secondary)]">
          {message.preview}
        </p>
      </div>
    );
  }

  function openActions(anchor?: { x: number; y: number }) {
    navigator.vibrate?.(10);
    onOpenActions?.(message, anchor);
  }

  function clearLongPress() {
    if (longPressTimer.current !== null) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "group flex px-3 transition-colors duration-150",
        isMine ? "justify-end" : "justify-start",
        highlighted && "bg-[var(--color-accent-soft)]"
      )}
    >
      <div
        tabIndex={0}
        onContextMenu={(event) => {
          event.preventDefault();
          openActions({ x: event.clientX, y: event.clientY });
        }}
        onKeyDown={(event) => {
          if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
            event.preventDefault();
            openActions();
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && event.button !== 0) return;
          clearLongPress();
          longPressTimer.current = window.setTimeout(() => openActions(), 450);
        }}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerLeave={clearLongPress}
        className={cn(
          "relative max-w-[76%] rounded-2xl px-3 py-2.5 text-[15px] shadow-sm outline-none md:max-w-[65%] lg:max-w-[60%]",
          isMine
            ? "rounded-br-[5px] bg-[var(--color-message-outgoing)] text-[var(--color-text-primary)]"
            : "rounded-bl-[5px] bg-[var(--color-message-incoming)] text-[var(--color-text-primary)]"
        )}
      >
        <button
          type="button"
          onClick={() => openActions()}
          className="icon-button absolute -right-3 -top-3 z-10 h-8 w-8 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
          aria-label="Действия с сообщением"
        >
          <MoreHorizontal aria-hidden="true" size={16} />
        </button>
        {!isMine && (
          <p className="mb-1 text-[12px] font-semibold text-[var(--color-accent)]">
            {sender?.name ?? "Участник"}
          </p>
        )}
        {message.replyTo && replyPreview && (
          <button
            type="button"
            onClick={() => onReplyClick?.(message.replyTo!)}
            className="mb-2 block w-full rounded-lg border-l-[3px] border-[var(--color-accent)] bg-black/5 px-2.5 py-2 text-left dark:bg-white/5"
          >
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent)]">
              <Reply aria-hidden="true" size={12} /> Ответ
            </span>
            <span className="mt-0.5 block max-w-[220px] truncate text-[12px] opacity-75">
              {replyPreview}
            </span>
          </button>
        )}
        {message.status === "deleted" ? (
          <p className="italic text-[var(--color-text-secondary)]">Сообщение удалено</p>
        ) : (
          <>
            {message.type === "text" && (
              <p className="whitespace-pre-wrap break-words leading-[1.42]">{message.preview}</p>
            )}
            {message.type === "voice" && <VoiceMessageBubble message={message} />}
            {message.type === "image" && <ImageMessageBubble message={message} />}
            {message.type === "file" && <FileMessageBubble message={message} />}
          </>
        )}
        <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-[var(--color-text-secondary)]">
          {message.editedAt && <span>изменено</span>}
          <span>{formatTime(message.createdAt)}</span>
          {isMine && <DeliveryStatus message={message} />}
        </div>
        {message.status === "failed" && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="mt-1 flex min-h-8 items-center gap-1 text-[12px] font-semibold text-[var(--color-danger)]"
          >
            <RotateCcw aria-hidden="true" size={14} /> Повторить
          </button>
        )}
      </div>
    </div>
  );
}
