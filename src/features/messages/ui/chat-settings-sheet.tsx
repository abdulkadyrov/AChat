import { useState } from "react";
import type { Chat } from "@/shared/types/domain";
import { useChatStore } from "@/shared/model/chat-store";
import { useUiStore } from "@/shared/model/ui-store";

interface ChatSettingsSheetProps {
  chat: Chat;
}

export function ChatSettingsSheet({ chat }: ChatSettingsSheetProps) {
  const modalState = useUiStore((state) => state.modalState);
  const setModalState = useUiStore((state) => state.setModalState);
  const updateGroupLimit = useChatStore((state) => state.updateGroupLimit);
  const [memberLimit, setMemberLimit] = useState(String(chat.memberLimit ?? 3));

  if (modalState !== "chat-settings") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">Настройки чата</h3>
        {chat.type === "group" ? (
          <>
            <p className="mt-3 text-sm text-ink-soft dark:text-slate-400">
              Создатель может ограничить количество людей, которые войдут по QR в эту группу.
            </p>
            <input
              type="number"
              min={1}
              max={50}
              value={memberLimit}
              onChange={(event) => setMemberLimit(event.target.value)}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={() => {
                updateGroupLimit(chat.id, Number(memberLimit) || 1);
                setModalState(null);
              }}
              className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
            >
              Сохранить лимит
            </button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm text-ink-soft dark:text-slate-400">
              Этот личный чат может открыть только номер телефона, который был указан при создании QR.
            </p>
            <div className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-white/5">
              {chat.targetPhone ?? "Номер не задан"}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setModalState(null)}
          className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
