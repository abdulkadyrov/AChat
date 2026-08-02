import { useState } from "react";
import { Check, Clock3 } from "lucide-react";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Sheet } from "@/shared/ui/sheet";
import type { Chat, MessageTTL } from "@/shared/types/domain";

const ttlOptions: Array<{ value: Exclude<MessageTTL, "off">; label: string; description: string }> =
  [
    { value: "24h", label: "24 часа", description: "Для коротких договорённостей" },
    { value: "7d", label: "7 дней", description: "Рекомендуется для семейного чата" },
    { value: "30d", label: "30 дней", description: "Сохранить историю на месяц" },
    { value: "90d", label: "90 дней", description: "Долгое хранение" }
  ];

export function AutoDeleteSheet() {
  const modalState = useUiStore((state: UiState) => state.modalState);
  const messageTtl = useUiStore((state: UiState) => state.messageTtl);
  const setMessageTtl = useUiStore((state: UiState) => state.setMessageTtl);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const chats = useChatStore((state: ChatState) => state.chats);
  const updateChatSettings = useChatStore((state: ChatState) => state.updateChatSettings);
  const enqueueMessage = useMessageStore((state: MessageState) => state.enqueueMessage);
  const user = useAuthStore((state: AuthState) => state.user);
  const [pending, setPending] = useState<MessageTTL | null>(null);
  const open = modalState === "auto-delete";
  const current = pending ?? messageTtl;
  const enabled = current !== "off";

  function close() {
    setPending(null);
    setModalState(null);
  }

  async function apply() {
    const next = pending ?? messageTtl;
    const chat = chats.find((item: Chat) => item.type === "group") ?? chats[0];
    if (chat) {
      await updateChatSettings({
        chatId: chat.id,
        title: chat.title,
        messageTtl: next,
        memberLimit: chat.memberLimit ?? undefined
      });
      enqueueMessage({
        id: crypto.randomUUID(),
        chatId: chat.id,
        senderId: user?.id ?? "system",
        ciphertext: "",
        iv: "",
        type: "system",
        createdAt: new Date().toISOString(),
        expiresAt: null,
        replyTo: null,
        preview:
          next === "off"
            ? `${user?.name ?? "Владелец"} выключил(а) автоудаление`
            : `${user?.name ?? "Владелец"} включил(а) автоудаление: ${ttlOptions.find((option) => option.value === next)?.label}`,
        status: "sent"
      });
    }
    setMessageTtl(next);
    showToast("Настройка автоудаления сохранена");
    close();
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title="Автоудаление сообщений"
      description="Настройка применяется только к новым сообщениям. Старые сообщения не удаляются задним числом."
    >
      <div className="mt-4 flex min-h-14 items-center gap-3 rounded-2xl bg-[var(--color-surface-secondary)] px-3">
        <Clock3 aria-hidden="true" size={20} className="text-[var(--color-accent)]" />
        <span className="flex-1 font-medium">Включить автоудаление</span>
        <button
          type="button"
          role="switch"
          aria-label="Включить автоудаление"
          aria-checked={enabled}
          onClick={() => setPending(enabled ? "off" : messageTtl === "off" ? "7d" : messageTtl)}
          className={`relative h-7 w-12 rounded-full transition-colors ${enabled ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-1"}`}
          />
        </button>
      </div>
      <fieldset
        className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)]"
        disabled={!enabled}
      >
        <legend className="visually-hidden">Период автоудаления</legend>
        {ttlOptions.map((option) => (
          <label
            key={option.value}
            className="flex min-h-[64px] cursor-pointer items-center gap-3 border-b border-[var(--color-divider)] px-4 last:border-b-0 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--color-focus)]"
          >
            <input
              type="radio"
              name="ttl"
              value={option.value}
              checked={current === option.value}
              onChange={() => setPending(option.value)}
              className="visually-hidden"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{option.label}</span>
              <span className="mt-0.5 block text-[11px] text-[var(--color-text-secondary)]">
                {option.description}
              </span>
            </span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${current === option.value ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white" : "border-[var(--color-border)]"}`}
            >
              {current === option.value && <Check aria-hidden="true" size={15} />}
            </span>
          </label>
        ))}
      </fieldset>
      <div className="mt-4 rounded-2xl bg-[var(--color-surface-secondary)] p-3 text-[12px] leading-5 text-[var(--color-text-secondary)]">
        Новые сообщения будут автоматически удаляться у всех участников через выбранный период.
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button type="button" className="secondary-button" onClick={close}>
          Отмена
        </button>
        <button type="button" className="primary-button" onClick={apply}>
          Применить
        </button>
      </div>
    </Sheet>
  );
}
