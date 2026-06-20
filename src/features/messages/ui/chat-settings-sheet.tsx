import { useEffect, useMemo, useState } from "react";
import type { Chat, MessageTTL } from "@/shared/types/domain";
import { useChatStore } from "@/shared/model/chat-store";
import { useUiStore } from "@/shared/model/ui-store";
import { QrCodeCard } from "@/shared/ui/qr-code-card";

const ttlOptions: Array<{ value: MessageTTL; label: string }> = [
  { value: "off", label: "Выкл" },
  { value: "24h", label: "24 часа" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" }
];

interface ChatSettingsSheetProps {
  chat: Chat;
}

export function ChatSettingsSheet({ chat }: ChatSettingsSheetProps) {
  const modalState = useUiStore((state) => state.modalState);
  const setModalState = useUiStore((state) => state.setModalState);
  const invites = useChatStore((state) => state.invites);
  const updateChatSettings = useChatStore((state) => state.updateChatSettings);
  const [title, setTitle] = useState(chat.title);
  const [memberLimit, setMemberLimit] = useState(String(chat.memberLimit ?? 3));
  const [messageTtl, setMessageTtl] = useState<MessageTTL>(chat.messageTtl);

  useEffect(() => {
    if (modalState === "chat-settings") {
      setTitle(chat.title);
      setMemberLimit(String(chat.memberLimit ?? 3));
      setMessageTtl(chat.messageTtl);
    }
  }, [chat, modalState]);

  const invite = useMemo(
    () => invites.find((item) => item.chatId === chat.id),
    [chat.id, invites]
  );

  if (modalState !== "chat-settings") return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">Настройки чата</h3>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold">Название</p>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Автоудаление сообщений</p>
            <div className="grid grid-cols-2 gap-2">
              {ttlOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMessageTtl(option.value)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    messageTtl === option.value
                      ? "bg-accent text-white"
                      : "border border-slate-200 dark:border-white/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {chat.type === "group" ? (
            <div>
              <p className="mb-2 text-sm font-semibold">Лимит участников по QR</p>
              <input
                type="number"
                min={1}
                max={50}
                value={memberLimit}
                onChange={(event) => setMemberLimit(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-accent dark:border-white/10 dark:bg-white/5"
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm dark:bg-white/5">
              Этот личный чат может открыть только номер: {chat.targetPhone ?? "не задан"}
            </div>
          )}

          {invite && (
            <div>
              <p className="mb-2 text-sm font-semibold">QR-код приглашения</p>
              <QrCodeCard value={invite.token} />
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setModalState(null)}
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold dark:border-white/10"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              updateChatSettings({
                chatId: chat.id,
                title,
                messageTtl,
                memberLimit: chat.type === "group" ? Number(memberLimit) || 1 : undefined
              });
              setModalState(null);
            }}
            className="flex-1 rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
