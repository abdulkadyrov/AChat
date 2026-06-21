import { Copy, Reply, Trash2 } from "lucide-react";
import { deleteRemoteMessage } from "@/shared/lib/supabase/messaging";
import { useMessageStore } from "@/shared/model/message-store";
import { useUiStore } from "@/shared/model/ui-store";
import type { Message } from "@/shared/types/domain";

interface MessageActionSheetProps {
  message: Message | null;
  open: boolean;
  onClose: () => void;
}

export function MessageActionSheet({ message, open, onClose }: MessageActionSheetProps) {
  const setReplyTo = useUiStore((state) => state.setReplyTo);
  const removeMessage = useMessageStore((state) => state.removeMessage);

  if (!open || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="space-y-2">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(message.preview ?? "");
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Copy className="h-4 w-4" />
            Копировать
          </button>
          <button
            type="button"
            onClick={() => {
              setReplyTo(message.id);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Reply className="h-4 w-4" />
            Ответить
          </button>
          <button
            type="button"
            onClick={async () => {
              await deleteRemoteMessage(message.id).catch(() => undefined);
              removeMessage(message.chatId, message.id);
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
            Удалить
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
