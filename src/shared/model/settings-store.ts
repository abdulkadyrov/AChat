import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  notificationsEnabled: boolean;
  groupNotifications: boolean;
  directNotifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  messagePreviewEnabled: boolean;
  lastSeenVisibility: "family" | "nobody";
  photoVisibility: "family" | "nobody";
  appLockEnabled: boolean;
  fontSize: "small" | "normal" | "large";
  setSetting: <Key extends keyof Omit<SettingsState, "setSetting">>(
    key: Key,
    value: SettingsState[Key]
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      groupNotifications: true,
      directNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      messagePreviewEnabled: false,
      lastSeenVisibility: "family",
      photoVisibility: "family",
      appLockEnabled: false,
      fontSize: "normal",
      setSetting: (key, value) => set({ [key]: value } as Partial<SettingsState>)
    }),
    {
      name: "achat-settings",
      partialize: ({ setSetting: _setSetting, ...settings }) => settings
    }
  )
);
