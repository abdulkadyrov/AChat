import { useAuthStore } from "@/shared/model/auth-store";
import { SettingsList } from "@/features/settings/ui/settings-list";
import { SectionCard } from "@/shared/ui/section-card";
import { AutoDeleteSheet } from "@/features/settings/ui/auto-delete-sheet";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div>
          <h1 className="screen-title">Настройки</h1>
          <p className="subtle-text mt-1">Управление профилем, безопасностью и TTL сообщений.</p>
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
    </>
  );
}
