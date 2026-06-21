import { Check } from "lucide-react";
import { useUiStore } from "@/shared/model/ui-store";
import type { UiState } from "@/shared/model/ui-store";
import type { MessageTTL } from "@/shared/types/domain";

const ttlOptions: Array<{ value: MessageTTL; label: string }> = [
  { value: "off", label: "Выкл" },
  { value: "24h", label: "24 часа" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" }
];

export function AutoDeleteSheet() {
  const modalState = useUiStore((state: UiState) => state.modalState);
  const messageTtl = useUiStore((state: UiState) => state.messageTtl);
  const setMessageTtl = useUiStore((state: UiState) => state.setMessageTtl);
  const setModalState = useUiStore((state: UiState) => state.setModalState);

  if (modalState !== "auto-delete") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-[28px] bg-white p-4 shadow-2xl dark:bg-[#101926]">
        <div className="mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-white/10" />
        <h3 className="text-lg font-extrabold">Автоудаление сообщений</h3>
        <div className="mt-3 divide-y divide-slate-200/70 dark:divide-white/10">
          {ttlOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setMessageTtl(option.value);
                setModalState(null);
              }}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span>{option.label}</span>
              {messageTtl === option.value && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-soft dark:text-slate-400">
          Сообщения скрываются у клиента после истечения TTL и удаляются серверным cron.
        </p>
        <button
          type="button"
          onClick={() => setModalState(null)}
          className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-white"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
