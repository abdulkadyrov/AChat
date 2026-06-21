import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MessageTTL, ThemeMode } from "@/shared/types/domain";

interface UiState {
  theme: ThemeMode;
  replyTo: string | null;
  modalState:
    | null
    | "auto-delete"
    | "qr"
    | "profile"
    | "notifications"
    | "security"
    | "about"
    | "chat-settings";
  messageTtl: MessageTTL;
  setTheme: (theme: ThemeMode) => void;
  setReplyTo: (messageId: string | null) => void;
  setModalState: (value: UiState["modalState"]) => void;
  setMessageTtl: (value: MessageTTL) => void;
  resetUi: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      replyTo: null,
      modalState: null,
      messageTtl: "7d",
      setTheme: (theme) => set({ theme }),
      setReplyTo: (replyTo) => set({ replyTo }),
      setModalState: (modalState) => set({ modalState }),
      setMessageTtl: (messageTtl) => set({ messageTtl }),
      resetUi: () =>
        set({
          theme: "light",
          replyTo: null,
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
