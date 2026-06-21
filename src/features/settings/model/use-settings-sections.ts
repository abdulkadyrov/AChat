import {
  Bell,
  Info,
  Lock,
  MoonStar,
  ShieldAlert,
  Trash2,
  UserRound,
  UsersRound
} from "lucide-react";
import { useUiStore, type UiState } from "@/shared/model/ui-store";

export function useSettingsSections() {
  const theme = useUiStore((state: UiState) => state.theme);
  const messageTtl = useUiStore((state: UiState) => state.messageTtl);

  return [
    { label: "Профиль", icon: UserRound, value: "" },
    { label: "Семья", icon: UsersRound, value: "" },
    { label: "Уведомления", icon: Bell, value: "" },
    {
      label: "Автоудаление сообщений",
      icon: Trash2,
      value: messageTtl === "off" ? "Выкл" : messageTtl === "24h" ? "24 часа" : messageTtl === "7d" ? "7 дней" : "30 дней"
    },
    { label: "Тема", icon: MoonStar, value: theme === "light" ? "Светлая" : "Тёмная" },
    { label: "Безопасность", icon: ShieldAlert, value: "" },
    { label: "О приложении", icon: Info, value: "" },
    { label: "Сквозное шифрование", icon: Lock, value: "AES-256-GCM" }
  ];
}
