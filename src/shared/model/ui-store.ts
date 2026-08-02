import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MessageTTL, ThemeMode } from "@/shared/types/domain";

export interface UiState {
  theme: ThemeMode;
  replyTo: string | null;
  toast: string | null;
  modalState:
    | null
    | "auto-delete"
    | "profile"
    | "notifications"
    | "privacy"
    | "theme"
    | "language"
    | "chats"
    | "account"
    | "security"
    | "about"
    | "chat-settings";
  messageTtl: MessageTTL;
  setTheme: (theme: ThemeMode) => void;
  setReplyTo: (messageId: string | null) => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  setModalState: (value: UiState["modalState"]) => void;
  setMessageTtl: (value: MessageTTL) => void;
  resetUi: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      replyTo: null,
      toast: null,
      modalState: null,
      messageTtl: "7d",
      setTheme: (theme) => set({ theme }),
      setReplyTo: (replyTo) => set({ replyTo }),
      showToast: (toast) => set({ toast }),
      clearToast: () => set({ toast: null }),
      setModalState: (modalState) => set({ modalState }),
      setMessageTtl: (messageTtl) => set({ messageTtl }),
      resetUi: () =>
        set({
          theme: "system",
          replyTo: null,
          toast: null,
          modalState: null,
          messageTtl: "7d"
        })
    }),
    {
      name: "achat-ui",
      partialize: (state) => ({
        theme: state.theme,
        messageTtl: state.messageTtl
      })
    }
  )
);
