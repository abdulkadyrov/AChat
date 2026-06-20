import { Outlet } from "react-router-dom";
import { AppShell } from "@/widgets/app-shell/ui/app-shell";
import { useUiStore } from "@/shared/model/ui-store";

export function RootLayout() {
  const theme = useUiStore((state) => state.theme);

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen bg-canvas bg-paper text-ink transition-colors dark:bg-canvas-dark dark:bg-night dark:text-ink-inverse">
        <AppShell>
          <Outlet />
        </AppShell>
      </div>
    </div>
  );
}
