import { useEffect, useMemo, useState } from "react";
import { Copy, QrCode, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { QrCodeCard } from "@/shared/ui/qr-code-card";
import { Sheet } from "@/shared/ui/sheet";
import type { Chat, ChatInvite, MessageTTL } from "@/shared/types/domain";

const ttlOptions: Array<{ value: MessageTTL; label: string }> = [
  { value: "off", label: "Выключено" },
  { value: "24h", label: "24 часа" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" }
];

export function ChatSettingsSheet({ chat }: { chat: Chat }) {
  const navigate = useNavigate();
  const modalState = useUiStore((state: UiState) => state.modalState);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const invites = useChatStore((state: ChatState) => state.invites);
  const updateChatSettings = useChatStore((state: ChatState) => state.updateChatSettings);
  const deleteChat = useChatStore((state: ChatState) => state.deleteChat);
  const [title, setTitle] = useState(chat.title);
  const [memberLimit, setMemberLimit] = useState(String(chat.memberLimit ?? 3));
  const [messageTtl, setMessageTtl] = useState<MessageTTL>(chat.messageTtl);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const open = modalState === "chat-settings";
  const invite = useMemo(
    () => invites.find((item: ChatInvite) => item.chatId === chat.id),
    [chat.id, invites]
  );

  useEffect(() => {
    if (open) {
      setTitle(chat.title);
      setMemberLimit(String(chat.memberLimit ?? 3));
      setMessageTtl(chat.messageTtl);
      setConfirmDelete(false);
    }
  }, [chat, open]);

  function close() {
    setModalState(null);
  }

  async function save() {
    await updateChatSettings({
      chatId: chat.id,
      title,
      messageTtl,
      memberLimit: chat.type === "group" ? Number(memberLimit) || 1 : undefined
    });
    showToast("Настройки чата сохранены");
    close();
  }

  return (
    <>
      <Sheet open={open} onClose={close} title="Настройки чата">
        {!confirmDelete ? (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium">Название</span>
              <input
                className="field"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium">
                Автоудаление новых сообщений
              </span>
              <select
                className="field"
                value={messageTtl}
                onChange={(event) => setMessageTtl(event.target.value as MessageTTL)}
              >
                {ttlOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {chat.type === "group" && (
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-medium">Лимит участников</span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="field"
                  value={memberLimit}
                  onChange={(event) => setMemberLimit(event.target.value)}
                />
              </label>
            )}
            {invite && (
              <div className="rounded-2xl bg-[var(--color-surface-secondary)] p-3">
                <p className="text-[11px] text-[var(--color-text-secondary)]">Код приглашения</p>
                <div className="mt-1 flex items-center">
                  <span className="flex-1 text-[20px] font-bold tracking-[0.2em] text-[var(--color-accent)]">
                    {invite.accessCode}
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(invite.accessCode);
                      showToast("Код скопирован");
                    }}
                    aria-label="Копировать код"
                  >
                    <Copy aria-hidden="true" size={18} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setQrOpen(true)}
                    aria-label="Показать QR-код"
                  >
                    <QrCode aria-hidden="true" size={19} />
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              className="danger-button w-full"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 aria-hidden="true" size={18} /> Удалить чат
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="secondary-button" onClick={close}>
                Отмена
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={!title.trim()}
                onClick={save}
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-[14px] leading-6 text-[var(--color-text-secondary)]">
              Чат, локальные сообщения и приглашение будут удалены. Это действие нельзя отменить.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmDelete(false)}
              >
                Назад
              </button>
              <button
                type="button"
                className="danger-button bg-[var(--color-danger)] text-white"
                onClick={async () => {
                  await deleteChat(chat.id);
                  close();
                  navigate("/chats");
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        )}
      </Sheet>
      <Sheet
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="QR-код чата"
        description="Покажите код только приглашённому участнику."
      >
        {invite && (
          <div className="mt-4">
            <QrCodeCard value={invite.token} />
            <button
              type="button"
              className="primary-button mt-4 w-full"
              onClick={() => setQrOpen(false)}
            >
              Готово
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
