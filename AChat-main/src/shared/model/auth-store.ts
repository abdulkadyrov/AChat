import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthSession, UserProfile } from "@/shared/types/domain";

interface AuthState {
  user: UserProfile | null;
  session: AuthSession | null;
  setSession: (user: UserProfile, session: AuthSession) => void;
  setRemoteUserId: (userId: string) => void;
  signInLocal: (payload: { name: string; phone: string; about: string }) => void;
  updateProfile: (payload: {
    name: string;
    phone: string;
    about: string;
    avatarUrl?: string;
  }) => void;
  signOut: () => void;
}

function buildLocalSession(): AuthSession {
  return {
    accessToken: `local-access-${crypto.randomUUID()}`,
    refreshToken: `local-refresh-${crypto.randomUUID()}`,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7
  };
}

function buildAvatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      setSession: (user, session) => set({ user, session }),
      setRemoteUserId: (userId) =>
        set((state) => ({
          user: state.user ? { ...state.user, id: userId } : state.user
        })),
      signInLocal: ({ name, phone, about }) =>
        set({
          user: {
            id: crypto.randomUUID(),
            name: name.trim(),
            phone: phone.trim(),
            about: about.trim(),
            avatarUrl: buildAvatarUrl(name.trim()),
            createdAt: new Date().toISOString()
          },
          session: buildLocalSession()
        }),
      updateProfile: ({ name, phone, about, avatarUrl }) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                name: name.trim(),
                phone: phone.trim(),
                about: about.trim(),
                avatarUrl: avatarUrl?.trim() || buildAvatarUrl(name.trim())
              }
            : state.user
        })),
      signOut: () => set({ user: null, session: null })
    }),
    {
      name: "achat-auth",
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
);
