import { useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  Info,
  Languages,
  LogOut,
  MessageCircle,
  MoonStar,
  Shield,
  Smartphone,
  Timer,
  Trash2,
  type LucideIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteOfflineDb } from "@/shared/lib/offline/db";
import { signOutSupabase } from "@/shared/lib/supabase/messaging";
import { isSupabaseConfigured } from "@/shared/config/env";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useMessageStore, type MessageState } from "@/shared/model/message-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Sheet } from "@/shared/ui/sheet";

interface SettingsRowProps {
  label: string;
  value?: string;
  icon: LucideIcon;
  onClick: () => void;
}

function SettingsRow({ label, value, icon: Icon, onClick }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[58px] w-full items-center gap-3 border-b border-[var(--color-divider)] px-3 text-left last:border-b-0 hover:bg-[var(--color-surface-secondary)]"
    >
      <Icon aria-hidden="true" size={20} />
      <span className="min-w-0 flex-1 font-medium">{label}</span>
      {value && (
        <span className="max-w-[38%] truncate text-[12px] text-[var(--color-text-secondary)]">
          {value}
        </span>
      )}
      <ChevronRight aria-hidden="true" size={17} className="text-[var(--color-text-muted)]" />
    </button>
  );
}

export function SettingsList() {
  const navigate = useNavigate();
  const signOut = useAuthStore((state: AuthState) => state.signOut);
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);
  const clearAllChats = useChatStore((state: ChatState) => state.clearAllChats);
  const clearAllMessages = useMessageStore((state: MessageState) => state.clearAllMessages);
  const setModalState = useUiStore((state: UiState) => state.setModalState);
  const theme = useUiStore((state: UiState) => state.theme);
  const messageTtl = useUiStore((state: UiState) => state.messageTtl);
  const resetUi = useUiStore((state: UiState) => state.resetUi);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const themeLabel = theme === "system" ? "Как в системе" : theme === "dark" ? "Тёмная" : "Светлая";
  const ttlLabel =
    messageTtl === "off"
      ? "Выключено"
      : messageTtl === "24h"
        ? "24 часа"
        : messageTtl === "7d"
          ? "7 дней"
          : messageTtl === "30d"
            ? "30 дней"
            : "90 дней";

  async function handleSignOut() {
    if (isSupabaseConfigured) await signOutSupabase().catch(() => undefined);
    signOut();
    navigate("/chats");
  }

  async function eraseLocalData() {
    if (isSupabaseConfigured) await signOutSupabase().catch(() => undefined);
    await deleteOfflineDb().catch(() => undefined);
    clearAllMessages();
    clearAllChats();
    clearAuth();
    resetUi();
    localStorage.removeItem("achat-auth");
    localStorage.removeItem("achat-ui");
    localStorage.removeItem("achat-chats");
    localStorage.removeItem("achat-settings");
    setDeleteOpen(false);
    navigate("/settings");
  }

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <SettingsRow
            icon={CircleUserRound}
            label="Профиль"
            onClick={() => setModalState("profile")}
          />
          <SettingsRow icon={Smartphone} label="Аккаунт" onClick={() => setModalState("account")} />
          <SettingsRow
            icon={Shield}
            label="Конфиденциальность"
            onClick={() => setModalState("privacy")}
          />
        </div>
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <SettingsRow
            icon={Bell}
            label="Уведомления"
            onClick={() => setModalState("notifications")}
          />
          <SettingsRow icon={MessageCircle} label="Чаты" onClick={() => setModalState("chats")} />
          <SettingsRow
            icon={Timer}
            label="Автоудаление"
            value={ttlLabel}
            onClick={() => setModalState("auto-delete")}
          />
          <SettingsRow
            icon={MoonStar}
            label="Тема"
            value={themeLabel}
            onClick={() => setModalState("theme")}
          />
          <SettingsRow
            icon={Languages}
            label="Язык"
            value="Русский"
            onClick={() => setModalState("language")}
          />
          <SettingsRow icon={Info} label="О приложении" onClick={() => setModalState("about")} />
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="danger-button min-h-[56px] w-full justify-start border border-[var(--color-border)] bg-[var(--color-surface)]"
        >
          <LogOut aria-hidden="true" size={20} /> Выйти из аккаунта
        </button>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="flex min-h-11 w-full items-center justify-center gap-2 text-[12px] font-medium text-[var(--color-danger)]"
        >
          <Trash2 aria-hidden="true" size={16} /> Стереть локальные данные
        </button>
      </div>
      <Sheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Стереть данные?"
        description="Профиль, локальные чаты, сообщения и ключи будут удалены с этого устройства без возможности восстановления."
      >
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className="secondary-button" onClick={() => setDeleteOpen(false)}>
            Отмена
          </button>
          <button
            type="button"
            className="danger-button bg-[var(--color-danger)] text-white"
            onClick={eraseLocalData}
          >
            Стереть
          </button>
        </div>
      </Sheet>
    </>
  );
}
