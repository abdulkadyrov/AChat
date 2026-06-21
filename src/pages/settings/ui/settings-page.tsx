import { AutoDeleteSheet } from "@/features/settings/ui/auto-delete-sheet";
import { InfoSheet } from "@/features/settings/ui/info-sheet";
import { ProfileSheet } from "@/features/settings/ui/profile-sheet";
import { SettingsList } from "@/features/settings/ui/settings-list";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { SectionCard } from "@/shared/ui/section-card";

export function SettingsPage() {
  const user = useAuthStore((state: AuthState) => state.user);

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div>
          <h1 className="screen-title">Настройки</h1>
          <p className="subtle-text mt-1">Профиль, безопасность и локальные параметры приложения.</p>
        </div>
        <SectionCard className="flex items-center gap-4">
          <img
            src={user?.avatarUrl}
            alt=""
            className="h-16 w-16 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-[-0.03em]">{user?.name}</p>
            <p className="subtle-text">{user?.phone}</p>
            <p className="mt-1 text-sm">{user?.about}</p>
          </div>
        </SectionCard>
        <SettingsList />
      </div>
      <AutoDeleteSheet />
      <ProfileSheet />
      <InfoSheet />
    </>
  );
}
