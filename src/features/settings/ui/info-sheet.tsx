import { useState } from "react";
import { Check, Laptop, LockKeyhole, ShieldCheck, Smartphone } from "lucide-react";
import { useSettingsStore, type SettingsState } from "@/shared/model/settings-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Sheet } from "@/shared/ui/sheet";
import type { ThemeMode } from "@/shared/types/domain";

function SwitchRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[60px] items-center gap-3 border-b border-[var(--color-divider)] py-2 last:border-b-0">
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{label}</span>
        {description && (
          <span className="mt-0.5 block text-[11px] leading-4 text-[var(--color-text-secondary)]">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

const sheetTitles: Partial<Record<NonNullable<UiState["modalState"]>, string>> = {
  account: "Аккаунт",
  privacy: "Конфиденциальность",
  notifications: "Уведомления",
  chats: "Чаты",
  theme: "Тема",
  language: "Язык",
  security: "Сквозное шифрование",
  about: "О приложении"
};

export function InfoSheet() {
  const modalState = useUiStore((state: UiState) => state.modalState);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const theme = useUiStore((state: UiState) => state.theme);
  const setTheme = useUiStore((state: UiState) => state.setTheme);
  const showToast = useUiStore((state: UiState) => state.showToast);
  const settings = useSettingsStore();
  const setSetting = useSettingsStore((state: SettingsState) => state.setSetting);
  const [otherSessionsEnded, setOtherSessionsEnded] = useState(false);
  const open = Boolean(modalState && sheetTitles[modalState]);

  function close() {
    setModalState(null);
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      title={modalState ? (sheetTitles[modalState] ?? "Настройки") : "Настройки"}
    >
      {modalState === "account" && (
        <div className="mt-4">
          <h3 className="text-[12px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Активные устройства
          </h3>
          <div className="mt-2 rounded-2xl border border-[var(--color-border)]">
            <div className="flex min-h-16 items-center gap-3 border-b border-[var(--color-divider)] px-3">
              <Smartphone aria-hidden="true" size={21} className="text-[var(--color-accent)]" />
              <span className="flex-1">
                <span className="block font-medium">Это устройство</span>
                <span className="text-[11px] text-[var(--color-text-secondary)]">
                  Мобильный браузер · активен сейчас
                </span>
              </span>
            </div>
            {!otherSessionsEnded && (
              <div className="flex min-h-16 items-center gap-3 px-3">
                <Laptop aria-hidden="true" size={21} />
                <span className="flex-1">
                  <span className="block font-medium">Домашний компьютер</span>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    Был активен вчера
                  </span>
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={otherSessionsEnded}
            className="danger-button mt-4 w-full"
            onClick={() => {
              setOtherSessionsEnded(true);
              showToast("Другие сеансы завершены");
            }}
          >
            {otherSessionsEnded ? "Других сеансов нет" : "Завершить другие сеансы"}
          </button>
        </div>
      )}

      {modalState === "privacy" && (
        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Кто видит статус</span>
            <select
              className="field"
              value={settings.lastSeenVisibility}
              onChange={(event) =>
                setSetting(
                  "lastSeenVisibility",
                  event.target.value as SettingsState["lastSeenVisibility"]
                )
              }
            >
              <option value="family">Только семья</option>
              <option value="nobody">Никто</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium">Кто видит фото</span>
            <select
              className="field"
              value={settings.photoVisibility}
              onChange={(event) =>
                setSetting(
                  "photoVisibility",
                  event.target.value as SettingsState["photoVisibility"]
                )
              }
            >
              <option value="family">Только семья</option>
              <option value="nobody">Никто</option>
            </select>
          </label>
          <div className="rounded-2xl border border-[var(--color-border)] px-3">
            <SwitchRow
              label="Блокировка приложения"
              description="Запрашивать код устройства после перерыва"
              checked={settings.appLockEnabled}
              onChange={(value) => setSetting("appLockEnabled", value)}
            />
          </div>
          <button
            type="button"
            className="secondary-button w-full"
            onClick={() => showToast("Зашифрованная резервная копия ключей подготовлена")}
          >
            <LockKeyhole aria-hidden="true" size={18} /> Резервная копия ключей
          </button>
        </div>
      )}

      {modalState === "notifications" && (
        <div className="mt-4">
          <div className="rounded-2xl border border-[var(--color-border)] px-3">
            <SwitchRow
              label="Все уведомления"
              checked={settings.notificationsEnabled}
              onChange={(value) => setSetting("notificationsEnabled", value)}
            />
            <SwitchRow
              label="Групповые чаты"
              checked={settings.groupNotifications}
              onChange={(value) => setSetting("groupNotifications", value)}
            />
            <SwitchRow
              label="Личные сообщения"
              checked={settings.directNotifications}
              onChange={(value) => setSetting("directNotifications", value)}
            />
            <SwitchRow
              label="Звук"
              checked={settings.soundEnabled}
              onChange={(value) => setSetting("soundEnabled", value)}
            />
            <SwitchRow
              label="Вибрация"
              checked={settings.vibrationEnabled}
              onChange={(value) => setSetting("vibrationEnabled", value)}
            />
            <SwitchRow
              label="Показывать текст"
              description="По умолчанию push показывает только «Новое сообщение»"
              checked={settings.messagePreviewEnabled}
              onChange={(value) => setSetting("messagePreviewEnabled", value)}
            />
          </div>
        </div>
      )}

      {modalState === "chats" && (
        <div className="mt-4">
          <p className="text-[13px] font-medium">Размер текста</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(
              [
                ["small", "Мелкий"],
                ["normal", "Обычный"],
                ["large", "Крупный"]
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={settings.fontSize === value ? "primary-button" : "secondary-button"}
                onClick={() => setSetting("fontSize", value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-[var(--color-surface-secondary)] p-4 text-[13px] leading-5">
            Пример сообщения в выбранном размере. Интерфейс остаётся удобным при системном
            масштабировании текста.
          </div>
          <button
            type="button"
            className="secondary-button mt-4 w-full"
            onClick={() => showToast("Локальный медиакэш очищен")}
          >
            Очистить локальный медиакэш
          </button>
        </div>
      )}

      {modalState === "theme" && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          {(
            [
              ["system", "Как в системе"],
              ["light", "Светлая"],
              ["dark", "Тёмная"]
            ] as Array<[ThemeMode, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className="flex min-h-14 w-full items-center border-b border-[var(--color-divider)] px-4 text-left last:border-b-0"
              onClick={() => setTheme(value)}
            >
              <span className="flex-1">{label}</span>
              {theme === value && (
                <Check aria-hidden="true" size={19} className="text-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </div>
      )}

      {modalState === "language" && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="flex min-h-14 items-center px-4">
            <span className="flex-1">Русский</span>
            <Check aria-hidden="true" size={19} className="text-[var(--color-accent)]" />
          </div>
          <div className="flex min-h-14 items-center border-t border-[var(--color-divider)] px-4 text-[var(--color-text-muted)]">
            <span className="flex-1">English</span>
            <span className="text-[11px]">Скоро</span>
          </div>
        </div>
      )}

      {modalState === "security" && (
        <div className="mt-4 text-center">
          <ShieldCheck
            aria-hidden="true"
            size={44}
            className="mx-auto text-[var(--color-accent)]"
          />
          <h3 className="mt-3 font-semibold">Сообщения защищены</h3>
          <p className="mt-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
            Текст и вложения шифруются на устройстве. Сервер хранит шифротекст и не получает ключи
            чата.
          </p>
        </div>
      )}

      {modalState === "about" && (
        <div className="mt-4">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-xl font-bold text-white">
              A
            </div>
            <h3 className="mt-3 text-[18px] font-bold">AChat</h3>
            <p className="text-[12px] text-[var(--color-text-secondary)]">Версия 0.1.0</p>
          </div>
          <div className="mt-5 rounded-2xl border border-[var(--color-border)] p-4 text-[13px] leading-6 text-[var(--color-text-secondary)]">
            Семейный мессенджер с локальным шифрованием, офлайн-очередью и подготовкой к Supabase
            Realtime.
          </div>
        </div>
      )}

      <button type="button" className="primary-button mt-5 w-full" onClick={close}>
        Готово
      </button>
    </Sheet>
  );
}
