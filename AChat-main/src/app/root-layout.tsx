import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { AuthPage } from "@/pages/auth/ui/auth-page";
import { useAuthStore } from "@/shared/model/auth-store";
import { applyTheme } from "@/shared/lib/theme/apply-theme";
import { ensureSupabaseIdentity } from "@/shared/lib/supabase/messaging";
import { useChatStore } from "@/shared/model/chat-store";
import { useUiStore } from "@/shared/model/ui-store";
import { AppShell } from "@/widgets/app-shell/ui/app-shell";

export function RootLayout() {
  const theme = useUiStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const setRemoteUserId = useAuthStore((state) => state.setRemoteUserId);
  const hydrateChats = useChatStore((state) => state.hydrateChats);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    ensureSupabaseIdentity(user)
      .then((remoteUserId) => {
        if (!active) return;
        setRemoteUserId(remoteUserId);
        return hydrateChats({ ...user, id: remoteUserId });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [hydrateChats, setRemoteUserId, user]);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-canvas bg-paper text-ink transition-colors dark:bg-canvas-dark dark:bg-night dark:text-ink-inverse">
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
