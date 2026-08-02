import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AuthPage } from "@/pages/auth/ui/auth-page";
import { useAuthStore, type AuthState } from "@/shared/model/auth-store";
import { applyTheme } from "@/shared/lib/theme/apply-theme";
import { ensureSupabaseIdentity } from "@/shared/lib/supabase/messaging";
import { isSupabaseConfigured } from "@/shared/config/env";
import { useChatStore, type ChatState } from "@/shared/model/chat-store";
import { useUiStore, type UiState } from "@/shared/model/ui-store";
import { AppShell } from "@/widgets/app-shell/ui/app-shell";

export function RootLayout() {
  const theme = useUiStore((state: UiState) => state.theme);
  const user = useAuthStore((state: AuthState) => state.user);
  const setRemoteUserId = useAuthStore((state: AuthState) => state.setRemoteUserId);
  const hydrateChats = useChatStore((state: ChatState) => state.hydrateChats);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    if (!isSupabaseConfigured) {
      hydrateChats(user).catch(() => undefined);
    } else {
      ensureSupabaseIdentity(user)
        .then((remoteUserId) => {
          if (!active) return;
          setRemoteUserId(remoteUserId);
          return hydrateChats({ ...user, id: remoteUserId });
        })
        .catch(() => hydrateChats(user));
    }

    return () => {
      active = false;
    };
  }, [hydrateChats, setRemoteUserId, user]);

  return (
    <div>
      <div className="app-viewport">
        {user ? (
          <AppShell>
            <Outlet />
          </AppShell>
        ) : (
          <AuthPage />
        )}
      </div>
    </div>
  );
}
