import { ChevronRight } from "lucide-react";
import { SectionCard } from "@/shared/ui/section-card";
import { useSettingsSections } from "@/features/settings/model/use-settings-sections";
import { useUiStore } from "@/shared/model/ui-store";

export function SettingsList() {
  const items = useSettingsSections();
  const setModalState = useUiStore((state) => state.setModalState);
  const setTheme = useUiStore((state) => state.setTheme);
  const theme = useUiStore((state) => state.theme);

  return (
    <SectionCard className="overflow-hidden p-0">
      <div className="divide-y divide-slate-200/70 dark:divide-white/10">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === "Автоудаление сообщений") setModalState("auto-delete");
                if (item.label === "Тема") setTheme(theme === "light" ? "dark" : "light");
              }}
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
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Выйти из аккаунта
        </button>
      </div>
    </SectionCard>
  );
}
