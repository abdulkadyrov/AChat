import { ChevronRight } from "lucide-react";
import { AutoDeleteSheet } from "@/features/settings/ui/auto-delete-sheet";
import { InfoSheet } from "@/features/settings/ui/info-sheet";
import { ProfileSheet } from "@/features/settings/ui/profile-sheet";
import { SettingsList } from "@/features/settings/ui/settings-list";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { Avatar } from "@/shared/ui/avatar";

export function SettingsPage() {
  const user = useAuthStore((state: AuthState) => state.user);
  const setModalState = useUiStore((state: UiState) => state.setModalState);

  if (!user) return null;

  return (
    <div className="page-shell bg-[var(--color-background)]">
      <header className="top-bar border-b-0">
        <h1 className="screen-title">Настройки</h1>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-8">
        <button
          type="button"
          onClick={() => setModalState("profile")}
          className="mb-4 flex min-h-[96px] w-full items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left hover:bg-[var(--color-surface-secondary)]"
        >
          <Avatar src={user.avatarUrl} name={user.name} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[17px] font-semibold">{user.name}</span>
            <span className="mt-1 block text-[12px] text-[var(--color-text-secondary)]">
              {user.phone}
            </span>
            <span className="mt-1 block truncate text-[12px] text-[var(--color-text-secondary)]">
              {user.about || "Добавьте информацию о себе"}
            </span>
          </span>
          <ChevronRight aria-hidden="true" size={19} className="text-[var(--color-text-muted)]" />
        </button>
        <SettingsList />
      </div>
      <AutoDeleteSheet />
      <ProfileSheet />
      <InfoSheet />
    </div>
  );
}
