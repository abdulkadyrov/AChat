import { create } from "zustand";
import type { MessageTTL, ThemeMode } from "@/shared/types/domain";

interface UiState {
  theme: ThemeMode;
  replyTo: string | null;
  modalState: null | "auto-delete" | "qr";
  messageTtl: MessageTTL;
  setTheme: (theme: ThemeMode) => void;
  setReplyTo: (messageId: string | null) => void;
  setModalState: (value: UiState["modalState"]) => void;
  setMessageTtl: (value: MessageTTL) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: "light",
  replyTo: null,
  modalState: null,
  messageTtl: "7d",
  setTheme: (theme) => set({ theme }),
  setReplyTo: (replyTo) => set({ replyTo }),
  setModalState: (modalState) => set({ modalState }),
  setMessageTtl: (messageTtl) => set({ messageTtl })
}));
