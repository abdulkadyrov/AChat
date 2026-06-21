import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSettingsSections } from "@/features/settings/model/use-settings-sections";
import { deleteOfflineDb } from "@/shared/lib/offline/db";
import { signOutSupabase } from "@/shared/lib/supabase/messaging";
import { useAuthStore } from "@/shared/model/auth-store";
import { useChatStore } from "@/shared/model/chat-store";
import { useMessageStore } from "@/shared/model/message-store";
import { useUiStore } from "@/shared/model/ui-store";
import { SectionCard } from "@/shared/ui/section-card";

export function SettingsList() {
  const items = useSettingsSections();
  const navigate = useNavigate();
  const signOut = useAuthStore((state) => state.signOut);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearAllChats = useChatStore((state) => state.clearAllChats);
  const clearAllMessages = useMessageStore((state) => state.clearAllMessages);
  const setModalState = useUiStore((state) => state.setModalState);
  const setTheme = useUiStore((state) => state.setTheme);
  const resetUi = useUiStore((state) => state.resetUi);
  const theme = useUiStore((state) => state.theme);

  function handleItemClick(label: string) {
    if (label === "Профиль") setModalState("profile");
    if (label === "Семья") navigate("/family");
    if (label === "Уведомления") setModalState("notifications");
    if (label === "Автоудаление сообщений") setModalState("auto-delete");
    if (label === "Тема") setTheme(theme === "light" ? "dark" : "light");
    if (label === "Безопасность") setModalState("security");
    if (label === "О приложении") setModalState("about");
  }

  return (
    <SectionCard className="overflow-hidden p-0">
      <div className="divide-y divide-slate-200/70 dark:divide-white/10">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleItemClick(item.label)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-slate-50/80 dark:hover:bg-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 dark:border-white/10">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{item.label}</p>
              </div>
              {item.value && (
                <span className="text-sm text-ink-soft dark:text-slate-400">{item.value}</span>
              )}
              <ChevronRight className="h-4 w-4 text-ink-soft dark:text-slate-500" />
            </button>
          );
        })}
        <button
          type="button"
          onClick={async () => {
            await signOutSupabase();
            signOut();
            navigate("/chats");
          }}
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Выйти из аккаунта
        </button>
        <button
          type="button"
          onClick={async () => {
            const confirmed = window.confirm("Стереть все данные приложения без возможности восстановления?");
            if (!confirmed) return;

            await signOutSupabase().catch(() => undefined);
            await deleteOfflineDb().catch(() => undefined);
            clearAllMessages();
            clearAllChats();
            clearAuth();
            resetUi();
            localStorage.removeItem("achat-auth");
            localStorage.removeItem("achat-ui");
            localStorage.removeItem("achat-chats");
            localStorage.removeItem("achat-messages");
            navigate("/settings");
          }}
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Полностью стереть данные
        </button>
      </div>
    </SectionCard>
  );
}
