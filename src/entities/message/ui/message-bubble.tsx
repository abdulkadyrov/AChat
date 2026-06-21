import { CheckCheck, Download, Play, Reply } from "lucide-react";
import { getUserById } from "@/entities/user/model/selectors";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { formatTime } from "@/shared/lib/utils/date";
import { cn } from "@/shared/lib/utils/cn";
import type { Message } from "@/shared/types/domain";

interface MessageBubbleProps {
  message: Message;
  replyPreview?: string | null;
  onOpenActions?: (message: Message) => void;
}

export function MessageBubble({ message, replyPreview, onOpenActions }: MessageBubbleProps) {
  const currentUser = useAuthStore((state: AuthState) => state.user);
  const currentUserId = currentUser?.id;
  const sender = getUserById(message.senderId, currentUser);
  const isMine = message.senderId === currentUserId;

  return (
    <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
      <div
        onContextMenu={(event) => {
          event.preventDefault();
          onOpenActions?.(message);
        }}
        onPointerDown={(event) => {
          const timer = window.setTimeout(() => onOpenActions?.(message), 450);
          const clear = () => window.clearTimeout(timer);
          event.currentTarget.addEventListener("pointerup", clear, { once: true });
          event.currentTarget.addEventListener("pointerleave", clear, { once: true });
        }}
        className={cn(
          "max-w-[82%] rounded-bubble px-4 py-3 shadow-sm",
          isMine
            ? "bg-bubble-mine text-ink dark:bg-bubble-mineDark dark:text-ink-inverse"
            : "bg-bubble-theirs dark:bg-bubble-theirsDark"
        )}
      >
        {!isMine && (
          <p className="mb-1 text-xs font-bold text-rose-500">{sender?.name ?? "Участник"}</p>
        )}
        {replyPreview && (
          <div className="mb-2 rounded-2xl bg-black/5 px-3 py-2 text-xs dark:bg-white/5">
            <div className="mb-1 flex items-center gap-1 font-semibold">
              <Reply className="h-3 w-3" />
              Ответ
            </div>
            <p className="truncate opacity-75">{replyPreview}</p>
          </div>
        )}
        {message.type === "voice" && (
          <div className="flex items-center gap-3">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow dark:bg-white/10 dark:text-white"
              onClick={() => {
                if (!message.mediaDataUrl) return;
                const audio = new Audio(message.mediaDataUrl);
                audio.play().catch(() => undefined);
              }}
            >
              <Play className="h-4 w-4 fill-current" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-slate-400/80"
                    style={{ height: `${8 + ((index * 7) % 12)}px` }}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs opacity-75">0:0{message.durationSec ?? 8}</p>
            </div>
          </div>
        )}
        {message.type === "image" && (
          <div className="overflow-hidden rounded-[14px]">
            {message.mediaDataUrl ? (
              <>
                <img
                  src={message.mediaDataUrl}
                  alt="Shared media"
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = message.mediaDataUrl!;
                    link.download = "achat-image";
                    link.click();
                  }}
                  className="mt-2 flex items-center gap-1 text-xs font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  Сохранить
                </button>
              </>
            ) : (
              <div className="flex h-36 items-center justify-center bg-slate-100 text-sm dark:bg-white/5">
                Фото загружается
              </div>
            )}
          </div>
        )}
        {message.type === "text" && <p className="whitespace-pre-wrap text-[15px]">{message.preview}</p>}
        <div className="mt-2 flex items-center justify-end gap-1 text-[11px] opacity-65">
          <span>{formatTime(message.createdAt)}</span>
          {isMine && message.status === "read" && <CheckCheck className="h-3.5 w-3.5" />}
        </div>
      </div>
    </div>
  );
}
