import { create } from "zustand";
import type { AuthSession, UserProfile } from "@/shared/types/domain";
import { currentUser, demoSession } from "@/shared/mocks/demo-data";

interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  setSession: (user: UserProfile, session: AuthSession) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: currentUser,
  session: demoSession,
  setSession: (user, session) => set({ user, session }),
  signOut: () => set({ user: null, session: null })
}));
